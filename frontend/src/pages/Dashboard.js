import React, { useEffect, useState } from 'react';
import { getProducts, getCustomers, getOrders } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Fake demo products for initial display
const DEMO_PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, quantity: 25, image_url: '🎧' },
  { id: 2, name: 'USB-C Cable', price: 12.99, quantity: 150, image_url: '🔌' },
  { id: 3, name: 'Phone Case', price: 24.99, quantity: 80, image_url: '📱' },
  { id: 4, name: 'Laptop Stand', price: 49.99, quantity: 45, image_url: '💻' },
  { id: 5, name: 'Power Bank', price: 34.99, quantity: 60, image_url: '🔋' },
  { id: 6, name: 'Screen Protector', price: 9.99, quantity: 200, image_url: '🛡️' },
  { id: 7, name: 'Wireless Mouse', price: 39.99, quantity: 55, image_url: '🖱️' },
  { id: 8, name: 'Keyboard', price: 89.99, quantity: 30, image_url: '⌨️' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, c, o] = await Promise.all([getProducts(), getCustomers(), getOrders()]);
        setStats({ products: p.data.length, customers: c.data.length, orders: o.data.length });
        
        // Logic: Show demo data if no products, switch to real data once product count >= 1
        if (p.data.length === 0) {
          setProducts(DEMO_PRODUCTS);
        } else {
          setProducts(p.data);
        }
        
        setLowStock(p.data.filter(prod => prod.quantity <= 5).slice(0, 5));
        setRecentOrders(o.data.slice(-5).reverse());

        // Prepare category distribution (simulated by product count)
        const categoryDist = [
          { name: 'Electronics', value: p.data.filter(x => x.name?.includes('phone') || x.name?.includes('laptop')).length || Math.floor(p.data.length * 0.3) },
          { name: 'Accessories', value: p.data.filter(x => x.name?.includes('case') || x.name?.includes('cable')).length || Math.floor(p.data.length * 0.25) },
          { name: 'Other', value: Math.max(1, p.data.length - (Math.floor(p.data.length * 0.3) + Math.floor(p.data.length * 0.25))) }
        ];
        setCategoryData(categoryDist);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Overview of your inventory system</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card purple">
          <div className="stat-value">{stats.products}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-value">{stats.customers}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.orders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
      </div>

      {/* Product List & Category Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-muted)' }}>
            {stats.products === 0 ? 'DEMO PRODUCTS' : 'PRODUCT LIST'}
          </h3>
          {stats.products === 0 && (
            <div style={{ fontSize: '11px', backgroundColor: '#f0fef9', color: '#059669', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #d1fae5' }}>
              📌 Demo mode: Add your first product to see real data
            </div>
          )}
          {products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
              {products.map(product => (
                <div key={product.id} style={{
                  backgroundColor: '#f8fafb',
                  border: '1px solid #e0e7eb',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(34,197,94,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{
                    width: '100%',
                    height: '100px',
                    backgroundColor: '#f0f3f5',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    overflow: 'hidden'
                  }}>
                    {typeof product.image_url === 'string' && product.image_url.startsWith('http') ? (
                      <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{product.image_url || '📦'}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#22c55e' }}>
                    ${product.price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                    Stock: {product.quantity}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>No products available</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-muted)' }}>
            PRODUCT CATEGORIES
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #22c55e', borderRadius: '8px', color: '#1f2937' }}
                />
                <Bar dataKey="value" fill="#22c55e" name="Products" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>No data available</p>
          )}
        </div>
      </div>

      {/* Low Stock & Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-muted)' }}>
            LOW STOCK PRODUCTS
          </h3>
          {lowStock.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>All products well-stocked ✓</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStock.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                  </div>
                  <span className={`badge ${p.quantity === 0 ? 'badge-red' : 'badge-orange'}`}>
                    {p.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-muted)' }}>
            RECENT ORDERS
          </h3>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No orders yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentOrders.map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>Order #{o.id}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.customer?.full_name}</div>
                  </div>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: 'var(--accent3)' }}>
                    ${o.total_amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
