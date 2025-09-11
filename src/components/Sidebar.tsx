import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  TrendingUp,
  Users,
  Building2,
  BarChart3,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'products', label: '商品管理', icon: Package },
    { id: 'inventory', label: '库存管理', icon: Warehouse },
    { id: 'purchase', label: '采购管理', icon: ShoppingCart },
    { id: 'sales', label: '销售管理', icon: TrendingUp },
    { id: 'suppliers', label: '供应商管理', icon: Building2 },
    { id: 'customers', label: '客户管理', icon: Users },
    { id: 'reports', label: '报表分析', icon: BarChart3 },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Package className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl font-bold">进销存系统</h1>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;