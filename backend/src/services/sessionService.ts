import { Enrollment, Session } from "../models";
import { seatsTaken } from "../rules";

export async function listSessions() {
  const sessions = await Session.findAll({ order: [["startsAt", "ASC"]] });
  const enrollments = await Enrollment.findAll();
  return sessions.map((s) => {
    const mine = enrollments.filter((e) => e.sessionId === s.id);
    const taken = seatsTaken(mine);
    return {
      id: s.id, name: s.name, room: s.room, price: s.price,
      startsAt: s.startsAt, endsAt: s.endsAt, capacity: s.capacity,
      seatsTaken: taken,
      seatsLeft: s.capacity - taken,
      waitlisted: mine.filter((e) => e.status === "waitlisted").length,
      full: taken >= s.capacity,
    };
  });
}