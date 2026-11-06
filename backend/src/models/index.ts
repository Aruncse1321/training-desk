import { Session } from "./Session";
import { Person } from "./Person";
import { Enrollment } from "./Enrollment";

Person.hasMany(Enrollment, { foreignKey: "personId" });
Enrollment.belongsTo(Person, { foreignKey: "personId" });

Session.hasMany(Enrollment, { foreignKey: "sessionId" });
Enrollment.belongsTo(Session, { foreignKey: "sessionId" });

export { Session, Person, Enrollment };