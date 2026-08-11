import { apiClient } from "./client";
import { ApiResponse, Challan } from "../types";

export interface ChallanFilters {
  status?: string;
  customerId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listChallans(filters: ChallanFilters = {}) {
  const res = await apiClient.get<ApiResponse<Challan[]>>("/challans", { params: filters });
  return res.data;
}

export async function getChallan(id: string) {
  const res = await apiClient.get<ApiResponse<Challan>>(`/challans/${id}`);
  return res.data.data;
}

export async function createChallan(payload: {
  customerId: string;
  status: "DRAFT" | "CONFIRMED";
  items: { productId: string; quantity: number }[];
}) {
  const res = await apiClient.post<ApiResponse<Challan>>("/challans", payload);
  return res.data.data;
}

export async function confirmChallan(id: string) {
  const res = await apiClient.post<ApiResponse<Challan>>(`/challans/${id}/confirm`);
  return res.data.data;
}

export async function cancelChallan(id: string) {
  const res = await apiClient.post<ApiResponse<Challan>>(`/challans/${id}/cancel`);
  return res.data.data;
}
