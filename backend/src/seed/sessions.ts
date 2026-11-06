import { env } from "../config/env";
import { Session } from "../models";

const at = (time: string) => new Date(`${env.sessionDate}T${time}:00+05:30`);

const data = [
  { name: "HTML and CSS", room: "A", capacity: 8, price: 2000, start: "09:00", end: "11:00" },
  { name: "React", room: "B", capacity: 6, price: 4000, start: "09:30", end: "12:00" },
  { name: "Testing", room: "A", capacity: 6, price: 3000, start: "13:00", end: "15:00" },
  { name: "System design", room: "B", capacity: 4, price: 5000, start: "15:30", end: "17:30" },
];

export async function seedSessions() {
  for (const s of data) {
    await Session.findOrCreate({
      where: { name: s.name },
      defaults: {
        room: s.room,
        capacity: s.capacity,
        price: s.price,
        startsAt: at(s.start),
        endsAt: at(s.end),
      },
    });
  }
}