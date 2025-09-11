import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Package, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Truck,
  DollarSign
} from 'lucide-react';
import { Product, Customer, SaleOrder, SaleItem } from '../types';

interface SalesManagementProps {
  products: Product[];
  customers: Customer[];
  saleOrders: SaleOrder[];
  onAddSaleOrder: (order: Omit<SaleOrder, 'id' | 'createTime'>) => void;
  onEditSaleOrder: (id: string, order: Partial<SaleOrder>) => void;
  onDeleteSaleOrder: (id: string) => void;
  onShipSale: (orderId: string, items: { productId: string; shippedQuantity: number }[]) => void;
}

const SalesManagement: React.FC<SalesManagementProps> = ({
  products,
  customers,
  saleOrders,
  onAddSaleOrder,
  onEditSaleOrder,
  onDeleteSaleOrder,
  onShipSale,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'pending' | 'shipped' | 'completed'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showShipForm, setShowShipForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SaleOrder | null>(null);
  const [shippingOrder, setShippingOrder] = useState<SaleOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<SaleOrder | null>(null);

  const [orderData, setOrderData] = useState({
    orderNo: '',
    customerId: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    status: 'pending' as 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled',
    items: [] as Array<{
      productId: string;
      quantity: number;
      price: number;
    }>,
  });

  const [shipData, setShipData] = useState<Array<{
    productId: string;
    shippedQuantity: number;
  }>>([]);

  const filteredOrders = saleOrders.filter((order) =>
    order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingOrders = filteredOrders.filter(order => order.status === 'pending' || order.status === 'confirmed');
  const shippedOrders = filteredOrders.filter(order => order.status === 'shipped');
  const completedOrders = filteredOrders.filter(order => order.status === 'completed');

  const generateOrderNo = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SO-${year}${month}${day}-${random}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === orderData.customerId);
    if (!customer) return;

    const items: SaleItem[] = orderData.items.map((item, index) => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: `item-${Date.now()}-${index}`,
        productId: item.productId,
        productName: product?.name || '',
        quantity: item.quantity,
        price: item.price,
        shippedQuantity: 0,
        amount: item.quantity * item.price,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    const saleOrder = {
      orderNo: orderData.orderNo || generateOrderNo(),
      customerId: orderData.customerId,
      customerName: customer.name,
      orderDate: orderData.orderDate,
      deliveryDate: orderData.deliveryDate,
      status: orderData.status,
      items,
      totalAmount,
      shippedAmount: 0,
    };

    if (editingOrder) {
      onEditSaleOrder(editingOrder.id, saleOrder);
      setEditingOrder(null);
    } else {
      onAddSaleOrder(saleOrder);
    }

    resetForm();
  };

  const handleShip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrder) return;

    onShipSale(shippingOrder.id, shipData);
    setShippingOrder(null);
    setShipData([]);
    setShowShipForm(false);
  };

  const resetForm = () => {
    setOrderData({
      orderNo: '',
      customerId: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      status: 'pending',
      items: [],
    });
    setEditingOrder(null);
    setShowCreateForm(false);
  };

  const handleEdit = (order: SaleOrder) => {
    setEditingOrder(order);
    setOrderData({
      orderNo: order.orderNo,
      customerId: order.customerId,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      status: order.status,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
    setShowCreateForm(true);
  };

  const handleShipOrder = (order: SaleOrder) => {
    setShippingOrder(order);
    setShipData(order.items.map(item => ({
      productId: item.productId,
      shippedQuantity: item.quantity - item.shippedQuantity,
    })));
    setShowShipForm(true);
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
    
    // 如果选择了商品，自动填入销售价格
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].price = product.salePrice;
      }
    }
    
    setOrderData({ ...orderData, items: updatedItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'shipped': return Truck;
      case 'completed': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待确认';
      case 'confirmed': return '已确认';
      case 'shipped': return '已发货';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">销售管理</h1>
          <p className="text-slate-600 mt-1">管理销售订单和客户销售流程</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>新建销售单</span>
        </button>
      </div>

      {/* 导航标签 */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'orders', label: '所有订单', icon: TrendingUp },
            { key: 'pending', label: '待处理', icon: Clock },
            { key: 'shipped', label: '已发货', icon: Truck },
            { key: 'completed', label: '已完成', icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600'
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
          placeholder="搜索销售单号或客户..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* 销售订单列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">销售单信息</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">客户</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">日期</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">金额</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(activeTab === 'orders' ? filteredOrders : 
                activeTab === 'pending' ? pendingOrders : 
                activeTab === 'shipped' ? shippedOrders : completedOrders).map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
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
                        <span className="text-slate-900">{order.customerName}</span>
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
                          <span className="text-sm text-slate-600">交付: {order.deliveryDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 font-medium">¥{order.totalAmount.toLocaleString()}</p>
                      {order.shippedAmount > 0 && (
                        <p className="text-sm text-green-600">已发货: ¥{order.shippedAmount.toLocaleString()}</p>
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
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
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
                                onClick={() => handleShipOrder(order)}
                                className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                                title="发货"
                              >
                                <Truck className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => onDeleteSaleOrder(order.id)}
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

      {/* 创建/编辑销售单表单 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {editingOrder ? '编辑销售单' : '新建销售单'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">销售单号</label>
                  <input
                    type="text"
                    value={orderData.orderNo}
                    onChange={(e) => setOrderData({ ...orderData, orderNo: e.target.value })}
                    placeholder="留空自动生成"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">客户</label>
                  <select
                    required
                    value={orderData.customerId}
                    onChange={(e) => setOrderData({ ...orderData, customerId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">请选择客户</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">交付日期</label>
                  <input
                    type="date"
                    required
                    value={orderData.deliveryDate}
                    onChange={(e) => setOrderData({ ...orderData, deliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* 销售商品 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-slate-900">销售商品</h4>
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">请选择商品</option>
                          {products.filter(p => p.stock > 0).map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {product.specification} (库存: {product.stock})
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    <span className="text-2xl font-bold text-green-600">
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {editingOrder ? '更新销售单' : '创建销售单'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 发货表单 */}
      {showShipForm && shippingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              发货确认 - {shippingOrder.orderNo}
            </h3>
            <form onSubmit={handleShip} className="space-y-4">
              <div className="space-y-3">
                {shippingOrder.items.map((item, index) => (
                  <div key={item.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{item.productName}</p>
                        <p className="text-sm text-slate-500">
                          订购数量: {item.quantity} | 已发货: {item.shippedQuantity} | 待发货: {item.quantity - item.shippedQuantity}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">本次发货数量</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity - item.shippedQuantity}
                        value={shipData[index]?.shippedQuantity || 0}
                        onChange={(e) => {
                          const newShipData = [...shipData];
                          newShipData[index] = {
                            productId: item.productId,
                            shippedQuantity: parseInt(e.target.value) || 0,
                          };
                          setShipData(newShipData);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowShipForm(false);
                    setShippingOrder(null);
                    setShipData([]);
                  }}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  确认发货
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
                <p className="text-slate-600">客户: {viewingOrder.customerName}</p>
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
                <p className="text-sm text-slate-500">交付日期</p>
                <p className="font-medium">{viewingOrder.deliveryDate}</p>
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
                        数量: {item.quantity} | 单价: ¥{item.price} | 已发货: {item.shippedQuantity}
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

export default SalesManagement;