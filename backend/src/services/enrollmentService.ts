import { Op, Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { Enrollment, Person, Session } from "../models";
import { AppError } from "../utils/AppError";
import {
  calculatePrice, decideStatus, findClash, hasFreeSeat, nextToOffer, normalizeCompany,
} from "../rules";

const ACTIVE = ["confirmed", "waitlisted", "offered"] as const;

/* ---------- helpers ---------- */

async function lockSession(id: number, t: Transaction) {
  const s = await Session.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
  if (!s) throw new AppError(404, "Session not found");
  return s;
}

async function confirmedSessionsOf(personId: number, t: Transaction) {
  const rows = await Enrollment.findAll({
    where: { personId, status: "confirmed" }, include: [Session], transaction: t,
  });
  return rows.map((r) => r.Session!);
}

async function confirmedColleagues(sessionId: number, company: string, t: Transaction) {
  const rows = await Enrollment.findAll({
    where: { sessionId, status: "confirmed" }, include: [Person], transaction: t,
  });
  const key = normalizeCompany(company);
  return rows.filter((r) => normalizeCompany(r.Person!.company) === key).length;
}

async function offerNext(session: Session, t: Transaction) {
  const all = await Enrollment.findAll({ where: { sessionId: session.id }, transaction: t });
  if (!hasFreeSeat(session.capacity, all)) return null;
  const next = nextToOffer(all);
  if (!next) return null;
  const row = all.find((e) => e.id === next.id)!;
  await row.update({ status: "offered", offeredAt: new Date() }, { transaction: t });
  return row;
}

function clashError(clash: Session) {
  return new AppError(409, `Clashes with ${clash.name}`, {
    clashesWith: { id: clash.id, name: clash.name, startsAt: clash.startsAt, endsAt: clash.endsAt },
  });
}

/* ---------- enroll ---------- */

export interface EnrollInput { name: string; email: string; company: string; sessionIds: number[] }

async function enrollOne(person: Person, sessionId: number) {
  return sequelize.transaction(async (t) => {
    const session = await lockSession(sessionId, t);

    const existing = await Enrollment.findOne({
      where: { personId: person.id, sessionId, status: { [Op.in]: [...ACTIVE] } }, transaction: t,
    });
    if (existing) throw new AppError(409, `Already ${existing.status} in ${session.name}`);

    const clash = findClash(session, await confirmedSessionsOf(person.id, t));
    if (clash) throw clashError(clash as Session);

    const all = await Enrollment.findAll({ where: { sessionId }, transaction: t });
    const status = decideStatus(session.capacity, all);
    const enrolledAt = new Date();

    if (status === "waitlisted") {
      return Enrollment.create({ personId: person.id, sessionId, status, enrolledAt }, { transaction: t });
    }

    const count = (await confirmedColleagues(sessionId, person.company, t)) + 1; // include this person
    const price = calculatePrice({
      basePrice: session.price, sessionStart: session.startsAt, enrolledAt, companyConfirmedCount: count,
    });
    return Enrollment.create(
      {
        personId: person.id, sessionId, status, enrolledAt, confirmedAt: enrolledAt,
        originalPrice: price.originalPrice, discountName: price.discountName,
        discountAmount: price.discountAmount, amountDue: price.amountDue,
      },
      { transaction: t }
    );
  });
}

export async function enroll(input: EnrollInput) {
  const email = input.email.trim().toLowerCase();
  const company = input.company.trim().replace(/\s+/g, " ");
  const name = input.name.trim();

  let person = await Person.findOne({ where: { email } });
  if (!person) {
    person = await Person.create({ name, email, company });
  } else if (normalizeCompany(person.company) !== normalizeCompany(company)) {
    throw new AppError(409, `${email} is already registered under company "${person.company}"`);
  }

  const results = [];
  for (const sessionId of input.sessionIds) {
    try {
      const e = await enrollOne(person, sessionId);
      results.push({ sessionId, ok: true, enrollment: e });
    } catch (err) {
      if (err instanceof AppError) {
        results.push({ sessionId, ok: false, message: err.message, details: err.details });
      } else throw err;
    }
  }
  return { person, results };
}

/* ---------- cancel / decline ---------- */

async function releaseSeat(id: number, allowed: string[], notAllowedMsg: string) {
  return sequelize.transaction(async (t) => {
    const first = await Enrollment.findByPk(id, { transaction: t });
    if (!first) throw new AppError(404, "Enrollment not found");
    const session = await lockSession(first.sessionId, t);

    const e = await Enrollment.findByPk(id, { transaction: t }); // re-read under the lock
    if (!allowed.includes(e!.status)) throw new AppError(400, notAllowedMsg);

    const heldSeat = e!.status === "confirmed" || e!.status === "offered";
    await e!.update({ status: "cancelled" }, { transaction: t });

    const offered = heldSeat ? await offerNext(session, t) : null;
    return { cancelled: e!, offered };
  });
}

export const cancel = (id: number) =>
  releaseSeat(id, ["confirmed", "waitlisted", "offered"], "Enrollment is already cancelled");

export const decline = (id: number) =>
  releaseSeat(id, ["offered"], "Only an offered seat can be declined");

/* ---------- accept offer ---------- */

export async function accept(id: number) {
  return sequelize.transaction(async (t) => {
    const first = await Enrollment.findByPk(id, { transaction: t });
    if (!first) throw new AppError(404, "Enrollment not found");
    const session = await lockSession(first.sessionId, t);

    const e = (await Enrollment.findByPk(id, { include: [Person], transaction: t }))!;
    if (e.status !== "offered") throw new AppError(400, "Only an offered seat can be accepted");

    const clash = findClash(session, await confirmedSessionsOf(e.personId, t));
    if (clash) throw clashError(clash as Session);

    const count = (await confirmedColleagues(session.id, e.Person!.company, t)) + 1;
    const price = calculatePrice({
      basePrice: session.price,
      sessionStart: session.startsAt,
      enrolledAt: e.enrolledAt,            // original date, not today
      companyConfirmedCount: count,
    });

    await e.update(
      {
        status: "confirmed", confirmedAt: new Date(),
        originalPrice: price.originalPrice, discountName: price.discountName,
        discountAmount: price.discountAmount, amountDue: price.amountDue,
      },
      { transaction: t }
    );
    return e;
  });
}

/* ---------- list ---------- */

export interface ListFilters { search?: string; sessionId?: number; status?: string }

export async function list(f: ListFilters) {
  const where: any = {};
  if (f.sessionId) where.sessionId = f.sessionId;
  if (f.status) where.status = f.status;
  if (f.search) {
    const like = { [Op.like]: `%${f.search.trim()}%` };
    where[Op.or] = [{ "$Person.name$": like }, { "$Person.email$": like }, { "$Person.company$": like }];
  }
  const rows = await Enrollment.findAll({
    where, include: [Person, Session], order: [["sessionId", "ASC"], ["enrolledAt", "ASC"], ["id", "ASC"]],
  });

  return rows.map((e) => ({
    id: e.id,
    status: e.status,
    enrolledAt: e.enrolledAt,
    offeredAt: e.offeredAt,
    confirmedAt: e.confirmedAt,
    person: { id: e.Person!.id, name: e.Person!.name, email: e.Person!.email, company: e.Person!.company },
    session: { id: e.Session!.id, name: e.Session!.name, room: e.Session!.room },
    price:
      e.status === "confirmed"
        ? { original: e.originalPrice, discountName: e.discountName, discountAmount: e.discountAmount, amountDue: e.amountDue }
        : null,
  }));
}