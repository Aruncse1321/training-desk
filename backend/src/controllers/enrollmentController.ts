import { Request, Response } from "express";
import * as svc from "../services/enrollmentService";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

const idParam = (req: Request) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError(400, "Invalid id");
  return id;
};

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, company, sessionIds } = req.body ?? {};
  if (!name?.trim()) throw new AppError(400, "Name is required");
  if (!company?.trim()) throw new AppError(400, "Company is required");
  if (!/^\S+@\S+\.\S+$/.test(email ?? "")) throw new AppError(400, "A valid email is required");
  if (!Array.isArray(sessionIds) || sessionIds.length === 0) throw new AppError(400, "Pick at least one session");

  const ids = [...new Set(sessionIds.map(Number))];
  if (ids.some((n) => !Number.isInteger(n))) throw new AppError(400, "Invalid session id");

  res.status(201).json(await svc.enroll({ name, email, company, sessionIds: ids }));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { search, sessionId, status } = req.query;
  const allowed = ["confirmed", "waitlisted", "offered", "cancelled"];
  if (status && !allowed.includes(String(status))) throw new AppError(400, "Invalid status");
  res.json(
    await svc.list({
      search: search ? String(search) : undefined,
      sessionId: sessionId ? Number(sessionId) : undefined,
      status: status ? String(status) : undefined,
    })
  );
});

export const cancel = asyncHandler(async (req, res) => res.json(await svc.cancel(idParam(req))));
export const decline = asyncHandler(async (req, res) => res.json(await svc.decline(idParam(req))));
export const accept = asyncHandler(async (req, res) => res.json(await svc.accept(idParam(req))));