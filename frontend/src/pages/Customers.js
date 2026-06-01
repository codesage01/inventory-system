import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';

function CustomerModal({ onClose, onSave }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.phone) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await createCustomer(form);
      toast.success('Customer added');
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error saving customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 className="modal-title">Add Customer</h3>
        <div className="form-group">
          <label>Full Name</label>
          <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try {
      const { data } = await getCustomers();
      setCustomers(data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This may affect their orders.`)) return;
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error deleting customer');
    }
  };

  return (
    <div>
      {showModal && <CustomerModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); load(); }} />}
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
      </div>

      {loading ? (
        <div className="loading">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <div className="icon">◉</div>
          <p>No customers yet. Add your first customer!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.full_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.email}</td>
                  <td>{c.phone}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.full_name)}>Delete</button>
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
