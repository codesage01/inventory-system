import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || { name: '', sku: '', price: '', quantity: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.sku || form.price === '' || form.quantity === '') {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
      if (product) {
        await updateProduct(product.id, data);
        toast.success('Product updated');
      } else {
        await createProduct(data);
        toast.success('Product created');
      }
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 className="modal-title">{product ? 'Edit Product' : 'Add Product'}</h3>
        <div className="form-group">
          <label>Product Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Mouse" />
        </div>
        <div className="form-group">
          <label>SKU / Code</label>
          <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WM-001" />
        </div>
        <div className="form-group">
          <label>Price ($)</label>
          <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
        </div>
        <div className="form-group">
          <label>Quantity in Stock</label>
          <input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    try {
      const { data } = await getProducts();
      setProducts(data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error deleting product');
    }
  };

  return (
    <div>
      {modal && <ProductModal product={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">{products.length} products in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>+ Add Product</button>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">▦</div>
          <p>No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{p.sku}</td>
                  <td style={{ fontFamily: 'Space Mono, monospace' }}>${p.price.toFixed(2)}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <span className={`badge ${p.quantity === 0 ? 'badge-red' : p.quantity <= 5 ? 'badge-orange' : 'badge-green'}`}>
                      {p.quantity === 0 ? 'Out of Stock' : p.quantity <= 5 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
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
