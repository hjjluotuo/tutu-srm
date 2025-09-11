import React, { useState } from 'react';
import { Package, TrendingUp, TrendingDown, RotateCcw, Search, Plus, ArrowUpCircle, ArrowDownCircle, Scan } from 'lucide-react';
import { Product, InventoryRecord } from '../types';
import BarcodeScanner from './BarcodeScanner';

interface InventoryManagementProps {
  products: Product[];
  inventoryRecords: InventoryRecord[];
  onAddInventoryRecord: (record: Omit<InventoryRecord, 'id' | 'createTime'>) => void;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({
  products,
  inventoryRecords,
  onAddInventoryRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'inbound' | 'outbound' | 'adjust'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInboundForm, setShowInboundForm] = useState(false);
  const [showOutboundForm, setShowOutboundForm] = useState(false);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [showInboundScanner, setShowInboundScanner] = useState(false);
  const [showOutboundScanner, setShowOutboundScanner] = useState(false);
  
  const [inboundData, setInboundData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    supplier: '',
    batchNo: '',
    notes: '',
  });

  const [outboundData, setOutboundData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    customer: '',
    orderNo: '',
    notes: '',
  });

  const [adjustData, setAdjustData] = useState({
    productId: '',
    type: 'adjust' as 'adjust',
    quantity: '',
    reason: '',
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecords = inventoryRecords
    .filter((record) => 
      record.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

  // 按类型筛选记录
  const inboundRecords = filteredRecords.filter(record => record.type === 'in');
  const outboundRecords = filteredRecords.filter(record => record.type === 'out');

  // 根据条码查找商品
  const findProductByBarcode = (barcode: string) => {
    return products.find(product => product.barcode === barcode);
  };

  const handleInboundScan = (barcode: string) => {
    const product = findProductByBarcode(barcode);
    if (product) {
      setInboundData({ ...inboundData, productId: product.id });
      setShowInboundForm(true);
    } else {
      alert('未找到对应条码的商品，请检查条码是否正确');
    }
  };

  const handleOutboundScan = (barcode: string) => {
    const product = findProductByBarcode(barcode);
    if (product) {
      setOutboundData({ ...outboundData, productId: product.id });
      setShowOutboundForm(true);
    } else {
      alert('未找到对应条码的商品，请检查条码是否正确');
    }
  };
  const handleInbound = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === inboundData.productId);
    if (!product) return;

    const quantity = parseInt(inboundData.quantity);
    const newStock = product.stock + quantity;

    onAddInventoryRecord({
      productId: product.id,
      productName: product.name,
      type: 'in',
      quantity: quantity,
      beforeStock: product.stock,
      afterStock: newStock,
      reason: `${inboundData.reason}${inboundData.supplier ? ` - 供应商: ${inboundData.supplier}` : ''}${inboundData.batchNo ? ` - 批次: ${inboundData.batchNo}` : ''}${inboundData.notes ? ` - 备注: ${inboundData.notes}` : ''}`,
      operatorId: 'current-user',
      operatorName: '系统管理员',
    });

    setInboundData({
      productId: '',
      quantity: '',
      reason: '',
      supplier: '',
      batchNo: '',
      notes: '',
    });
    setShowInboundForm(false);
  };

  const handleOutbound = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === outboundData.productId);
    if (!product) return;

    const quantity = parseInt(outboundData.quantity);
    if (quantity > product.stock) {
      alert('出库数量不能超过当前库存！');
      return;
    }

    const newStock = product.stock - quantity;

    onAddInventoryRecord({
      productId: product.id,
      productName: product.name,
      type: 'out',
      quantity: -quantity,
      beforeStock: product.stock,
      afterStock: newStock,
      reason: `${outboundData.reason}${outboundData.customer ? ` - 客户: ${outboundData.customer}` : ''}${outboundData.orderNo ? ` - 订单号: ${outboundData.orderNo}` : ''}${outboundData.notes ? ` - 备注: ${outboundData.notes}` : ''}`,
      operatorId: 'current-user',
      operatorName: '系统管理员',
    });

    setOutboundData({
      productId: '',
      quantity: '',
      reason: '',
      customer: '',
      orderNo: '',
      notes: '',
    });
    setShowOutboundForm(false);
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === adjustData.productId);
    if (!product) return;

    const quantity = parseInt(adjustData.quantity);
    const newStock = product.stock + quantity;

    if (newStock < 0) {
      alert('调整后库存不能为负数！');
      return;
    }

    onAddInventoryRecord({
      productId: product.id,
      productName: product.name,
      type: 'adjust',
      quantity: quantity,
      beforeStock: product.stock,
      afterStock: newStock,
      reason: adjustData.reason,
      operatorId: 'current-user',
      operatorName: '系统管理员',
    });

    setAdjustData({
      productId: '',
      type: 'adjust',
      quantity: '',
      reason: '',
    });
    setShowAdjustForm(false);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">库存管理</h1>
          <p className="text-slate-600 mt-1">监控和管理商品库存情况</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowInboundForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <ArrowUpCircle className="h-4 w-4" />
            <span>入库</span>
          </button>
          <button
            onClick={() => setShowOutboundForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <ArrowDownCircle className="h-4 w-4" />
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
            { key: 'overview', label: '库存概览', icon: Package },
            { key: 'inbound', label: '入库管理', icon: ArrowUpCircle },
            { key: 'outbound', label: '出库管理', icon: ArrowDownCircle },
            { key: 'records', label: '所有记录', icon: TrendingUp },
            { key: 'adjust', label: '库存调整', icon: RotateCcw },
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
          placeholder="搜索商品..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 库存概览 */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">商品信息</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">当前库存</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">最小库存</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">库存状态</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">库存金额</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">快捷操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500">编码: {product.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold text-slate-900">{product.stock}</span>
                      <span className="text-slate-500 ml-1">{product.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900">{product.minStock}</span>
                      <span className="text-slate-500 ml-1">{product.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      {product.stock <= product.minStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          库存不足
                        </span>
                      ) : product.stock <= product.minStock * 1.5 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          库存预警
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          库存正常
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 font-medium">
                        ¥{(product.stock * product.purchasePrice).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500">
                        单价: ¥{product.purchasePrice}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setInboundData({ ...inboundData, productId: product.id });
                            setShowInboundForm(true);
                          }}
                          className="text-green-600 hover:bg-green-100 p-1 rounded"
                          title="入库"
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setOutboundData({ ...outboundData, productId: product.id });
                            setShowOutboundForm(true);
                          }}
                          className="text-red-600 hover:bg-red-100 p-1 rounded"
                          title="出库"
                        >
                          <ArrowDownCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 入库管理 */}
      {activeTab === 'inbound' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">入库记录</h2>
            <button
              onClick={() => setShowInboundForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>新增入库</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50 border-b border-green-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">商品信息</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">入库数量</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">库存变化</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">入库原因</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作人员</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">入库时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inboundRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{record.productName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-medium text-lg">+{record.quantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">{record.beforeStock}</span>
                        <span className="text-slate-400 mx-2">→</span>
                        <span className="text-slate-900 font-medium">{record.afterStock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{record.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{record.operatorName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{new Date(record.createTime).toLocaleString()}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 出库管理 */}
      {activeTab === 'outbound' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">出库记录</h2>
            <button
              onClick={() => setShowOutboundForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>新增出库</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50 border-b border-red-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">商品信息</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">出库数量</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">库存变化</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">出库原因</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作人员</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">出库时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {outboundRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{record.productName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-red-600 font-medium text-lg">{record.quantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">{record.beforeStock}</span>
                        <span className="text-slate-400 mx-2">→</span>
                        <span className="text-slate-900 font-medium">{record.afterStock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{record.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{record.operatorName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900">{new Date(record.createTime).toLocaleString()}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 所有记录 */}
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
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作原因</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作人员</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{record.productName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.type === 'in' 
                          ? 'bg-green-100 text-green-800'
                          : record.type === 'out'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.type === 'in' && <TrendingUp className="h-3 w-3 mr-1" />}
                        {record.type === 'out' && <TrendingDown className="h-3 w-3 mr-1" />}
                        {record.type === 'adjust' && <RotateCcw className="h-3 w-3 mr-1" />}
                        {record.type === 'in' ? '入库' : record.type === 'out' ? '出库' : '调整'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${record.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {record.quantity >= 0 ? '+' : ''}{record.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{record.beforeStock}</span>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="text-slate-900 font-medium">{record.afterStock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900">{record.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900">{record.operatorName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900">{new Date(record.createTime).toLocaleString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 入库表单 */}
      {showInboundForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <ArrowUpCircle className="h-5 w-5 text-green-600 mr-2" />
              商品入库
            </h3>
            <form onSubmit={handleInbound} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择商品</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <select
                      required
                      value={inboundData.productId}
                      onChange={(e) => setInboundData({ ...inboundData, productId: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">请选择商品</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (当前库存: {product.stock})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowInboundScanner(true)}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
                      title="扫描条码"
                    >
                      <Scan className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">可以手动选择商品或点击扫描按钮扫描条码</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">入库数量</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={inboundData.quantity}
                  onChange={(e) => setInboundData({ ...inboundData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">入库原因</label>
                <select
                  required
                  value={inboundData.reason}
                  onChange={(e) => setInboundData({ ...inboundData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">请选择入库原因</option>
                  <option value="采购入库">采购入库</option>
                  <option value="生产入库">生产入库</option>
                  <option value="退货入库">退货入库</option>
                  <option value="调拨入库">调拨入库</option>
                  <option value="其他入库">其他入库</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">供应商</label>
                <input
                  type="text"
                  value={inboundData.supplier}
                  onChange={(e) => setInboundData({ ...inboundData, supplier: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">批次号</label>
                <input
                  type="text"
                  value={inboundData.batchNo}
                  onChange={(e) => setInboundData({ ...inboundData, batchNo: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  rows={2}
                  value={inboundData.notes}
                  onChange={(e) => setInboundData({ ...inboundData, notes: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInboundForm(false)}
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
      {showOutboundForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <ArrowDownCircle className="h-5 w-5 text-red-600 mr-2" />
              商品出库
            </h3>
            <form onSubmit={handleOutbound} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择商品</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <select
                      required
                      value={outboundData.productId}
                      onChange={(e) => setOutboundData({ ...outboundData, productId: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">请选择商品</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (可用库存: {product.stock})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowOutboundScanner(true)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                      title="扫描条码"
                    >
                      <Scan className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">可以手动选择商品或点击扫描按钮扫描条码</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">出库数量</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={outboundData.quantity}
                  onChange={(e) => setOutboundData({ ...outboundData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">出库原因</label>
                <select
                  required
                  value={outboundData.reason}
                  onChange={(e) => setOutboundData({ ...outboundData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">请选择出库原因</option>
                  <option value="销售出库">销售出库</option>
                  <option value="生产领料">生产领料</option>
                  <option value="调拨出库">调拨出库</option>
                  <option value="报损出库">报损出库</option>
                  <option value="其他出库">其他出库</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">客户</label>
                <input
                  type="text"
                  value={outboundData.customer}
                  onChange={(e) => setOutboundData({ ...outboundData, customer: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">订单号</label>
                <input
                  type="text"
                  value={outboundData.orderNo}
                  onChange={(e) => setOutboundData({ ...outboundData, orderNo: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  rows={2}
                  value={outboundData.notes}
                  onChange={(e) => setOutboundData({ ...outboundData, notes: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOutboundForm(false)}
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

      {/* 库存调整表单 */}
      {showAdjustForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">库存调整</h3>
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择商品</label>
                <select
                  required
                  value={adjustData.productId}
                  onChange={(e) => setAdjustData({ ...adjustData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">请选择商品</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (当前库存: {product.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">调整数量</label>
                <input
                  type="number"
                  required
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: e.target.value })}
                  placeholder="正数为增加，负数为减少"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">调整原因</label>
                <textarea
                  required
                  rows={3}
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdjustForm(false)}
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

      {/* 入库条码扫描器 */}
      <BarcodeScanner
        isOpen={showInboundScanner}
        onScan={handleInboundScan}
        onClose={() => setShowInboundScanner(false)}
      />

      {/* 出库条码扫描器 */}
      <BarcodeScanner
        isOpen={showOutboundScanner}
        onScan={handleOutboundScan}
        onClose={() => setShowOutboundScanner(false)}
      />
    </div>
  );
};

export default InventoryManagement;