import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Building2,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { Product, Supplier, Customer, PurchaseOrder, SaleOrder, InventoryRecord } from '../types';

interface ReportsAnalysisProps {
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  purchaseOrders: PurchaseOrder[];
  saleOrders: SaleOrder[];
  inventoryRecords: InventoryRecord[];
}

const ReportsAnalysis: React.FC<ReportsAnalysisProps> = ({
  products,
  suppliers,
  customers,
  purchaseOrders,
  saleOrders,
  inventoryRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'purchase' | 'inventory' | 'profit'>('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // 计算统计数据
  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // 本月销售数据
    const thisMonthSales = saleOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    // 本月采购数据
    const thisMonthPurchases = purchaseOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    // 库存价值
    const inventoryValue = products.reduce((sum, product) => 
      sum + (product.stock * product.purchasePrice), 0
    );
    
    // 低库存商品
    const lowStockProducts = products.filter(p => p.stock <= p.minStock);
    
    return {
      thisMonthSalesAmount: thisMonthSales.reduce((sum, order) => sum + order.totalAmount, 0),
      thisMonthPurchaseAmount: thisMonthPurchases.reduce((sum, order) => sum + order.totalAmount, 0),
      inventoryValue,
      lowStockCount: lowStockProducts.length,
      totalProducts: products.length,
      totalSuppliers: suppliers.length,
      totalCustomers: customers.length,
      thisMonthSalesCount: thisMonthSales.length,
      thisMonthPurchaseCount: thisMonthPurchases.length,
    };
  };

  const stats = calculateStats();

  // 获取销售趋势数据（最近7天）
  const getSalesTrend = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayOrders = saleOrders.filter(order => order.orderDate === date);
      const amount = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      return {
        date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        amount,
      };
    });
  };

  // 获取商品销售排行
  const getTopSellingProducts = () => {
    const productSales: { [key: string]: { name: string; quantity: number; amount: number } } = {};
    
    saleOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            amount: 0,
          };
        }
        productSales[item.productId].quantity += item.shippedQuantity;
        productSales[item.productId].amount += item.shippedQuantity * item.price;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  // 获取客户销售排行
  const getTopCustomers = () => {
    const customerSales: { [key: string]: { name: string; amount: number; orders: number } } = {};
    
    saleOrders.forEach(order => {
      if (!customerSales[order.customerId]) {
        customerSales[order.customerId] = {
          name: order.customerName,
          amount: 0,
          orders: 0,
        };
      }
      customerSales[order.customerId].amount += order.shippedAmount;
      customerSales[order.customerId].orders += 1;
    });

    return Object.values(customerSales)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const salesTrend = getSalesTrend();
  const topProducts = getTopSellingProducts();
  const topCustomers = getTopCustomers();

  const exportReport = (type: string) => {
    // 这里可以实现导出功能
    alert(`导出${type}报表功能开发中...`);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">报表分析</h1>
          <p className="text-slate-600 mt-1">数据分析和业务报表</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-1 border border-slate-300 rounded text-sm"
            />
            <span className="text-slate-400">至</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-1 border border-slate-300 rounded text-sm"
            />
          </div>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '总览', icon: BarChart3 },
            { key: 'sales', label: '销售分析', icon: TrendingUp },
            { key: 'purchase', label: '采购分析', icon: TrendingDown },
            { key: 'inventory', label: '库存分析', icon: Package },
            { key: 'profit', label: '利润分析', icon: DollarSign },
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

      {/* 总览 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 关键指标 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">本月销售额</p>
                  <p className="text-3xl font-bold text-green-600">¥{stats.thisMonthSalesAmount.toLocaleString()}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">本月采购额</p>
                  <p className="text-3xl font-bold text-blue-600">¥{stats.thisMonthPurchaseAmount.toLocaleString()}</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <TrendingDown className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">库存价值</p>
                  <p className="text-3xl font-bold text-purple-600">¥{stats.inventoryValue.toLocaleString()}</p>
                </div>
                <div className="bg-purple-100 rounded-lg p-3">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">低库存预警</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.lowStockCount}</p>
                </div>
                <div className="bg-orange-100 rounded-lg p-3">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 销售趋势 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">销售趋势（最近7天）</h3>
                <LineChart className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                {salesTrend.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{item.date}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max(10, (item.amount / Math.max(...salesTrend.map(s => s.amount))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900">¥{item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 热销商品 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">热销商品TOP5</h3>
                <PieChart className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-900">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">¥{product.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{product.quantity}件</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 销售分析 */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">销售分析报表</h2>
            <button
              onClick={() => exportReport('销售')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>导出报表</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 客户销售排行 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">客户销售排行</h3>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{customer.name}</p>
                        <p className="text-sm text-slate-500">{customer.orders} 个订单</p>
                      </div>
                    </div>
                    <p className="font-medium text-green-600">¥{customer.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 销售统计 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">销售统计</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border-b border-slate-100">
                  <span className="text-slate-600">本月订单数</span>
                  <span className="font-medium text-slate-900">{stats.thisMonthSalesCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 border-b border-slate-100">
                  <span className="text-slate-600">本月销售额</span>
                  <span className="font-medium text-green-600">¥{stats.thisMonthSalesAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 border-b border-slate-100">
                  <span className="text-slate-600">平均订单金额</span>
                  <span className="font-medium text-slate-900">
                    ¥{stats.thisMonthSalesCount > 0 ? Math.round(stats.thisMonthSalesAmount / stats.thisMonthSalesCount).toLocaleString() : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3">
                  <span className="text-slate-600">活跃客户数</span>
                  <span className="font-medium text-slate-900">{customers.filter(c => c.status === 'active').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 采购分析 */}
      {activeTab === 'purchase' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">采购分析报表</h2>
            <button
              onClick={() => exportReport('采购')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>导出报表</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">采购统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.thisMonthPurchaseCount}</p>
                <p className="text-sm text-slate-600">本月采购订单</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">¥{stats.thisMonthPurchaseAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-600">本月采购金额</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.totalSuppliers}</p>
                <p className="text-sm text-slate-600">合作供应商</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  ¥{stats.thisMonthPurchaseCount > 0 ? Math.round(stats.thisMonthPurchaseAmount / stats.thisMonthPurchaseCount).toLocaleString() : 0}
                </p>
                <p className="text-sm text-slate-600">平均采购金额</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 库存分析 */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">库存分析报表</h2>
            <button
              onClick={() => exportReport('库存')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>导出报表</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">库存概况</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">商品总数</span>
                  <span className="font-medium text-slate-900">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">库存总价值</span>
                  <span className="font-medium text-purple-600">¥{stats.inventoryValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">低库存商品</span>
                  <span className="font-medium text-orange-600">{stats.lowStockCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">正常库存商品</span>
                  <span className="font-medium text-green-600">{stats.totalProducts - stats.lowStockCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">库存预警</h3>
              <div className="space-y-3">
                {products.filter(p => p.stock <= p.minStock).slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500">最小库存: {product.minStock}</p>
                    </div>
                    <span className="text-orange-600 font-medium">{product.stock}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 利润分析 */}
      {activeTab === 'profit' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">利润分析报表</h2>
            <button
              onClick={() => exportReport('利润')}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>导出报表</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">利润概况</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">¥{stats.thisMonthSalesAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-600 mt-1">本月销售收入</p>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">¥{stats.thisMonthPurchaseAmount.toLocaleString()}</p>
                <p className="text-sm text-slate-600 mt-1">本月采购成本</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  ¥{(stats.thisMonthSalesAmount - stats.thisMonthPurchaseAmount).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 mt-1">本月毛利润</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalysis;