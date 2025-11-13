import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state for adding/editing products
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    stock: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, navigate, activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      setError('Failed to fetch products');
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      setError('Failed to fetch orders');
    }
    setLoading(false);
  };

  const handleProductFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/products/${editingId}`, productForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Product updated successfully');
      } else {
        await axios.post('/api/products', productForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Product added successfully');
      }
      
      setProductForm({
        name: '',
        price: '',
        description: '',
        image: '',
        category: '',
        stock: ''
      });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category,
      stock: product.stock
    });
    setEditingId(product._id);
    window.scrollTo(0, 0);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        setError('Failed to delete product');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, isPaid) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/orders/${orderId}`, { isPaid }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Order status updated');
      fetchOrders();
    } catch (error) {
      setError('Failed to update order');
    }
  };

  if (!user || !user.isAdmin) {
    return <div className="error">Access denied. Admin only.</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Panel</h1>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '30px' }}>
        <button
          onClick={() => setActiveTab('products')}
          className={activeTab === 'products' ? 'btn btn-primary' : 'btn btn-secondary'}
        >
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={activeTab === 'orders' ? 'btn btn-primary' : 'btn btn-secondary'}
        >
          Manage Orders
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
            <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Product Name:</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleProductFormChange}
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="text"
                  name="image"
                  value={productForm.image}
                  onChange={handleProductFormChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Category:</label>
                <input
                  type="text"
                  name="category"
                  value={productForm.category}
                  onChange={handleProductFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleProductFormChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setProductForm({
                        name: '',
                        price: '',
                        description: '',
                        image: '',
                        category: '',
                        stock: ''
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <h2>All Products</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Image</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Price</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Stock</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '15px' }}>
                        <img 
                          src={product.image || 'https://via.placeholder.com/50'} 
                          alt={product.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td style={{ padding: '15px' }}>{product.name}</td>
                      <td style={{ padding: '15px' }}>${product.price}</td>
                      <td style={{ padding: '15px' }}>{product.stock}</td>
                      <td style={{ padding: '15px' }}>{product.category}</td>
                      <td style={{ padding: '15px' }}>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="btn btn-primary"
                          style={{ marginRight: '10px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2>All Orders</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            <div>
             {orders.map(order => (
                <div 
                  key={order._id}
                  style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                      <h3>Order ID: {order._id}</h3>
                      <p><strong>Customer:</strong> {order.user?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
                      <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9900' }}>
                        ${order.totalPrice.toFixed(2)}
                      </p>
                      <span style={{
                        padding: '5px 15px',
                        borderRadius: '4px',
                        backgroundColor: order.isPaid ? '#d4edda' : '#fff3cd',
                        color: order.isPaid ? '#155724' : '#856404',
                        display: 'inline-block',
                        marginBottom: '10px'
                      }}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                      <br />
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, !order.isPaid)}
                        className={order.isPaid ? 'btn btn-secondary' : 'btn btn-success'}
                        style={{ marginTop: '10px' }}
                      >
                        {order.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <strong>Shipping Address:</strong>
                    <p>{order.shippingAddress}</p>
                  </div>

                  <div>
                    <strong>Order Items:</strong>
                    <div style={{ marginTop: '10px' }}>
                      {order.orderItems.map((item, index) => (
                        <div 
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            marginBottom: '10px'
                          }}
                        >
                          <img 
                            src={item.image || 'https://via.placeholder.com/60'}
                            alt={item.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <p><strong>{item.name}</strong></p>
                            <p>Quantity: {item.quantity} × ${item.price}</p>
                          </div>
                          <p><strong>${(item.price * item.quantity).toFixed(2)}</strong></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
