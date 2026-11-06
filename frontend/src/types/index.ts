export type Status = "confirmed" | "waitlisted" | "offered" | "cancelled";

export interface Session {
    id: number;
    name: string;
    room: string;
    price: number;
    startsAt: string;
    endsAt: string;
    capacity: number;
    seatsTaken: number;
    seatsLeft: number;
    waitlisted: number;
    full: boolean;
}

export interface PriceBreakdown {
    original: number | null;
    discountName: string | null;
    discountAmount: number | null;
    amountDue: number | null;
}

export interface EnrollmentRow {
    id: number;
    status: Status;
    enrolledAt: string;
    offeredAt: string | null;
    confirmedAt: string | null;
    person: { id: number; name: string; email: string; company: string };
    session: { id: number; name: string; room: string };
    price: PriceBreakdown | null; // only present for confirmed people
}

export interface EnrollInput {
    name: string;
    email: string;
    company: string;
    sessionIds: number[];
}

export interface EnrollResult {
    sessionId: number;
    ok: boolean;
    enrollment?: {
        id: number;
        status: Status;
        originalPrice: number | null;
        discountName: string | null;
        discountAmount: number | null;
        amountDue: number | null;
    };
    message?: string;
    details?: { clashesWith?: { id: number; name: string; startsAt: string; endsAt: string } };
}

export interface EnrollResponse {
    person: { id: number; name: string; email: string; company: string };
    results: EnrollResult[];
}

export interface ListFilters {
    search?: string;
    sessionId?: number;
    status?: Status;
}