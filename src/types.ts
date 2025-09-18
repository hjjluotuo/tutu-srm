// 基础类型定义
export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  category: string;
  specification: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  email?: string;
  status: 'active' | 'inactive';
  createTime: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  email?: string;
  credit: number;
  status: 'active' | 'inactive';
  createTime: string;
}

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  status: 'pending' | 'confirmed' | 'received' | 'cancelled';
  items: PurchaseItem[];
  totalAmount: number;
  receivedAmount: number;
  createTime: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  receivedQuantity: number;
  amount: number;
}

export interface SaleOrder {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  items: SaleItem[];
  totalAmount: number;
  shippedAmount: number;
  createTime: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  shippedQuantity: number;
  batches?: Array<{
    batchId: string;
    batchNo: string;
    quantity: number;
  }>;
  amount: number;
}

export interface InventoryRecord {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjust';
  quantity: number;
  beforeStock: number;
  afterStock: number;
  reason: string;
  batchNo?: string;
  relatedOrderId?: string;
  relatedOrderNo?: string;
  operatorId: string;
  operatorName: string;
  createTime: string;
}

export interface InventoryBatch {
  id: string;
  batchNo: string;
  productId: string;
  productName: string;
  quantity: number;
  remainingQuantity: number;
  purchasePrice: number;
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string;
  purchaseOrderNo: string;
  productionDate?: string;
  expiryDate?: string;
  status: 'active' | 'exhausted' | 'expired';
  createTime: string;
}

export interface BatchMovement {
  id: string;
  batchId: string;
  batchNo: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  remainingQuantity: number;
  relatedOrderId: string;
  relatedOrderNo: string;
  relatedOrderType: 'purchase' | 'sale';
  createTime: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalSuppliers: number;
  totalCustomers: number;
  pendingPurchases: number;
  pendingSales: number;
  thisMonthPurchaseAmount: number;
  batches?: Array<{
    batchNo: string;
    quantity: number;
    productionDate?: string;
    expiryDate?: string;
  }>;
  thisMonthSaleAmount: number;
}