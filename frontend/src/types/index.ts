export type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";
export type CustomerType = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
export type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";
export type MovementType = "IN" | "OUT";
export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName?: string | null;
  gstNumber?: string | null;
  customerType: CustomerType;
  address?: string | null;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { followUps: number; challans: number };
  followUps?: FollowUp[];
  challans?: Challan[];
}

export interface FollowUp {
  id: string;
  customerId: string;
  note: string;
  date: string;
  createdAt: string;
  createdBy?: { name: string };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string | null;
  unitPrice: string | number;
  currentStock: number;
  minStockAlert: number;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  movements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: MovementType;
  reason: string;
  createdAt: string;
  createdBy?: { name: string };
}

export interface ChallanItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  productSkuSnapshot: string;
  unitPriceSnapshot: string | number;
  quantity: number;
  product?: { name: string; sku: string };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  status: ChallanStatus;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
  customer?: Customer | { id: string; name: string; businessName?: string | null };
  createdBy?: { name: string; email?: string };
  items: ChallanItem[];
  _count?: { items: number };
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface DashboardSummary {
  totalCustomers: number;
  activeLeads: number;
  totalProducts: number;
  lowStockProducts: number;
  draftChallans: number;
  confirmedChallans: number;
  recentChallans: Challan[];
}
