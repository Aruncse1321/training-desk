import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";


export type EnrollmentStatus = "confirmed" | "waitlisted" | "offered" | "cancelled";

export class Enrollment extends Model {
    declare id: number;
    declare personId: number;
    declare sessionId: number;
    declare status: EnrollmentStatus;
    declare enrolledAt: Date;          // original request time, orders the waitlist
    declare offeredAt: Date | null;
    declare confirmedAt: Date | null;
    declare originalPrice: number | null;
    declare discountName: string | null;
    declare discountAmount: number | null;
    declare amountDue: number | null;
    declare Person?: import("./Person").Person;
    declare Session?: import("./Session").Session;
}

Enrollment.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        personId: { type: DataTypes.INTEGER, allowNull: false },
        sessionId: { type: DataTypes.INTEGER, allowNull: false },
        status: {
            type: DataTypes.ENUM("confirmed", "waitlisted", "offered", "cancelled"),
            allowNull: false,
        },
        enrolledAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        offeredAt: { type: DataTypes.DATE, allowNull: true },
        confirmedAt: { type: DataTypes.DATE, allowNull: true },
        originalPrice: { type: DataTypes.INTEGER, allowNull: true },
        discountName: { type: DataTypes.STRING, allowNull: true },
        discountAmount: { type: DataTypes.INTEGER, allowNull: true },
        amountDue: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
        sequelize,
        tableName: "enrollments",
        indexes: [{ fields: ["sessionId", "status"] }, { fields: ["personId"] }],
    }
);