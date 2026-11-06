import { request } from "./client";
import type { EnrollInput, EnrollResponse, EnrollmentRow, ListFilters, Session } from "../types";

export const getSessions = () => request<Session[]>("/sessions");

export const enroll = (input: EnrollInput) =>
  request<EnrollResponse>("/enrollments", { method: "POST", body: JSON.stringify(input) });

export const getEnrollments = (f: ListFilters = {}) => {
  const params = new URLSearchParams();
  if (f.search?.trim()) params.set("search", f.search.trim());
  if (f.sessionId) params.set("sessionId", String(f.sessionId));
  if (f.status) params.set("status", f.status);
  const qs = params.toString();
  return request<EnrollmentRow[]>(`/enrollments${qs ? `?${qs}` : ""}`);
};

export const cancelEnrollment = (id: number) => request(`/enrollments/${id}/cancel`, { method: "POST" });
export const acceptOffer = (id: number) => request(`/enrollments/${id}/accept`, { method: "POST" });
export const declineOffer = (id: number) => request(`/enrollments/${id}/decline`, { method: "POST" });