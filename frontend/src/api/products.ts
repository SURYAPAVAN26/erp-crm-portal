import { apiClient } from "./client";
import { ApiResponse, Product } from "../types";

export interface ProductFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
}

export async function listProducts(filters: ProductFilters = {}) {
  const res = await apiClient.get<ApiResponse<Product[]>>("/products", { params: filters });
  return res.data;
}

export async function getProduct(id: string) {
  const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  return res.data.data;
}

export async function createProduct(payload: Partial<Product>) {
  const res = await apiClient.post<ApiResponse<Product>>("/products", payload);
  return res.data.data;
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, payload);
  return res.data.data;
}

export async function recordStockMovement(
  id: string,
  payload: { quantity: number; type: "IN" | "OUT"; reason: string }
) {
  const res = await apiClient.post(`/products/${id}/stock`, payload);
  return res.data.data;
}
