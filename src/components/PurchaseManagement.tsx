import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ShoppingCart, 
  Package, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Truck
} from 'lucide-react';
import { Product, Supplier, PurchaseOrder, PurchaseItem } from '../types';

interface PurchaseManagementProps {
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  onAddPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createTime'>) => void;
  onEditPurchaseOrder: (id: string, order: Partial<PurchaseOrder>) => void;
  onDeletePurchaseOrder: (id: string) => void;
  onReceivePurchase: (orderId: string, items: { productId: string; receivedQuantity: number }[]) => void;
}

const PurchaseManagement: React.FC<PurchaseManagementProps> = ({
  products,
  suppliers,
  purchaseOrders,
  onAddPurchaseOrder,
  onEditPurchaseOrder,
  onDeletePurchaseOrder,
  onReceivePurchase,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'pending' | 'received' | 'create'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);

  const [orderData, setOrderData] = useState({
    orderNo: '',
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    status: 'pending' as 'pending' | 'confirmed' | 'received' | 'cancelled',
    items: [] as Array<{
      productId: string;
      quantity: number;
      price: number;
    }>,
  });

  const [receiveData, setReceiveData] = useState<Array<{
    productId: string;
    receivedQuantity: number;
  }>>([]);

  const filteredOrders = purchaseOrders.filter((order) =>
    order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingOrders = filteredOrders.filter(order => order.status === 'pending' || order.status === 'confirmed');
  const receivedOrders = filteredOrders.filter(order => order.status === 'received');

  const generateOrderNo = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${year}${month}${day}-${random}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplier = suppliers.find(s => s.id === orderData.supplierId);
    if (!supplier) return;

    const items: PurchaseItem[] = orderData.items.map((item, index) => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: `item-${Date.now()}-${index}`,
        productId: item.productId,
        productName: product?.name || '',
        quantity: item.quantity,
        price: item.price,
        receivedQuantity: 0,
        amount: item.quantity * item.price,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    const purchaseOrder = {
      orderNo: orderData.orderNo || generateOrderNo(),
      supplierId: orderData.supplierId,
      supplierName: supplier.name,
      orderDate: orderData.orderDate,
      expectedDate: orderData.expectedDate,
      status: orderData.status,
      items,
      totalAmount,
      receivedAmount: 0,
    };

    if (editingOrder) {
      onEditPurchaseOrder(editingOrder.id, purchaseOrder);
      setEditingOrder(null);
    } else {
      onAddPurchaseOrder(purchaseOrder);
    }

    resetForm();
  };

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingOrder) return;

    onReceivePurchase(receivingOrder.id, receiveData);
    setReceivingOrder(null);
    setReceiveData([]);
    setShowReceiveForm(false);
  };

  const resetForm = () => {
    setOrderData({
      orderNo: '',
      supplierId: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: '',
      status: 'pending',
      items: [],
    });
    setEditingOrder(null);
    setShowCreateForm(false);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setOrderData({
      orderNo: order.orderNo,
      supplierId: order.supplierId,
      orderDate: order.orderDate,
      expectedDate: order.expectedDate,
      status: order.status,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
    setShowCreateForm(true);
  };

  const handleReceiveOrder = (order: PurchaseOrder) => {
    setReceivingOrder(order);
    setReceiveData(order.items.map(item => ({
      productId: item.productId,
      receivedQuantity: item.quantity - item.receivedQuantity,
    })));
    setShowReceiveForm(true);
  };

  const addOrderItem = () => {
    setOrderData({
      ...orderData,
      items: [...orderData.items, { productId: '', quantity: 1, price: 0 }],
    });
  };

  const removeOrderItem = (index: number) => {
    setOrderData({
      ...orderData,
      items: orderData.items.filter((_, i) => i !== index),
    });
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = [...orderData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // 如果选择了商品，自动填入采购价格
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].price = product.purchasePrice;
      }
    }
    
    setOrderData({ ...orderData, items: updatedItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'received': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待确认';
      case 'confirmed': return '已确认';
      case 'received': return '已收货';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">采购管理</h1>
          <p className="text-slate-600 mt-1">管理采购订单和供应商采购流程</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>新建采购单</span>
        </button>
      </div>

      {/* 导航标签 */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'orders', label: '所有订单', icon: ShoppingCart },
            { key: 'pending', label: '待处理', icon: Clock },
            { key: 'received', label: '已收货', icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
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
          placeholder="搜索采购单号或供应商..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 采购订单列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">采购单信息</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">供应商</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">日期</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">金额</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(activeTab === 'orders' ? filteredOrders : 
                activeTab === 'pending' ? pendingOrders : receivedOrders).map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{order.orderNo}</p>
                          <p className="text-sm text-slate-500">{order.items.length} 个商品</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-900">{order.supplierName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">下单: {order.orderDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">预期: {order.expectedDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 font-medium">¥{order.totalAmount.toLocaleString()}</p>
                      {order.receivedAmount > 0 && (
                        <p className="text-sm text-green-600">已收货: ¥{order.receivedAmount.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.status !== 'received' && order.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleEdit(order)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="编辑"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            {(order.status === 'confirmed' || order.status === 'pending') && (
                              <button
                                onClick={() => handleReceiveOrder(order)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                title="收货"
                              >
                                <Package className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => onDeletePurchaseOrder(order.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 创建/编辑采购单表单 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {editingOrder ? '编辑采购单' : '新建采购单'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">采购单号</label>
                  <input
                    type="text"
                    value={orderData.orderNo}
                    onChange={(e) => setOrderData({ ...orderData, orderNo: e.target.value })}
                    placeholder="留空自动生成"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">供应商</label>
                  <select
                    required
                    value={orderData.supplierId}
                    onChange={(e) => setOrderData({ ...orderData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择供应商</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">下单日期</label>
                  <input
                    type="date"
                    required
                    value={orderData.orderDate}
                    onChange={(e) => setOrderData({ ...orderData, orderDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">预期到货日期</label>
                  <input
                    type="date"
                    required
                    value={orderData.expectedDate}
                    onChange={(e) => setOrderData({ ...orderData, expectedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 采购商品 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-slate-900">采购商品</h4>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>添加商品</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border border-slate-200 rounded-lg">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">商品</label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">请选择商品</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {product.specification}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">数量</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">单价</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.price}
                          onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeOrderItem(index)}
                          className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {orderData.items.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>暂无商品，请点击"添加商品"按钮添加</p>
                  </div>
                )}
              </div>

              {/* 总金额 */}
              {orderData.items.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-slate-900">总金额:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ¥{orderData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

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
                  disabled={orderData.items.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {editingOrder ? '更新采购单' : '创建采购单'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 收货表单 */}
      {showReceiveForm && receivingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              收货确认 - {receivingOrder.orderNo}
            </h3>
            <form onSubmit={handleReceive} className="space-y-4">
              <div className="space-y-3">
                {receivingOrder.items.map((item, index) => (
                  <div key={item.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{item.productName}</p>
                        <p className="text-sm text-slate-500">
                          订购数量: {item.quantity} | 已收货: {item.receivedQuantity} | 待收货: {item.quantity - item.receivedQuantity}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">本次收货数量</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity - item.receivedQuantity}
                        value={receiveData[index]?.receivedQuantity || 0}
                        onChange={(e) => {
                          const newReceiveData = [...receiveData];
                          newReceiveData[index] = {
                            productId: item.productId,
                            receivedQuantity: parseInt(e.target.value) || 0,
                          };
                          setReceiveData(newReceiveData);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReceiveForm(false);
                    setReceivingOrder(null);
                    setReceiveData([]);
                  }}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  确认收货
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 查看订单详情 */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{viewingOrder.orderNo}</h3>
                <p className="text-slate-600">供应商: {viewingOrder.supplierName}</p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-500">下单日期</p>
                <p className="font-medium">{viewingOrder.orderDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">预期到货</p>
                <p className="font-medium">{viewingOrder.expectedDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">订单状态</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewingOrder.status)}`}>
                  {getStatusText(viewingOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500">订单金额</p>
                <p className="font-medium text-lg">¥{viewingOrder.totalAmount.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-3">商品清单</h4>
              <div className="space-y-2">
                {viewingOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-slate-500">
                        数量: {item.quantity} | 单价: ¥{item.price} | 已收货: {item.receivedQuantity}
                      </p>
                    </div>
                    <p className="font-medium">¥{item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManagement;