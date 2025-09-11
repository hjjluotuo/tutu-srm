import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  Building2, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const statCards = [
    {
      title: '商品总数',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: '低库存预警',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: '供应商数量',
      value: stats.totalSuppliers,
      icon: Building2,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: '客户数量',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
  ];

  const businessCards = [
    {
      title: '待处理采购',
      value: stats.pendingPurchases,
      icon: ShoppingCart,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600'
    },
    {
      title: '待处理销售',
      value: stats.pendingSales,
      icon: TrendingUp,
      color: 'bg-pink-500',
      textColor: 'text-pink-600'
    },
    {
      title: '本月采购额',
      value: `¥${stats.thisMonthPurchaseAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-teal-500',
      textColor: 'text-teal-600'
    },
    {
      title: '本月销售额',
      value: `¥${stats.thisMonthSaleAmount.toLocaleString()}`,
      icon: BarChart3,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600'
    },
  ];

  const recentActivities = [
    { id: 1, type: 'purchase', message: '采购订单 PO-2025-001 已创建', time: '2分钟前' },
    { id: 2, type: 'sale', message: '销售订单 SO-2025-001 已发货', time: '15分钟前' },
    { id: 3, type: 'inventory', message: '商品"苹果iPhone15"库存不足', time: '1小时前' },
    { id: 4, type: 'supplier', message: '新增供应商"科技有限公司"', time: '2小时前' },
    { id: 5, type: 'product', message: '商品"华为Mate60"价格已更新', time: '3小时前' },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">仪表盘</h1>
          <p className="text-slate-600 mt-1">欢迎回来，查看您的业务概况</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">今天是</p>
          <p className="text-lg font-semibold text-slate-900">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 业务数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {businessCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 最近活动和快捷操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近活动 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">最近活动</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 mb-1">{activity.message}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">新增商品</p>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <ShoppingCart className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">创建采购单</p>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">创建销售单</p>
            </button>
            <button className="p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">查看报表</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;