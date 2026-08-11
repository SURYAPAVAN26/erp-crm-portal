import { apiClient } from "./client";
import { ApiResponse, Customer } from "../types";

export interface CustomerFilters {
  search?: string;
  status?: string;
  customerType?: string;
  page?: number;
  pageSize?: number;
}

export async function listCustomers(filters: CustomerFilters = {}) {
  const res = await apiClient.get<ApiResponse<Customer[]>>("/customers", { params: filters });
  return res.data;
}

export async function getCustomer(id: string) {
  const res = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
  return res.data.data;
}

export async function createCustomer(payload: Partial<Customer>) {
  const res = await apiClient.post<ApiResponse<Customer>>("/customers", payload);
  return res.data.data;
}

export async function updateCustomer(id: string, payload: Partial<Customer>) {
  const res = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, payload);
  return res.data.data;
}

export async function addFollowUp(id: string, note: string, date?: string) {
  const res = await apiClient.post(`/customers/${id}/followups`, { note, date });
  return res.data.data;
}
