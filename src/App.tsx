import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import InventoryManagement from './components/InventoryManagement';
import PurchaseManagement from './components/PurchaseManagement';
import SalesManagement from './components/SalesManagement';
import SupplierManagement from './components/SupplierManagement';
import CustomerManagement from './components/CustomerManagement';
import ReportsAnalysis from './components/ReportsAnalysis';
import SystemSettings from './components/SystemSettings';
import { 
  Product, 
  Supplier, 
  Customer, 
  PurchaseOrder, 
  SaleOrder, 
  InventoryRecord, 
  InventoryBatch,
  BatchMovement,
  DashboardStats 
} from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      code: 'P001',
      barcode: '1234567890123',
      name: '苹果iPhone 15',
      category: '手机',
      specification: '128GB 黑色',
      unit: '台',
      purchasePrice: 5500,
      salePrice: 6800,
      stock: 15,
      minStock: 10,
      status: 'active',
      createTime: '2025-01-20T10:00:00Z',
      updateTime: '2025-01-20T10:00:00Z',
    },
    {
      id: '2',
      code: 'P002',
      barcode: '2345678901234',
      name: '华为Mate 60',
      category: '手机',
      specification: '256GB 白色',
      unit: '台',
      purchasePrice: 4800,
      salePrice: 5999,
      stock: 8,
      minStock: 15,
      status: 'active',
      createTime: '2025-01-20T10:00:00Z',
      updateTime: '2025-01-20T10:00:00Z',
    },
    {
      id: '3',
      code: 'P003',
      barcode: '3456789012345',
      name: '小米14 Pro',
      category: '手机',
      specification: '512GB 钛金色',
      unit: '台',
      purchasePrice: 3800,
      salePrice: 4499,
      stock: 25,
      minStock: 20,
      status: 'active',
      createTime: '2025-01-20T10:00:00Z',
      updateTime: '2025-01-20T10:00:00Z',
    },
    {
      id: '4',
      code: 'P004',
      barcode: '4567890123456',
      name: 'MacBook Air M3',
      category: '电脑',
      specification: '13英寸 8GB+256GB',
      unit: '台',
      purchasePrice: 7500,
      salePrice: 8999,
      stock: 12,
      minStock: 5,
      status: 'active',
      createTime: '2025-01-20T10:00:00Z',
      updateTime: '2025-01-20T10:00:00Z',
    },
  ]);

  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([
    {
      id: '1',
      productId: '1',
      productName: '苹果iPhone 15',
      type: 'in',
      quantity: 20,
      beforeStock: 10,
      afterStock: 30,
      reason: '采购入库',
      batchNo: 'B2025012010001',
      relatedOrderId: '1',
      relatedOrderNo: 'PO-20250120-001',
      operatorId: 'user1',
      operatorName: '张三',
      createTime: '2025-01-20T09:00:00Z',
    },
    {
      id: '2',
      productId: '2',
      productName: '华为Mate 60',
      type: 'out',
      quantity: -5,
      beforeStock: 13,
      afterStock: 8,
      reason: '销售出库',
      batchNo: 'B2025012010002',
      relatedOrderId: '1',
      relatedOrderNo: 'SO-20250120-001',
      operatorId: 'user1',
      operatorName: '李四',
      createTime: '2025-01-20T14:30:00Z',
    },
  ]);

  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([
    {
      id: '1',
      batchNo: 'B2025012010001',
      productId: '1',
      productName: '苹果iPhone 15',
      quantity: 20,
      remainingQuantity: 15,
      purchasePrice: 5500,
      supplierId: '1',
      supplierName: '苹果科技有限公司',
      purchaseOrderId: '1',
      purchaseOrderNo: 'PO-20250120-001',
      productionDate: '2025-01-15',
      expiryDate: '2027-01-15',
      status: 'active',
      createTime: '2025-01-20T09:00:00Z',
    },
    {
      id: '2',
      batchNo: 'B2025012010002',
      productId: '2',
      productName: '华为Mate 60',
      quantity: 15,
      remainingQuantity: 8,
      purchasePrice: 4800,
      supplierId: '2',
      supplierName: '华为供应链公司',
      purchaseOrderId: '2',
      purchaseOrderNo: 'PO-20250120-002',
      productionDate: '2025-01-18',
      status: 'active',
      createTime: '2025-01-20T10:00:00Z',
    },
  ]);

  const [batchMovements, setBatchMovements] = useState<BatchMovement[]>([
    {
      id: '1',
      batchId: '1',
      batchNo: 'B2025012010001',
      productId: '1',
      type: 'out',
      quantity: 5,
      remainingQuantity: 15,
      relatedOrderId: '1',
      relatedOrderNo: 'SO-20250120-001',
      relatedOrderType: 'sale',
      createTime: '2025-01-20T14:30:00Z',
    },
  ]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      code: 'SUP001',
      name: '苹果科技有限公司',
      contact: '张经理',
      phone: '138-0000-0001',
      address: '北京市朝阳区科技园区1号',
      email: 'zhang@apple-tech.com',
      status: 'active',
      createTime: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      code: 'SUP002',
      name: '华为供应链公司',
      contact: '李总监',
      phone: '138-0000-0002',
      address: '深圳市南山区高新技术园',
      email: 'li@huawei-supply.com',
      status: 'active',
      createTime: '2025-01-16T10:00:00Z',
    },
    {
      id: '3',
      code: 'SUP003',
      name: '小米生态链企业',
      contact: '王主管',
      phone: '138-0000-0003',
      address: '北京市海淀区小米科技园',
      email: 'wang@mi-eco.com',
      status: 'active',
      createTime: '2025-01-17T10:00:00Z',
    },
  ]);

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      code: 'CUS001',
      name: '北京科技有限公司',
      contact: '王经理',
      phone: '138-1111-0001',
      address: '北京市海淀区中关村大街1号',
      email: 'wang@bjtech.com',
      credit: 100000,
      status: 'active',
      createTime: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      code: 'CUS002',
      name: '上海贸易公司',
      contact: '李总',
      phone: '138-2222-0002',
      address: '上海市浦东新区陆家嘴金融区',
      email: 'li@shtrade.com',
      credit: 200000,
      status: 'active',
      createTime: '2025-01-16T10:00:00Z',
    },
    {
      id: '3',
      code: 'CUS003',
      name: '深圳电子科技',
      contact: '张主管',
      phone: '138-3333-0003',
      address: '深圳市南山区科技园南区',
      email: 'zhang@sztech.com',
      credit: 150000,
      status: 'active',
      createTime: '2025-01-17T10:00:00Z',
    },
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: '1',
      orderNo: 'PO-20250120-001',
      supplierId: '1',
      supplierName: '苹果科技有限公司',
      orderDate: '2025-01-20',
      expectedDate: '2025-01-25',
      status: 'confirmed',
      items: [
        {
          id: 'item-1',
          productId: '1',
          productName: '苹果iPhone 15',
          quantity: 20,
          price: 5500,
          receivedQuantity: 0,
          amount: 110000,
        },
      ],
      totalAmount: 110000,
      receivedAmount: 0,
      createTime: '2025-01-20T10:00:00Z',
    },
    {
      id: '2',
      orderNo: 'PO-20250120-002',
      supplierId: '2',
      supplierName: '华为供应链公司',
      orderDate: '2025-01-20',
      expectedDate: '2025-01-28',
      status: 'pending',
      items: [
        {
          id: 'item-2',
          productId: '2',
          productName: '华为Mate 60',
          quantity: 15,
          price: 4800,
          receivedQuantity: 0,
          amount: 72000,
        },
      ],
      totalAmount: 72000,
      receivedAmount: 0,
      createTime: '2025-01-20T11:00:00Z',
    },
  ]);

  const [saleOrders, setSaleOrders] = useState<SaleOrder[]>([
    {
      id: '1',
      orderNo: 'SO-20250120-001',
      customerId: '1',
      customerName: '北京科技有限公司',
      orderDate: '2025-01-20',
      deliveryDate: '2025-01-25',
      status: 'confirmed',
      items: [
        {
          id: 'item-1',
          productId: '1',
          productName: '苹果iPhone 15',
          quantity: 5,
          price: 6800,
          shippedQuantity: 0,
          amount: 34000,
        },
      ],
      totalAmount: 34000,
      shippedAmount: 0,
      createTime: '2025-01-20T10:00:00Z',
    },
    {
      id: '2',
      orderNo: 'SO-20250120-002',
      customerId: '2',
      customerName: '上海贸易公司',
      orderDate: '2025-01-20',
      deliveryDate: '2025-01-28',
      status: 'pending',
      items: [
        {
          id: 'item-2',
          productId: '2',
          productName: '华为Mate 60',
          quantity: 3,
          price: 5999,
          shippedQuantity: 0,
          amount: 17997,
        },
      ],
      totalAmount: 17997,
      shippedAmount: 0,
      createTime: '2025-01-20T11:00:00Z',
    },
  ]);

  const dashboardStats: DashboardStats = {
    totalProducts: products.length,
    lowStockProducts: products.filter(p => p.stock <= p.minStock).length,
    totalSuppliers: suppliers.length,
    totalCustomers: customers.length,
    pendingPurchases: purchaseOrders.filter(order => order.status === 'pending' || order.status === 'confirmed').length,
    pendingSales: saleOrders.filter(order => order.status === 'pending' || order.status === 'confirmed').length,
    thisMonthPurchaseAmount: 156800,
    thisMonthSaleAmount: 289600,
  };

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createTime' | 'updateTime'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };
    setProducts([...products, newProduct]);
  };

  const handleEditProduct = (id: string, productData: Partial<Product>) => {
    setProducts(products.map(product => 
      product.id === id 
        ? { ...product, ...productData, updateTime: new Date().toISOString() }
        : product
    ));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleAddInventoryRecord = (recordData: Omit<InventoryRecord, 'id' | 'createTime'>) => {
    const newRecord: InventoryRecord = {
      ...recordData,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
    };
    
    // 更新商品库存
    setProducts(products.map(product => 
      product.id === recordData.productId 
        ? { ...product, stock: recordData.afterStock, updateTime: new Date().toISOString() }
        : product
    ));
    
    setInventoryRecords([newRecord, ...inventoryRecords]);
  };

  const handleAddInventoryBatch = (batchData: Omit<InventoryBatch, 'id' | 'createTime'>) => {
    const newBatch: InventoryBatch = {
      ...batchData,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
    };
    setInventoryBatches([...inventoryBatches, newBatch]);
  };

  const handleUpdateInventoryBatch = (id: string, updates: Partial<InventoryBatch>) => {
    setInventoryBatches(inventoryBatches.map(batch => 
      batch.id === id ? { ...batch, ...updates } : batch
    ));
  };

  const handleAddBatchMovement = (movementData: Omit<BatchMovement, 'id' | 'createTime'>) => {
    const newMovement: BatchMovement = {
      ...movementData,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
    };
    setBatchMovements([...batchMovements, newMovement]);
  };

  const handleAddPurchaseOrder = (orderData: Omit<PurchaseOrder, 'id' | 'createTime'>) => {
    const newOrder: PurchaseOrder = {
      ...orderData,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
    };
    setPurchaseOrders([...purchaseOrders, newOrder]);
  };

  const handleEditPurchaseOrder = (id: string, orderData: Partial<PurchaseOrder>) => {
    setPurchaseOrders(purchaseOrders.map(order => 
      order.id === id 
        ? { ...order, ...orderData }
        : order
    ));
  };

  const handleDeletePurchaseOrder = (id: string) => {
    setPurchaseOrders(purchaseOrders.filter(order => order.id !== id));
  };

  const handleReceivePurchase = (orderId: string, items: { productId: string; receivedQuantity: number }[]) => {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;

    // 更新采购单的收货信息
    const updatedItems = order.items.map(item => {
      const receiveItem = items.find(r => r.productId === item.productId);
      if (receiveItem) {
        return {
          ...item,
          receivedQuantity: item.receivedQuantity + receiveItem.receivedQuantity,
        };
      }
      return item;
    });

    const receivedAmount = updatedItems.reduce((sum, item) => 
      sum + (item.receivedQuantity * item.price), 0
    );

    const allReceived = updatedItems.every(item => item.receivedQuantity >= item.quantity);
    const newStatus = allReceived ? 'received' : 'confirmed';

    setPurchaseOrders(purchaseOrders.map(o => 
      o.id === orderId 
        ? { ...o, items: updatedItems, receivedAmount, status: newStatus }
        : o
    ));

    // 更新商品库存
    items.forEach(receiveItem => {
      if (receiveItem.receivedQuantity > 0) {
        const product = products.find(p => p.id === receiveItem.productId);
        if (product) {
          const newStock = product.stock + receiveItem.receivedQuantity;
          setProducts(products.map(p => 
            p.id === receiveItem.productId 
              ? { ...p, stock: newStock, updateTime: new Date().toISOString() }
              : p
          ));

          // 生成批次号
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
          const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
          const batchNo = `B${year}${month}${day}${time}${random}`;

          // 创建批次记录
          const newBatch: InventoryBatch = {
            id: Date.now().toString() + '-' + receiveItem.productId,
            batchNo,
            productId: receiveItem.productId,
            productName: product.name,
            quantity: receiveItem.receivedQuantity,
            remainingQuantity: receiveItem.receivedQuantity,
            purchasePrice: updatedItems.find(i => i.productId === receiveItem.productId)?.price || product.purchasePrice,
            supplierId: order.supplierId,
            supplierName: order.supplierName,
            purchaseOrderId: order.id,
            purchaseOrderNo: order.orderNo,
            status: 'active',
            createTime: new Date().toISOString(),
          };
          setInventoryBatches(prev => [...prev, newBatch]);

          // 添加库存记录
          const newRecord: InventoryRecord = {
            id: Date.now().toString() + '-' + receiveItem.productId,
            productId: receiveItem.productId,
            productName: product.name,
            type: 'in',
            quantity: receiveItem.receivedQuantity,
            beforeStock: product.stock,
            afterStock: newStock,
            reason: `采购入库 - 采购单: ${order.orderNo}`,
            batchNo,
            relatedOrderId: order.id,
            relatedOrderNo: order.orderNo,
            operatorId: 'current-user',
            operatorName: '系统管理员',
            createTime: new Date().toISOString(),
          };
          setInventoryRecords(prev => [newRecord, ...prev]);

          // 添加批次移动记录
          const newMovement: BatchMovement = {
            id: Date.now().toString() + '-movement-' + receiveItem.productId,
            batchId: newBatch.id,
            batchNo,
            productId: receiveItem.productId,
            type: 'in',
            quantity: receiveItem.receivedQuantity,
            remainingQuantity: receiveItem.receivedQuantity,
            relatedOrderId: order.id,
            relatedOrderNo: order.orderNo,
            relatedOrderType: 'purchase',
            createTime: new Date().toISOString(),
          };
          setBatchMovements(prev => [...prev, newMovement]);
        }
      }
    });
  };

  const handleAddSaleOrder = (orderData: Omit<SaleOrder, 'id' | 'createTime'>) => {
    const newOrder: SaleOrder = {
      ...orderData,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
    };
    setSaleOrders([...saleOrders, newOrder]);
  };

  const handleEditSaleOrder = (id: string, orderData: Partial<SaleOrder>) => {
    setSaleOrders(saleOrders.map(order => 
      order.id === id 
        ? { ...order, ...orderData }
        : order
    ));
  };

  const handleDeleteSaleOrder = (id: string) => {
    setSaleOrders(saleOrders.filter(order => order.id !== id));
  };

  const handleShipSale = (orderId: string, items: { productId: string; shippedQuantity: number }[]) => {
    const order = saleOrders.find(o => o.id === orderId);
    if (!order) return;

    // 更新销售单的发货信息
    const updatedItems = order.items.map(item => {
      const shipItem = items.find(s => s.productId === item.productId);
      if (shipItem) {
        return {
          ...item,
          shippedQuantity: item.shippedQuantity + shipItem.shippedQuantity,
        };
      }
      return item;
    });

    const shippedAmount = updatedItems.reduce((sum, item) => 
      sum + (item.shippedQuantity * item.price), 0
    );

    const allShipped = updatedItems.every(item => item.shippedQuantity >= item.quantity);
    const newStatus = allShipped ? 'completed' : 'shipped';

    setSaleOrders(saleOrders.map(o => 
      o.id === orderId 
        ? { ...o, items: updatedItems, shippedAmount, status: newStatus }
        : o
    ));

    // 更新商品库存和批次（减少库存）
    items.forEach(shipItem => {
      if (shipItem.shippedQuantity > 0) {
        const product = products.find(p => p.id === shipItem.productId);
        if (product) {
          // 获取可用批次（FIFO）
          const availableBatches = inventoryBatches
            .filter(batch => 
              batch.productId === shipItem.productId && 
              batch.remainingQuantity > 0 && 
              batch.status === 'active'
            )
            .sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());

          let remainingQuantity = shipItem.shippedQuantity;
          const usedBatches: Array<{ batchId: string; batchNo: string; quantity: number }> = [];

          // 按FIFO分配批次
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
            setInventoryBatches(prev => prev.map(b => 
              b.id === batch.id 
                ? { 
                    ...b, 
                    remainingQuantity: newRemainingQuantity,
                    status: newRemainingQuantity === 0 ? 'exhausted' : 'active'
                  }
                : b
            ));
            
            remainingQuantity -= useQuantity;

            // 添加批次移动记录
            const newMovement: BatchMovement = {
              id: Date.now().toString() + '-' + batch.id + '-' + useQuantity,
              batchId: batch.id,
              batchNo: batch.batchNo,
              productId: shipItem.productId,
              type: 'out',
              quantity: useQuantity,
              remainingQuantity: newRemainingQuantity,
              relatedOrderId: order.id,
              relatedOrderNo: order.orderNo,
              relatedOrderType: 'sale',
              createTime: new Date().toISOString(),
            };
            setBatchMovements(prev => [...prev, newMovement]);
          }

          const newStock = product.stock - shipItem.shippedQuantity;
          setProducts(products.map(p => 
            p.id === shipItem.productId 
              ? { ...p, stock: newStock, updateTime: new Date().toISOString() }
              : p
          ));

          // 添加库存记录
          const newRecord: InventoryRecord = {
            id: Date.now().toString() + '-' + shipItem.productId,
            productId: shipItem.productId,
            productName: product.name,
            type: 'out',
            quantity: -shipItem.shippedQuantity,
            beforeStock: product.stock,
            afterStock: newStock,
            reason: `销售出库 - 销售单: ${order.orderNo}`,
            batchNo: usedBatches.map(b => b.batchNo).join(', '),
            relatedOrderId: order.id,
            relatedOrderNo: order.orderNo,
            operatorId: 'current-user',
            operatorName: '系统管理员',
            createTime: new Date().toISOString(),
          };
          setInventoryRecords(prev => [newRecord, ...prev]);
        }
      }
    });
  };

  const handleAddSupplier = (supplierData: Omit<Supplier, 'id' | 'createTime'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const handleEditSupplier = (id: string, supplierData: Partial<Supplier>) => {
    setSuppliers(suppliers.map(supplier => 
      supplier.id === id 
        ? { ...supplier, ...supplierData }
        : supplier
    ));
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
  };

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createTime'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
    };
    setCustomers([...customers, newCustomer]);
  };

  const handleEditCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(customers.map(customer => 
      customer.id === id 
        ? { ...customer, ...customerData }
        : customer
    ));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={dashboardStats} />;
      case 'products':
        return (
          <ProductManagement
            products={products}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'inventory':
        return (
          <InventoryManagement
            products={products}
            inventoryRecords={inventoryRecords}
            inventoryBatches={inventoryBatches}
            batchMovements={batchMovements}
            purchaseOrders={purchaseOrders}
            saleOrders={saleOrders}
            onAddInventoryRecord={handleAddInventoryRecord}
            onAddInventoryBatch={handleAddInventoryBatch}
            onUpdateInventoryBatch={handleUpdateInventoryBatch}
            onAddBatchMovement={handleAddBatchMovement}
          />
        );
      case 'purchase':
        return (
          <PurchaseManagement
            products={products}
            suppliers={suppliers}
            purchaseOrders={purchaseOrders}
            onAddPurchaseOrder={handleAddPurchaseOrder}
            onEditPurchaseOrder={handleEditPurchaseOrder}
            onDeletePurchaseOrder={handleDeletePurchaseOrder}
            onReceivePurchase={handleReceivePurchase}
          />
        );
      case 'sales':
        return (
          <SalesManagement
            products={products}
            customers={customers}
            saleOrders={saleOrders}
            onAddSaleOrder={handleAddSaleOrder}
            onEditSaleOrder={handleEditSaleOrder}
            onDeleteSaleOrder={handleDeleteSaleOrder}
            onShipSale={handleShipSale}
          />
        );
      case 'suppliers':
        return (
          <SupplierManagement
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        );
      case 'customers':
        return (
          <CustomerManagement
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      case 'reports':
        return (
          <ReportsAnalysis
            products={products}
            suppliers={suppliers}
            customers={customers}
            purchaseOrders={purchaseOrders}
            saleOrders={saleOrders}
            inventoryRecords={inventoryRecords}
          />
        );
      case 'settings':
        return (
          <SystemSettings />
        );
      default:
        return <Dashboard stats={dashboardStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 ml-64">
        <main className="p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;