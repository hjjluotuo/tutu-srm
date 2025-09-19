import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  Eye,
  Calendar,
  User,
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Camera,
  X
} from 'lucide-react';
import { Product, InventoryRecord, InventoryBatch, BatchMovement, PurchaseOrder, SaleOrder } from '../types';
import BarcodeScanner from './BarcodeScanner';

interface InventoryManagementProps {
  products: Product[];
  inventoryRecords: InventoryRecord[];
  inventoryBatches: InventoryBatch[];
  batchMovements: BatchMovement[];
  purchaseOrders: PurchaseOrder[];
  saleOrders: SaleOrder[];
  onAddInventoryRecord: (record: Omit<InventoryRecord, 'id' | 'createTime'>) => void;
  onAddInventoryBatch: (batch: Omit<InventoryBatch, 'id' | 'createTime'>) => void;
  onUpdateInventoryBatch: (id: string, updates: Partial<InventoryBatch>) => void;
  onAddBatchMovement: (movement: Omit<BatchMovement, 'id' | 'createTime'>) => void;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({
  products,
  inventoryRecords,
  inventoryBatches,
  batchMovements,
  purchaseOrders,
  saleOrders,
  onAddInventoryRecord,
  onAddInventoryBatch,
  onUpdateInventoryBatch,
  onAddBatchMovement,
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'batches' | 'movements'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInForm, setShowInForm] = useState(false);
  const [showOutForm, setShowOutForm] = useState(false);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerType, setScannerType] = useState<'in' | 'out'>('in');

  // 入库表单数据
  const [inData, setInData] = useState({
    productId: '',
    quantity: '',
    purchaseOrderId: '',
    reason: '采购入库',
    operatorName: '系统管理员',
  });

  // 出库表单数据
  const [outData, setOutData] = useState({
    productId: '',
    quantity: '',
    saleOrderId: '',
    selectedBatches: [] as Array<{ batchId: string; quantity: number }>,
    reason: '销售出库',
    operatorName: '系统管理员',
  });

  // 调整表单数据
  const [adjustData, setAdjustData] = useState({
    productId: '',
    quantity: '',
    adjustType: 'increase' as 'increase' | 'decrease',
    reason: '库存调整',
    operatorName: '系统管理员',
  });

  const filteredRecords = inventoryRecords.filter((record) =>
    record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBatches = inventoryBatches.filter((batch) =>
    batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取可用的采购单（已确认但未完全收货）
  const availablePurchaseOrders = purchaseOrders.filter(order => 
    order.status === 'confirmed' && 
    order.items.some(item => item.receivedQuantity < item.quantity)
  );

  // 获取可用的销售单（已确认但未完全发货）
  const availableSaleOrders = saleOrders.filter(order => 
    order.status === 'confirmed' && 
    order.items.some(item => item.shippedQuantity < item.quantity)
  );

  // 生成批次号：商品编码-年月日-时分-随机2位
  const generateBatchNo = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return '';
    
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${product.code}-${year}${month}${day}-${hour}${minute}-${random}`;
  };

  // 获取商品的可用批次（FIFO排序）
  const getAvailableBatches = (productId: string) => {
    return inventoryBatches
      .filter(batch => 
        batch.productId === productId && 
        batch.remainingQuantity > 0 && 
        batch.status === 'active'
      )
      .sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
  };

  // 处理条码扫描
  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.code === barcode);
    if (product) {
      if (scannerType === 'in') {
        setInData(prev => ({ ...prev, productId: product.id }));
      } else {
        setOutData(prev => ({ ...prev, productId: product.id }));
      }
    } else {
      alert('未找到对应的商品！');
    }
    setShowScanner(false);
  };

  // 入库处理
  const handleInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === inData.productId);
    if (!product) return;

    const quantity = parseInt(inData.quantity);
    const beforeStock = product.stock;
    const afterStock = beforeStock + quantity;

    // 获取采购订单信息
    let relatedOrderNo = '';
    let supplierInfo = null;
    
    if (inData.purchaseOrderId) {
      const purchaseOrder = purchaseOrders.find(o => o.id === inData.purchaseOrderId);
      if (purchaseOrder) {
        relatedOrderNo = purchaseOrder.orderNo;
        supplierInfo = {
          supplierId: purchaseOrder.supplierId,
          supplierName: purchaseOrder.supplierName
        };
      }
    }

    // 生成批次号
    const batchNo = generateBatchNo(inData.productId);

    const newRecord = {
      productId: inData.productId,
      productName: product.name,
      type: 'in' as const,
      quantity,
      beforeStock,
      afterStock,
      reason: inData.reason,
      batchNo,
      relatedOrderId: inData.purchaseOrderId || undefined,
      relatedOrderNo: relatedOrderNo || undefined,
      operatorId: 'current-user',
      operatorName: inData.operatorName,
    };

    onAddInventoryRecord(newRecord);

    // 创建批次记录
    const newBatch = {
      batchNo,
      productId: inData.productId,
      productName: product.name,
      quantity,
      remainingQuantity: quantity,
      purchasePrice: product.purchasePrice,
      supplierId: supplierInfo?.supplierId || 'manual',
      supplierName: supplierInfo?.supplierName || '手动入库',
      purchaseOrderId: inData.purchaseOrderId || 'manual',
      purchaseOrderNo: relatedOrderNo || '手动入库',
      status: 'active' as const,
    };
    
    onAddInventoryBatch(newBatch);
    
    // 创建批次移动记录
    const newMovement = {
      batchId: Date.now().toString(),
      batchNo,
      productId: inData.productId,
      type: 'in' as const,
      quantity,
      remainingQuantity: quantity,
      relatedOrderId: inData.purchaseOrderId || 'manual',
      relatedOrderNo: relatedOrderNo || '手动入库',
      relatedOrderType: 'purchase' as const,
    };
    
    onAddBatchMovement(newMovement);

    resetInForm();
  };

  // 出库处理
  const handleOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === outData.productId);
    if (!product) return;

    const quantity = parseInt(outData.quantity);
    const beforeStock = product.stock;
    const afterStock = beforeStock - quantity;

    if (afterStock < 0) {
      alert('库存不足！');
      return;
    }

    // 获取销售订单信息
    let relatedOrderNo = '';
    
    if (outData.saleOrderId) {
      const saleOrder = saleOrders.find(o => o.id === outData.saleOrderId);
      if (saleOrder) {
        relatedOrderNo = saleOrder.orderNo;
      }
    }

    // 自动分配批次（FIFO）
    const availableBatches = getAvailableBatches(outData.productId);
    let remainingQuantity = quantity;
    const usedBatches: Array<{ batchId: string; batchNo: string; quantity: number }> = [];

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;
      
      const useQuantity = Math.min(remainingQuantity, batch.remainingQuantity);
      usedBatches.push({
        batchId: batch.id,
        batchNo: batch.batchNo,
        quantity: useQuantity,
      });
      
      // 更新批次剩余数量
      const newRemainingQuantity = batch.remainingQuantity - useQuantity;
      onUpdateInventoryBatch(batch.id, { 
        remainingQuantity: newRemainingQuantity,
        status: newRemainingQuantity === 0 ? 'exhausted' : 'active'
      });
      
      remainingQuantity -= useQuantity;

      // 添加批次移动记录
      const newMovement = {
        batchId: batch.id,
        batchNo: batch.batchNo,
        productId: outData.productId,
        type: 'out' as const,
        quantity: useQuantity,
        remainingQuantity: newRemainingQuantity,
        relatedOrderId: outData.saleOrderId || 'manual',
        relatedOrderNo: relatedOrderNo || '手动出库',
        relatedOrderType: 'sale' as const,
      };
      onAddBatchMovement(newMovement);
    }

    const newRecord = {
      productId: outData.productId,
      productName: product.name,
      type: 'out' as const,
      quantity: -quantity,
      beforeStock,
      afterStock,
      reason: outData.reason,
      batchNo: usedBatches.map(b => b.batchNo).join(', '),
      relatedOrderId: outData.saleOrderId || undefined,
      relatedOrderNo: relatedOrderNo || undefined,
      operatorId: 'current-user',
      operatorName: outData.operatorName,
    };

    onAddInventoryRecord(newRecord);
    resetOutForm();
  };

  // 调整处理
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === adjustData.productId);
    if (!product) return;

    const quantity = parseInt(adjustData.quantity);
    const adjustQuantity = adjustData.adjustType === 'increase' ? quantity : -quantity;
    const beforeStock = product.stock;
    const afterStock = beforeStock + adjustQuantity;

    if (afterStock < 0) {
      alert('调整后库存不能为负数！');
      return;
    }

    const newRecord = {
      productId: adjustData.productId,
      productName: product.name,
      type: 'adjust' as const,
      quantity: adjustQuantity,
      beforeStock,
      afterStock,
      reason: adjustData.reason,
      operatorId: 'current-user',
      operatorName: adjustData.operatorName,
    };

    onAddInventoryRecord(newRecord);

    // 如果是增加库存，创建调整批次
    if (adjustData.adjustType === 'increase') {
      const batchNo = generateBatchNo(adjustData.productId);
      
      const newBatch = {
        batchNo,
        productId: adjustData.productId,
        productName: product.name,
        quantity,
        remainingQuantity: quantity,
        purchasePrice: product.purchasePrice,
        supplierId: 'adjust',
        supplierName: '库存调整',
        purchaseOrderId: 'adjust',
        purchaseOrderNo: '库存调整',
        status: 'active' as const,
      };
      
      onAddInventoryBatch(newBatch);
    }

    resetAdjustForm();
  };

  const resetInForm = () => {
    setInData({
      productId: '',
      quantity: '',
      purchaseOrderId: '',
      reason: '采购入库',
      operatorName: '系统管理员',
    });
    setShowInForm(false);
  };

  const resetOutForm = () => {
    setOutData({
      productId: '',
      quantity: '',
      saleOrderId: '',
      selectedBatches: [],
      reason: '销售出库',
      operatorName: '系统管理员',
    });
    setShowOutForm(false);
  };

  const resetAdjustForm = () => {
    setAdjustData({
      productId: '',
      quantity: '',
      adjustType: 'increase',
      reason: '库存调整',
      operatorName: '系统管理员',
    });
    setShowAdjustForm(false);
  };

  // 获取采购单中的商品
  const getPurchaseOrderProducts = () => {
    if (!inData.purchaseOrderId) return [];
    
    const purchaseOrder = purchaseOrders.find(o => o.id === inData.purchaseOrderId);
    return purchaseOrder?.items.filter(item => item.receivedQuantity < item.quantity) || [];
  };

  // 获取销售单中的商品
  const getSaleOrderProducts = () => {
    if (!outData.saleOrderId) return [];
    
    const saleOrder = saleOrders.find(o => o.id === outData.saleOrderId);
    return saleOrder?.items.filter(item => item.shippedQuantity < item.quantity) || [];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800';
      case 'out': return 'bg-red-100 text-red-800';
      case 'adjust': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in': return TrendingUp;
      case 'out': return TrendingDown;
      case 'adjust': return RotateCcw;
      default: return Package;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'in': return '入库';
      case 'out': return '出库';
      case 'adjust': return '调整';
      default: return '未知';
    }
  };

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'exhausted': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatchStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃';
      case 'exhausted': return '已用完';
      case 'expired': return '已过期';
      default: return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">库存管理</h1>
          <p className="text-slate-600 mt-1">管理库存记录、批次信息和库存调整</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowInForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>入库</span>
          </button>
          <button
            onClick={() => setShowOutForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <TrendingDown className="h-4 w-4" />
            <span>出库</span>
          </button>
          <button
            onClick={() => setShowAdjustForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>调整</span>
          </button>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'records', label: '库存记录', icon: Package },
            { key: 'batches', label: '批次管理', icon: Archive },
            { key: 'movements', label: '批次移动', icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="搜索商品名称、批次号或操作原因..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* 库存记录 */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">商品信息</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作类型</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">数量变化</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">库存变化</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">批次/订单</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作原因</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((record) => {
                  const TypeIcon = getTypeIcon(record.type);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{record.productName}</p>
                            <p className="text-sm text-slate-500">操作员: {record.operatorName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {getTypeText(record.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${record.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {record.quantity > 0 ? '+' : ''}{record.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="text-slate-500">{record.beforeStock}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium text-slate-900">{record.afterStock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {record.batchNo && (
                            <p className="text-sm text-slate-600">批次: {record.batchNo}</p>
                          )}
                          {record.relatedOrderNo && (
                            <p className="text-sm text-slate-600">订单: {record.relatedOrderNo}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{record.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {new Date(record.createTime).toLocaleString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 批次管理 */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">批次信息</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">商品信息</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">数量信息</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">供应商</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">采购信息</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">日期信息</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Archive className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{batch.batchNo}</p>
                          <p className="text-sm text-slate-500">采购价: ¥{batch.purchasePrice}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{batch.productName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600">总量: {batch.quantity}</p>
                        <p className="text-sm text-slate-600">剩余: {batch.remainingQuantity}</p>
                        <p className="text-sm text-slate-500">
                          使用率: {Math.round(((batch.quantity - batch.remainingQuantity) / batch.quantity) * 100)}%
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-900">{batch.supplierName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{batch.purchaseOrderNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {batch.productionDate && (
                          <p className="text-sm text-slate-600">生产: {batch.productionDate}</p>
                        )}
                        {batch.expiryDate && (
                          <p className="text-sm text-slate-600">过期: {batch.expiryDate}</p>
                        )}
                        <p className="text-sm text-slate-500">
                          创建: {new Date(batch.createTime).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBatchStatusColor(batch.status)}`}>
                        {getBatchStatusText(batch.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 批次移动记录 */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">批次信息</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">移动类型</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">移动数量</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">剩余数量</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">关联订单</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">移动时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {batchMovements.map((movement) => {
                  const TypeIcon = getTypeIcon(movement.type);
                  return (
                    <tr key={movement.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <Truck className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{movement.batchNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(movement.type)}`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {getTypeText(movement.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{movement.remainingQuantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600">{movement.relatedOrderNo}</p>
                          <p className="text-xs text-slate-500">
                            {movement.relatedOrderType === 'purchase' ? '采购单' : '销售单'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {new Date(movement.createTime).toLocaleString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 入库表单 */}
      {showInForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900">商品入库</h3>
              <button
                onClick={() => setShowInForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleInSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">采购订单（可选）</label>
                  <select
                    value={inData.purchaseOrderId}
                    onChange={(e) => setInData({ ...inData, purchaseOrderId: e.target.value, productId: '' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">手动入库</option>
                    {availablePurchaseOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.orderNo} - {order.supplierName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">商品 *</label>
                  <div className="flex space-x-2">
                    <select
                      required
                      value={inData.productId}
                      onChange={(e) => setInData({ ...inData, productId: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">请选择商品</option>
                      {inData.purchaseOrderId ? (
                        getPurchaseOrderProducts().map((item) => (
                          <option key={item.productId} value={item.productId}>
                            {item.productName} (可入库: {item.quantity - item.receivedQuantity})
                          </option>
                        ))
                      ) : (
                        products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.specification}
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerType('in');
                        setShowScanner(true);
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="扫描条码"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">入库数量 *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={inData.quantity}
                    onChange={(e) => setInData({ ...inData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">操作员</label>
                  <input
                    type="text"
                    value={inData.operatorName}
                    onChange={(e) => setInData({ ...inData, operatorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">入库原因 *</label>
                <input
                  type="text"
                  required
                  value={inData.reason}
                  onChange={(e) => setInData({ ...inData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetInForm}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  确认入库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 出库表单 */}
      {showOutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900">商品出库</h3>
              <button
                onClick={() => setShowOutForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleOutSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">销售订单（可选）</label>
                  <select
                    value={outData.saleOrderId}
                    onChange={(e) => setOutData({ ...outData, saleOrderId: e.target.value, productId: '' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">手动出库</option>
                    {availableSaleOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.orderNo} - {order.customerName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">商品 *</label>
                  <div className="flex space-x-2">
                    <select
                      required
                      value={outData.productId}
                      onChange={(e) => setOutData({ ...outData, productId: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">请选择商品</option>
                      {outData.saleOrderId ? (
                        getSaleOrderProducts().map((item) => (
                          <option key={item.productId} value={item.productId}>
                            {item.productName} (可出库: {item.quantity - item.shippedQuantity})
                          </option>
                        ))
                      ) : (
                        products.filter(p => p.stock > 0).map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.specification} (库存: {product.stock})
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerType('out');
                        setShowScanner(true);
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="扫描条码"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">出库数量 *</label>
                  <input
                    type="number"
                    min="1"
                    max={outData.productId ? products.find(p => p.id === outData.productId)?.stock || 0 : undefined}
                    required
                    value={outData.quantity}
                    onChange={(e) => setOutData({ ...outData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  {outData.productId && (
                    <p className="text-sm text-slate-500 mt-1">
                      当前库存: {products.find(p => p.id === outData.productId)?.stock || 0}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">操作员</label>
                  <input
                    type="text"
                    value={outData.operatorName}
                    onChange={(e) => setOutData({ ...outData, operatorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              
              {/* 显示可用批次 */}
              {outData.productId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">可用批次（将按FIFO自动分配）</label>
                  <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg">
                    {getAvailableBatches(outData.productId).map((batch) => (
                      <div key={batch.id} className="flex justify-between items-center p-2 border-b border-slate-100 last:border-b-0">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{batch.batchNo}</p>
                          <p className="text-xs text-slate-500">
                            剩余: {batch.remainingQuantity} | 创建: {new Date(batch.createTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">出库原因 *</label>
                <input
                  type="text"
                  required
                  value={outData.reason}
                  onChange={(e) => setOutData({ ...outData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetOutForm}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  确认出库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 调整表单 */}
      {showAdjustForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900">库存调整</h3>
              <button
                onClick={() => setShowAdjustForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">商品 *</label>
                  <select
                    required
                    value={adjustData.productId}
                    onChange={(e) => setAdjustData({ ...adjustData, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择商品</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.specification} (当前库存: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">调整类型 *</label>
                  <select
                    required
                    value={adjustData.adjustType}
                    onChange={(e) => setAdjustData({ ...adjustData, adjustType: e.target.value as 'increase' | 'decrease' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="increase">增加库存</option>
                    <option value="decrease">减少库存</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">调整数量 *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustData.quantity}
                    onChange={(e) => setAdjustData({ ...adjustData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">操作员</label>
                  <input
                    type="text"
                    value={adjustData.operatorName}
                    onChange={(e) => setAdjustData({ ...adjustData, operatorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">调整原因 *</label>
                <input
                  type="text"
                  required
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="盘点差异、损耗、其他..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetAdjustForm}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  确认调整
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 条码扫描器 */}
      <BarcodeScanner
        isOpen={showScanner}
        onScan={handleBarcodeScan}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default InventoryManagement;