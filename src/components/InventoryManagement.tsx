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
  Archive
} from 'lucide-react';
import { Product, InventoryRecord, InventoryBatch, BatchMovement, PurchaseOrder, SaleOrder } from '../types';

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
  const [activeTab, setActiveTab] = useState<'records' | 'batches' | 'movements' | 'adjust'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingBatches, setViewingBatches] = useState<string | null>(null);

  const [recordData, setRecordData] = useState({
    productId: '',
    type: 'in' as 'in' | 'out' | 'adjust',
    quantity: '',
    reason: '',
    relatedOrderId: '',
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

  // 生成批次号：商品编码-年月日-3位序号
  const generateBatchNo = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return '';
    
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // 查找当天该商品的批次数量，生成序号
    const todayBatches = inventoryBatches.filter(batch => 
      batch.productId === productId && 
      batch.batchNo.includes(`${product.code}-${dateStr}`)
    );
    
    const sequence = String(todayBatches.length + 1).padStart(3, '0');
    return `${product.code}-${dateStr}-${sequence}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === recordData.productId);
    if (!product) return;

    // 验证必须选择相关订单
    if (recordData.type === 'in' && !recordData.relatedOrderId) {
      alert('采购入库必须选择采购单！');
      return;
    }
    
    if (recordData.type === 'out' && !recordData.relatedOrderId) {
      alert('销售出库必须选择销售单！');
      return;
    }

    const quantity = parseInt(recordData.quantity);
    const beforeStock = product.stock;
    const afterStock = recordData.type === 'out' ? beforeStock - quantity : beforeStock + quantity;

    // 获取相关订单信息
    let relatedOrderNo = '';
    let supplierInfo = null;
    let customerInfo = null;
    
    if (recordData.type === 'in' && recordData.relatedOrderId) {
      const purchaseOrder = purchaseOrders.find(o => o.id === recordData.relatedOrderId);
      if (purchaseOrder) {
        relatedOrderNo = purchaseOrder.orderNo;
        supplierInfo = {
          supplierId: purchaseOrder.supplierId,
          supplierName: purchaseOrder.supplierName
        };
      }
    }
    
    if (recordData.type === 'out' && recordData.relatedOrderId) {
      const saleOrder = saleOrders.find(o => o.id === recordData.relatedOrderId);
      if (saleOrder) {
        relatedOrderNo = saleOrder.orderNo;
        customerInfo = {
          customerId: saleOrder.customerId,
          customerName: saleOrder.customerName
        };
      }
    }

    // 生成批次号
    const batchNo = generateBatchNo(recordData.productId);

    const newRecord = {
      productId: recordData.productId,
      productName: product.name,
      type: recordData.type,
      quantity: recordData.type === 'out' ? -quantity : quantity,
      beforeStock,
      afterStock,
      reason: recordData.reason,
      batchNo,
      relatedOrderId: recordData.relatedOrderId || undefined,
      relatedOrderNo: relatedOrderNo || undefined,
      operatorId: 'current-user',
      operatorName: recordData.operatorName,
    };

    onAddInventoryRecord(newRecord);

    // 如果是入库，创建批次记录和批次移动记录
    if (recordData.type === 'in') {
      const newBatch = {
        batchNo,
        productId: recordData.productId,
        productName: product.name,
        quantity,
        remainingQuantity: quantity,
        purchasePrice: product.purchasePrice,
        supplierId: supplierInfo?.supplierId || 'manual',
        supplierName: supplierInfo?.supplierName || '手动入库',
        purchaseOrderId: recordData.relatedOrderId || 'manual',
        purchaseOrderNo: relatedOrderNo || '手动入库',
        status: 'active' as const,
      };
      
      onAddInventoryBatch(newBatch);
      
      // 创建批次移动记录
      const newMovement = {
        batchId: Date.now().toString(),
        batchNo,
        productId: recordData.productId,
        type: 'in' as const,
        quantity,
        remainingQuantity: quantity,
        relatedOrderId: recordData.relatedOrderId || 'manual',
        relatedOrderNo: relatedOrderNo || '手动入库',
        relatedOrderType: 'purchase' as const,
      };
      
      onAddBatchMovement(newMovement);
    }

    resetForm();
  };

  const resetForm = () => {
    setRecordData({
      productId: '',
      type: 'in',
      quantity: '',
      reason: '',
      relatedOrderId: '',
      operatorName: '系统管理员',
    });
    setShowAddForm(false);
  };

  // 根据选择的订单和商品，获取可入库数量
  const getAvailableQuantityForIn = () => {
    if (!recordData.relatedOrderId || !recordData.productId) return 0;
    
    const purchaseOrder = purchaseOrders.find(o => o.id === recordData.relatedOrderId);
    if (!purchaseOrder) return 0;
    
    const item = purchaseOrder.items.find(i => i.productId === recordData.productId);
    if (!item) return 0;
    
    return item.quantity - item.receivedQuantity;
  };

  // 根据选择的订单和商品，获取可出库数量
  const getAvailableQuantityForOut = () => {
    if (!recordData.relatedOrderId || !recordData.productId) return 0;
    
    const saleOrder = saleOrders.find(o => o.id === recordData.relatedOrderId);
    if (!saleOrder) return 0;
    
    const item = saleOrder.items.find(i => i.productId === recordData.productId);
    if (!item) return 0;
    
    return item.quantity - item.shippedQuantity;
  };

  // 获取选中订单中的商品列表
  const getOrderProducts = () => {
    if (!recordData.relatedOrderId) return [];
    
    if (recordData.type === 'in') {
      const purchaseOrder = purchaseOrders.find(o => o.id === recordData.relatedOrderId);
      return purchaseOrder?.items.filter(item => item.receivedQuantity < item.quantity) || [];
    } else if (recordData.type === 'out') {
      const saleOrder = saleOrders.find(o => o.id === recordData.relatedOrderId);
      return saleOrder?.items.filter(item => item.shippedQuantity < item.quantity) || [];
    }
    
    return [];
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
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>库存操作</span>
        </button>
      </div>

      {/* 导航标签 */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'records', label: '库存记录', icon: Package },
            { key: 'batches', label: '批次管理', icon: Archive },
            { key: 'movements', label: '批次移动', icon: Truck },
            { key: 'adjust', label: '库存调整', icon: RotateCcw },
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

      {/* 库存调整 */}
      {activeTab === 'adjust' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-center py-12">
            <RotateCcw className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg mb-2">库存调整功能</p>
            <p className="text-slate-400">用于处理盘点差异、损耗等库存调整</p>
          </div>
        </div>
      )}

      {/* 添加库存记录表单 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">库存操作</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">操作类型 *</label>
                  <select
                    required
                    value={recordData.type}
                    onChange={(e) => setRecordData({ 
                      ...recordData, 
                      type: e.target.value as 'in' | 'out' | 'adjust',
                      relatedOrderId: '', // 重置订单选择
                      productId: '' // 重置商品选择
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="in">采购入库</option>
                    <option value="out">销售出库</option>
                    <option value="adjust">库存调整</option>
                  </select>
                </div>
                
                {/* 采购入库时选择采购单 */}
                {recordData.type === 'in' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">选择采购单 *</label>
                    <select
                      required
                      value={recordData.relatedOrderId}
                      onChange={(e) => setRecordData({ 
                        ...recordData, 
                        relatedOrderId: e.target.value,
                        productId: '' // 重置商品选择
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">请选择采购单</option>
                      {availablePurchaseOrders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.orderNo} - {order.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* 销售出库时选择销售单 */}
                {recordData.type === 'out' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">选择销售单 *</label>
                    <select
                      required
                      value={recordData.relatedOrderId}
                      onChange={(e) => setRecordData({ 
                        ...recordData, 
                        relatedOrderId: e.target.value,
                        productId: '' // 重置商品选择
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">请选择销售单</option>
                      {availableSaleOrders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.orderNo} - {order.customerName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">商品 *</label>
                  <select
                    required
                    value={recordData.productId}
                    onChange={(e) => setRecordData({ ...recordData, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">请选择商品</option>
                    {recordData.type === 'adjust' ? (
                      // 库存调整时显示所有商品
                      products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.specification} (当前库存: {product.stock})
                        </option>
                      ))
                    ) : (
                      // 入库/出库时显示订单中的商品
                      getOrderProducts().map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        const availableQty = recordData.type === 'in' 
                          ? item.quantity - item.receivedQuantity
                          : item.quantity - item.shippedQuantity;
                        return (
                          <option key={item.productId} value={item.productId}>
                            {item.productName} (可操作: {availableQty})
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    数量 *
                    {recordData.type === 'in' && recordData.relatedOrderId && recordData.productId && (
                      <span className="text-sm text-green-600 ml-2">
                        (最大可入库: {getAvailableQuantityForIn()})
                      </span>
                    )}
                    {recordData.type === 'out' && recordData.relatedOrderId && recordData.productId && (
                      <span className="text-sm text-red-600 ml-2">
                        (最大可出库: {Math.min(getAvailableQuantityForOut(), products.find(p => p.id === recordData.productId)?.stock || 0)})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={
                      recordData.type === 'in' && recordData.relatedOrderId && recordData.productId
                        ? getAvailableQuantityForIn()
                        : recordData.type === 'out' && recordData.relatedOrderId && recordData.productId
                        ? Math.min(getAvailableQuantityForOut(), products.find(p => p.id === recordData.productId)?.stock || 0)
                        : undefined
                    }
                    required
                    value={recordData.quantity}
                    onChange={(e) => setRecordData({ ...recordData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">操作原因 *</label>
                <input
                  type="text"
                  required
                  value={recordData.reason}
                  onChange={(e) => setRecordData({ ...recordData, reason: e.target.value })}
                  placeholder={
                    recordData.type === 'in' ? '采购入库' :
                    recordData.type === 'out' ? '销售出库' : '库存调整'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">操作员</label>
                <input
                  type="text"
                  value={recordData.operatorName}
                  onChange={(e) => setRecordData({ ...recordData, operatorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  确认操作
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;