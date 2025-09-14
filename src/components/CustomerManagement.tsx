import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Customer } from '../types';

interface CustomerManagementProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createTime'>) => void;
  onEditCustomer: (id: string, customer: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const [customerData, setCustomerData] = useState({
    code: '',
    name: '',
    contact: '',
    phone: '',
    address: '',
    email: '',
    credit: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const activeCustomers = filteredCustomers.filter(customer => customer.status === 'active');
  const inactiveCustomers = filteredCustomers.filter(customer => customer.status === 'inactive');
  const totalCredit = customers.reduce((sum, customer) => sum + customer.credit, 0);

  const generateCustomerCode = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CUS${year}${month}${day}${random}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = {
      code: customerData.code || generateCustomerCode(),
      name: customerData.name,
      contact: customerData.contact,
      phone: customerData.phone,
      address: customerData.address,
      email: customerData.email,
      credit: parseFloat(customerData.credit) || 0,
      status: customerData.status,
    };

    if (editingCustomer) {
      onEditCustomer(editingCustomer.id, customer);
      setEditingCustomer(null);
    } else {
      onAddCustomer(customer);
    }

    resetForm();
  };

  const resetForm = () => {
    setCustomerData({
      code: '',
      name: '',
      contact: '',
      phone: '',
      address: '',
      email: '',
      credit: '',
      status: 'active',
    });
    setEditingCustomer(null);
    setShowCreateForm(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerData({
      code: customer.code,
      name: customer.name,
      contact: customer.contact,
      phone: customer.phone,
      address: customer.address,
      email: customer.email || '',
      credit: customer.credit.toString(),
      status: customer.status,
    });
    setShowCreateForm(true);
  };

  const handleToggleStatus = (customer: Customer) => {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    onEditCustomer(customer.id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">客户管理</h1>
          <p className="text-slate-600 mt-1">管理客户信息和业务关系</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>新增客户</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">总客户数</p>
              <p className="text-3xl font-bold text-slate-900">{customers.length}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">活跃客户</p>
              <p className="text-3xl font-bold text-green-600">{activeCustomers.length}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">停用客户</p>
              <p className="text-3xl font-bold text-red-600">{inactiveCustomers.length}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">总信用额度</p>
              <p className="text-3xl font-bold text-blue-600">¥{totalCredit.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="搜索客户名称、编码、联系人或电话..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* 客户列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">客户信息</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">联系人</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">联系方式</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">地址</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">信用额度</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">创建时间</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{customer.name}</p>
                        <p className="text-sm text-slate-500">编码: {customer.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-900">{customer.contact}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 break-words max-w-xs">{customer.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-slate-900 font-medium">¥{customer.credit.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(customer)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {customer.status === 'active' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          活跃
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          停用
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {new Date(customer.createTime).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewingCustomer(customer)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="编辑"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCustomer(customer.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg mb-2">暂无客户数据</p>
            <p className="text-slate-400">点击"新增客户"按钮添加第一个客户</p>
          </div>
        )}
      </div>

      {/* 创建/编辑客户表单 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {editingCustomer ? '编辑客户' : '新增客户'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">客户编码</label>
                  <input
                    type="text"
                    value={customerData.code}
                    onChange={(e) => setCustomerData({ ...customerData, code: e.target.value })}
                    placeholder="留空自动生成"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">客户名称 *</label>
                  <input
                    type="text"
                    required
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">联系人 *</label>
                  <input
                    type="text"
                    required
                    value={customerData.contact}
                    onChange={(e) => setCustomerData({ ...customerData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">联系电话 *</label>
                  <input
                    type="tel"
                    required
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">邮箱地址</label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">信用额度</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customerData.credit}
                    onChange={(e) => setCustomerData({ ...customerData, credit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                  <select
                    value={customerData.status}
                    onChange={(e) => setCustomerData({ ...customerData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="active">活跃</option>
                    <option value="inactive">停用</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">详细地址 *</label>
                <textarea
                  required
                  rows={3}
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingCustomer ? '更新客户' : '创建客户'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 查看客户详情 */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{viewingCustomer.name}</h3>
                <p className="text-slate-600">编码: {viewingCustomer.code}</p>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">基本信息</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">联系人</p>
                        <p className="font-medium">{viewingCustomer.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">联系电话</p>
                        <p className="font-medium">{viewingCustomer.phone}</p>
                      </div>
                    </div>
                    {viewingCustomer.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">邮箱地址</p>
                          <p className="font-medium">{viewingCustomer.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">其他信息</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">信用额度</p>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-lg">¥{viewingCustomer.credit.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">状态</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingCustomer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingCustomer.status === 'active' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            活跃
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            停用
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">创建时间</p>
                      <p className="font-medium">{new Date(viewingCustomer.createTime).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-700 mb-2">详细地址</h4>
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-900">{viewingCustomer.address}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <button
                onClick={() => {
                  setViewingCustomer(null);
                  handleEdit(viewingCustomer);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>编辑客户</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;