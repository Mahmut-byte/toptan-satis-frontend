import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { user, syncUserFavorites } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    addToCart(product, quantity);
  };

  const isFavorite = user?.favorites?.includes(product._id);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      const res = await axios.post(`/api/auth/favorites/${product._id}`);
      syncUserFavorites(res.data.favorites);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card glass-panel-interactive">
      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="product-img-wrapper" style={{ position: 'relative' }}>
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
          
          {user && user.role !== 'admin' && (
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className="favorite-btn"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                zIndex: 5
              }}
              aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isFavorite ? '#ef4444' : 'none'}
                stroke={isFavorite ? '#ef4444' : '#64748b'}
                strokeWidth={2}
                style={{ width: '20px', height: '20px' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>
          )}

          {isOutOfStock ? (
            <span className="stock-status-badge out-of-stock">Stokta Yok</span>
          ) : (
            <span className="stock-status-badge in-stock">Stokta Var</span>
          )}
        </div>
      </Link>

      <div className="product-info">
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <span className="product-category">{product.category}</span>
          <h3 className="product-name" style={{ transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>{product.name}</h3>
        </Link>

        <div className="product-action-section">
          {user ? (
            <>
              <div className="price-tag">
                <span className="price-label">Toptan Birim Fiyatı</span>
                <span className="price-value">
                  ₺{product.wholesalePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {!isOutOfStock && user.role !== 'admin' && (
                <div className="cart-controls">
                  <div className="quantity-selector">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="qty-input"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <button onClick={handleAdd} className="btn btn-primary btn-add-cart">
                    Sepete Ekle
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="auth-required-block">
              <span className="price-hidden-info">Toptan fiyatları sadece kayıtlı bayiler görebilir.</span>
              <Link to="/login" className="btn btn-outline btn-sm full-width">
                Fiyatları Görmek İçin Giriş Yap
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
