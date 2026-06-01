import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../services/api';

function OrderModal({ onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()]).then(([c, p]) => {
      setCustomers(c.data);
      setProducts(p.data.filter(pr => pr.quantity > 0));
    });
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      return sum + (product ? product.price * parseInt(item.quantity || 0) : 0);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!customerId) { toast.error('Please select a customer'); return; }
    if (items.some(i => !i.product_id)) { toast.error('Please select products for all items'); return; }
    setLoading(true);
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      });
      toast.success('Order created');
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '560px' }}>
        <h3 className="modal-title">Create Order</h3>
        <div className="form-group">
          <label>Customer</label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">Select customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
          </select>
        </div>

        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
          Order Items
        </label>
        <div className="order-items-builder">
          {items.map((item, i) => (
            <div key={i} className="order-item-row">
              <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                <option value="">Select product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)}) — {p.quantity} in stock</option>)}
              </select>
              <input
                type="number" min="1" value={item.quantity}
                onChange={e => updateItem(i, 'quantity', e.target.value)}
                style={{ width: '80px' }}
              />
              {items.length > 1 && (
                <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => removeItem(i)}>×</button>
              )}
            </div>
          ))}
          <div style={{ padding: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Item</button>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '12px', fontFamily: 'Space Mono, monospace', fontSize: '16px', color: 'var(--accent3)' }}>
          Total: ${getTotal().toFixed(2)}
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetail({ order, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '560px' }}>
        <h3 className="modal-title">Order #{order.id}</h3>
        <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--surface2)', borderRadius: '8px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Customer</div>
          <div style={{ fontWeight: '600' }}>{order.customer?.full_name}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.customer?.email}</div>
        </div>
        <div className="table-wrapper" style={{ marginBottom: '16px' }}>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.id}>
                  <td>{item.product?.name}</td>
                  <td>{item.quantity}</td>
                  <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px' }}>${item.unit_price.toFixed(2)}</td>
                  <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: 'var(--accent3)' }}>${(item.unit_price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'Space Mono, monospace', fontSize: '18px', color: 'var(--accent3)' }}>
          Total: ${order.total_amount.toFixed(2)}
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  const load = async () => {
    try {
      const { data } = await getOrders();
      setOrders([...data].reverse());
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await deleteOrder(id);
      toast.success('Order cancelled');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error cancelling order');
    }
  };

  return (
    <div>
      {showModal && <OrderModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
      {detailOrder && <OrderDetail order={detailOrder} onClose={() => setDetailOrder(null)} />}
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Order</button>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">◎</div>
          <p>No orders yet. Create your first order!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: 'var(--accent)' }}>#{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.customer?.full_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{o.items?.length} item(s)</td>
                  <td style={{ fontFamily: 'Space Mono, monospace', color: 'var(--accent3)' }}>${o.total_amount.toFixed(2)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDetailOrder(o)}>View</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
