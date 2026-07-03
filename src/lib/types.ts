// BAHARI Intelligence — shared types for API responses and data models.

export type UserRole = "admin" | "cooperative_manager" | "operator" | "reviewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cooperativeId?: string;
}

export interface Cooperative {
  id: string;
  name: string;
  village: string;
  region: string;
  totalMembers: number;
  activeMembers: number;
  mainCommodities: string[];
  contactPerson?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaselineMetrics {
  cooperativeId: string;
  cooperativeName: string;
  totalMembers: number;
  activeMembers: number;
  activeRatio: number;
  totalVolume: number;
  totalTxValue: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  spoilageRate: number;
  marginPct: number;
  commodityCount: number;
  txCount: number;
}

export interface CommodityRecord {
  id: string;
  cooperativeId: string;
  commodityName: string;
  category: string;
  volume: string;
  unit: string;
  sourceGroup: string;
  buyPrice: string;
  expectedSellPrice: string;
  actualSellPrice?: string;
  spoilagePercentage: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRecord {
  id: string;
  cooperativeId: string;
  commodityRecordId?: string;
  buyerType: string;
  volumeSold: string;
  sellingPrice: string;
  grossValue: string;
  logisticsCost: string;
  storageCost: string;
  paymentStatus: "paid" | "pending" | "delayed";
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeasibilityResult {
  npv: number;
  irr: number | null;
  paybackPeriod: number | null;
  bcr: number;
  status: "layak" | "waspada" | "tidak_layak";
  cashFlows: number[];
  cumulativeCashFlows: number[];
  assumptions: any;
}

export interface SupplyChainAnalysisData {
  cooperativeId: string;
  perCommodity: Array<{
    record: CommodityRecord;
    analysis: {
      priceSpread: number;
      marginPerUnit: number;
      totalRevenue: number;
      totalCost: number;
      margin: number;
      marginPct: number;
      leakage: number;
      spoilageImpact: number;
      absorbedVolume: number;
      unabsorbedVolume: number;
    };
  }>;
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalMargin: number;
    totalLeakage: number;
    avgMarginPct: number;
    biggestLeakagePoint: { commodity: string; leakage: number } | null;
    valueDistribution: { fisherPrice: number; cooperativeMargin: number; buyerPrice: number };
  };
}

export interface ImpactMetrics {
  cooperativeId: string;
  cooperativeName: string;
  metrics: Record<string, {
    value: number;
    label: "aktual" | "estimasi" | "proyeksi";
    description: string;
  }>;
  memberCount: number;
  totalVolume: number;
  totalTxValue: number;
  txCount: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}
