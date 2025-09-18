import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { Supplier } from '../types';

interface SupplierManagementProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createTime'>) => void;
  onEditSupplier: (id: string, supplier: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({
  suppliers,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);

  const [supplierData, setSupplierData] = useState({
    code: '',
    name: '',
    contact: '',
    phone: '',
    address: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm)
  );

  const activeSuppliers = filteredSuppliers.filter(supplier => supplier.status === 'active');
  const inactiveSuppliers = filteredSuppliers.filter(supplier => supplier.status === 'inactive');

  const generateSupplierCode = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SUP${year}${month}${day}${random}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplier = {
      code: supplierData.code || generateSupplierCode(),
      name: supplierData.name,
      contact: supplierData.contact,
      phone: supplierData.phone,
      address: supplierData.address,
      email: supplierData.email,
      status: supplierData.status,
    };

    if (editingSupplier) {
      onEditSupplier(editingSupplier.id, supplier);
      setEditingSupplier(null);
    } else {
      onAddSupplier(supplier);
    }

    resetForm();
  };

  const resetForm = () => {
    setSupplierData({
      code: '',
      name: '',
      contact: '',
      phone: '',
      address: '',
      email: '',
      status: 'active',
    });
    setEditingSupplier(null);
    setShowCreateForm(false);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierData({
      code: supplier.code,
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      address: supplier.address,
      email: supplier.email || '',
      status: supplier.status,
    });
    setShowCreateForm(true);
  };

  const handleToggleStatus = (supplier: Supplier) => {
    const newStatus = supplier.status === 'active' ? 'inactive' : 'active';
    onEditSupplier(supplier.id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">供应商管理</h1>
          <p className="text-slate-600 mt-1">管理供应商信息和合作关系</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>新增供应商</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">总供应商数</p>
              <p className="text-3xl font-bold text-slate-900">{suppliers.length}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">活跃供应商</p>
              <p className="text-3xl font-bold text-green-600">{activeSuppliers.length}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">停用供应商</p>
              <p className="text-3xl font-bold text-red-600">{inactiveSuppliers.length}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="搜索供应商名称、编码、联系人或电话..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 供应商列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">供应商信息</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">联系人</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">联系方式</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">地址</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">创建时间</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{supplier.name}</p>
                        <p className="text-sm text-slate-500">编码: {supplier.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-900">{supplier.contact}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{supplier.phone}</span>
                      </div>
                      {supplier.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{supplier.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 break-words max-w-xs">{supplier.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(supplier)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        supplier.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {supplier.status === 'active' ? (
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
                        {new Date(supplier.createTime).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewingSupplier(supplier)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="编辑"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSupplier(supplier.id)}
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
        
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg mb-2">暂无供应商数据</p>
            <p className="text-slate-400">点击"新增供应商"按钮添加第一个供应商</p>
          </div>
        )}
      </div>

      {/* 创建/编辑供应商表单 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {editingSupplier ? '编辑供应商' : '新增供应商'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">供应商编码</label>
                  <input
                    type="text"
                    value={supplierData.code}
                    onChange={(e) => setSupplierData({ ...supplierData, code: e.target.value })}
                    placeholder="留空自动生成"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">供应商名称 *</label>
                  <input
                    type="text"
                    required
                    value={supplierData.name}
                    onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">联系人 *</label>
                  <input
                    type="text"
                    required
                    value={supplierData.contact}
                    onChange={(e) => setSupplierData({ ...supplierData, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">联系电话 *</label>
                  <input
                    type="tel"
                    required
                    value={supplierData.phone}
                    onChange={(e) => setSupplierData({ ...supplierData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">邮箱地址</label>
                  <input
                    type="email"
                    value={supplierData.email}
                    onChange={(e) => setSupplierData({ ...supplierData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                  <select
                    value={supplierData.status}
                    onChange={(e) => setSupplierData({ ...supplierData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  value={supplierData.address}
                  onChange={(e) => setSupplierData({ ...supplierData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSupplier ? '更新供应商' : '创建供应商'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 查看供应商详情 */}
      {viewingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{viewingSupplier.name}</h3>
                <p className="text-slate-600">编码: {viewingSupplier.code}</p>
              </div>
              <button
                onClick={() => setViewingSupplier(null)}
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
                        <p className="font-medium">{viewingSupplier.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">联系电话</p>
                        <p className="font-medium">{viewingSupplier.phone}</p>
                      </div>
                    </div>
                    {viewingSupplier.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">邮箱地址</p>
                          <p className="font-medium">{viewingSupplier.email}</p>
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
                      <p className="text-sm text-slate-500">状态</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingSupplier.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingSupplier.status === 'active' ? (
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
                      <p className="font-medium">{new Date(viewingSupplier.createTime).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-700 mb-2">详细地址</h4>
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-900">{viewingSupplier.address}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <button
                onClick={() => {
                  setViewingSupplier(null);
                  handleEdit(viewingSupplier);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>编辑供应商</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;