import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import axios from 'axios';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        shippingAddress,
        totalPrice: getCartTotal()
      };

      await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1>Shopping Cart</h1>
      
      {error && <div className="error">{error}</div>}

      <div style={{ marginTop: '30px' }}>
        {cartItems.map(item => (
          <CartItem key={item._id} item={item} />
        ))}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Order Summary</h2>
        <div style={{ fontSize: '24px', margin: '20px 0' }}>
          <strong>Total: ${getCartTotal().toFixed(2)}</strong>
        </div>

        <div className="form-group">
          <label><strong>Shipping Address:</strong></label>
          <textarea
            placeholder="Enter your complete shipping address..."
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            rows="4"
          />
        </div>

        <button
          onClick={handleCheckout}
          className="btn btn-success"
          style={{ width: '100%', padding: '15px', fontSize: '18px' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
