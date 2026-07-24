import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Logo from './Logo';
import axios from 'axios';

const normalizeString = (str) => {
  if (!str) return '';
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  
  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync search query from URL parameter if present
  useEffect(() => {
    const searchVal = searchParams.get('search') || '';
    setSearchQuery(searchVal);
  }, [searchParams]);

  // Fetch all products for search suggestions
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setAllProducts(res.data);
      } catch (err) {
        console.error('Error fetching products for search suggestions:', err);
      }
    };
    fetchAllProducts();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (location.pathname !== '/') {
      navigate(searchQuery.trim() ? `/?search=${encodeURIComponent(searchQuery)}` : '/');
    } else {
      const newParams = new URLSearchParams(searchParams);
      if (searchQuery.trim() === '') {
        newParams.delete('search');
      } else {
        newParams.set('search', searchQuery);
      }
      setSearchParams(newParams);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${productId}`);
  };

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = normalizeString(searchQuery);
    return allProducts
      .filter((p) => {
        return normalizeString(p.name).includes(query) || (p.description && normalizeString(p.description).includes(query));
      })
      .slice(0, 5);
  }, [searchQuery, allProducts]);

  const handleCategoryClick = (category) => {
    if (window.location.pathname !== '/') {
      navigate(category === 'Hepsi' ? '/' : `/?category=${encodeURIComponent(category)}`);
    } else {
      const newParams = new URLSearchParams(searchParams);
      if (category === 'Hepsi') {
        newParams.delete('category');
      } else {
        newParams.set('category', category);
      }
      setSearchParams(newParams);
    }
    setIsOpen(false);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const selectedCategory = searchParams.get('category') || 'Hepsi';

  const categoriesList = ['Hepsi', 'Hediyelik', 'Oyuncak', 'Kırtasiye', 'Elektronik'];

  return (
    <nav className="navbar-container">
      {/* Top Bar (Purple) */}
      <div className="navbar-top-bar">
        <div className="navbar-top-inner">
          <Link to="/" className="navbar-logo" onClick={() => handleCategoryClick('Hepsi')}>
            <Logo variant="icon" width="66px" height="66px" />
            <div className="logo-text">
              <span className="logo-title" style={{ letterSpacing: '0.5px', color: '#ffffff' }}>
                ERN <span style={{ color: 'var(--accent)', fontWeight: '800' }}>TOPTAN</span>
              </span>
              <span className="logo-subtitle">Toptan Ticaret</span>
            </div>
          </Link>

          {/* Search Form */}
          <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Ürün adı veya kodu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={handleBlur}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={handleClearSearch}
                aria-label="Aramayı Temizle"
              >
                ✕
              </button>
            )}
            <button type="submit" className="navbar-search-btn" aria-label="Ara">
              <span style={{ fontSize: '1.1rem' }}>🔍</span>
            </button>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="navbar-search-suggestions">
                {suggestions.map((product) => (
                  <div
                    key={product._id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(product._id)}
                  >
                    <img src={product.image} alt={product.name} className="suggestion-thumb" />
                    <div className="suggestion-info">
                      <span className="suggestion-name">{product.name}</span>
                      <span className="suggestion-category">{product.category}</span>
                    </div>
                    <span className="suggestion-price">
                      ₺{product.wholesalePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* No suggestions helper */}
            {showSuggestions && searchQuery.trim() && suggestions.length === 0 && (
              <div className="navbar-search-suggestions">
                <div className="no-suggestions">
                  Sonuç bulunamadı
                </div>
              </div>
            )}
          </form>

          {/* Mobile menu toggle */}
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Navigasyonu Aç">
            <div className={`bar ${isOpen ? 'open' : ''}`} style={{ backgroundColor: '#ffffff' }}></div>
            <div className={`bar ${isOpen ? 'open' : ''}`} style={{ backgroundColor: '#ffffff' }}></div>
            <div className={`bar ${isOpen ? 'open' : ''}`} style={{ backgroundColor: '#ffffff' }}></div>
          </button>

          {/* Auth & Cart Actions */}
          <div className={`navbar-links ${isOpen ? 'mobile-open' : ''}`}>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-item admin-badge" style={{ color: 'var(--accent)' }} onClick={() => setIsOpen(false)}>
                    👑 Admin Paneli
                  </Link>
                )}
                {user.role !== 'admin' && (
                  <Link to="/cart" className="nav-item cart-nav-btn" style={{ color: '#ffffff' }} onClick={() => setIsOpen(false)}>
                    🛒 Sepetim
                    {totalItems > 0 && <span className="cart-badge" style={{ backgroundColor: 'var(--accent)', color: '#000' }}>{totalItems}</span>}
                  </Link>
                )}
                <div className="nav-user-info" style={{ borderLeftColor: 'rgba(255, 255, 255, 0.15)' }}>
                  {user.role !== 'admin' ? (
                    <Link to="/account" className="user-greeting hover-underline" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: '600' }} title="Hesap Bilgilerim" onClick={() => setIsOpen(false)}>
                      👤 Merhaba, {user.name}
                    </Link>
                  ) : (
                    <span className="user-greeting" style={{ color: '#ffffff', fontWeight: '600' }}>
                      👑 {user.name}
                    </span>
                  )}
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="btn btn-outline btn-sm logout-btn">
                    Çıkış Yap
                  </button>
                </div>
              </>
            ) : (
              <div className="nav-auth-buttons">
                <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>Giriş Yap</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>Kayıt Ol</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar (White / Category Menu) */}
      <div className="navbar-bottom-bar">
        <div className="navbar-bottom-inner">
          <div className="navbar-category-links">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`nav-item ${selectedCategory === cat ? 'active' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  textTransform: 'capitalize'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
