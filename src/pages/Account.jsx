import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { turkeyAddressData } from '../utils/turkeyAddressData';
import { globalCache } from '../utils/cache';

const Account = () => {
  const { user, updateProfile, syncUserFavorites, logout } = useContext(AuthContext);
  const { showToast } = useContext(CartContext);
  const navigate = useNavigate();

  // Tabs: 'profile' or 'favorites' or 'orders'
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [city, setCity] = useState(user?.city || '');
  const [district, setDistrict] = useState(user?.district || '');
  
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Favorites list state
  const [favoriteProducts, setFavoriteProducts] = useState(globalCache.favorites || []);
  const [loadingFavorites, setLoadingFavorites] = useState(!globalCache.favorites);

  // Orders list state
  const [myOrders, setMyOrders] = useState(globalCache.orders || []);
  const [loadingOrders, setLoadingOrders] = useState(!globalCache.orders);

  const cities = Object.keys(turkeyAddressData);
  const districts = city ? turkeyAddressData[city] : [];

  // Keep form inputs synced with user context updates (handles slow load & post-update reactivity)
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setDistrict(user.district || '');
    }
  }, [user]);

  // Load populated favorites or orders when activeTab changes
  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites();
    } else if (activeTab === 'orders') {
      fetchMyOrders();
    }
  }, [activeTab]);

  const fetchFavorites = async () => {
    if (!globalCache.favorites) {
      setLoadingFavorites(true);
    }
    try {
      const res = await axios.get('/api/auth/favorites');
      globalCache.favorites = res.data;
      setFavoriteProducts(res.data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      showToast('Favoriler yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchMyOrders = async () => {
    if (!globalCache.orders) {
      setLoadingOrders(true);
    }
    try {
      const res = await axios.get('/api/orders/myorders');
      globalCache.orders = res.data;
      setMyOrders(res.data);
    } catch (err) {
      console.error('Error fetching my orders:', err);
      showToast('Sipariş geçmişiniz yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      showToast('Şifreler eşleşmiyor', 'error');
      return;
    }

    setUpdating(true);
    const updateData = { name, fullName, phone, address, city, district };
    if (password) {
      updateData.password = password;
    }

    const res = await updateProfile(updateData);
    setUpdating(false);

    if (res.success) {
      showToast('Profil ve adres bilgileriniz başarıyla güncellendi', 'success');
      setPassword('');
      setConfirmPassword('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setShowDeleteModal(false);
      const res = await axios.delete('/api/auth/me');
      if (res.data.success) {
        showToast(res.data.message || 'Hesabınız başarıyla silindi.', 'success');
        logout();
        navigate('/login');
      } else {
        showToast(res.data.message || 'Hesap silinirken bir hata oluştu.', 'error');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      showToast(err.response?.data?.message || 'Hesap silinirken sunucu hatası oluştu.', 'error');
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      const res = await axios.post(`/api/auth/favorites/${productId}`);
      syncUserFavorites(res.data.favorites);
      const updatedFavs = favoriteProducts.filter(p => p._id !== productId);
      globalCache.favorites = updatedFavs;
      setFavoriteProducts(updatedFavs);
      showToast('Ürün favorilerden kaldırıldı', 'success');
    } catch (err) {
      console.error('Error removing favorite:', err);
      showToast('Favori kaldırılırken hata oluştu', 'error');
    }
  };

  return (
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 0' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Hesabım</h2>

      {/* Profile Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 20px', borderRadius: '4px 4px 0 0', borderBottom: 'none', height: 'auto' }}
        >
          👤 Profil ve Adres Bilgilerim
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 20px', borderRadius: '4px 4px 0 0', borderBottom: 'none', height: 'auto' }}
        >
          ❤️ Favori Ürünlerim ({user?.favorites?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 20px', borderRadius: '4px 4px 0 0', borderBottom: 'none', height: 'auto' }}
        >
          📋 Sipariş Geçmişim ({myOrders.length})
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Bilgilerimi Güncelle
          </h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label">Kullanıcı Adı</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">İsim Soyisim</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adınızı ve soyadınızı girin"
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-posta Adresi (Değiştirilemez)</label>
              <input
                type="email"
                className="form-control"
                value={user?.email}
                disabled
                style={{ backgroundColor: '#e2e8f0', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefon Numarası</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Örn: 0555 123 4567"
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">İl *</label>
                <select
                  className="form-control"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setDistrict('');
                  }}
                >
                  <option value="">Seçiniz</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">İlçe *</label>
                <select
                  className="form-control"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!city}
                >
                  <option value="">Seçiniz</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Toptan Teslimat Adresi</label>
              <textarea
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Fatura ve sevkiyat işlemlerinde kullanılacak detaylı toptan teslimat adresi..."
                rows="4"
              />
            </div>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

            <h4 style={{ marginBottom: '1rem' }}>Şifre Değiştir (İsteğe Bağlı)</h4>

            <div className="form-group">
              <label className="form-label">Yeni Şifre</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Yeni şifrenizi girin (min. 6 karakter)"
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    outline: 'none'
                  }}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Yeni Şifre Tekrar</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifrenizi tekrar girin"
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    outline: 'none'
                  }}
                  aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>


            <button type="submit" className="btn btn-primary full-width" style={{ marginTop: '1.5rem', height: '48px' }} disabled={updating}>
              {updating ? 'Bilgiler Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </form>

          {user?.role !== 'admin' && (
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="btn full-width"
              style={{
                marginTop: '1rem',
                height: '48px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#b91c1c'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#dc2626'; }}
            >
              Hesabımı Sil
            </button>
          )}
        </div>
      ) : activeTab === 'favorites' ? (
        <div>
          {loadingFavorites ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>Favoriler Yükleniyor...</h3>
            </div>
          ) : favoriteProducts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>❤️</span>
              <h3>Henüz favori ürününüz bulunmamaktadır.</h3>
              <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Toptan ürün kataloglarimizi inceleyerek beğendiğiniz ürünleri favorilerinize ekleyebilirsiniz.
              </p>
              <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Kataloğu İncele
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {favoriteProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                return (
                  <div key={product._id} className="product-card glass-panel" style={{ position: 'relative' }}>
                    <button
                      onClick={() => handleRemoveFavorite(product._id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#ef4444',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
                        zIndex: 5
                      }}
                      title="Favorilerden Kaldır"
                    >
                      &times;
                    </button>

                    <div className="product-img-wrapper">
                      <img src={product.image} alt={product.name} className="product-image" />
                      {isOutOfStock ? (
                        <span className="stock-status-badge out-of-stock">Stokta Yok</span>
                      ) : (
                        <span className="stock-status-badge in-stock">Stokta Var</span>
                      )}
                    </div>

                    <div className="product-info">
                      <span className="product-category">{product.category}</span>
                      <h3 className="product-name">{product.name}</h3>
                      
                      <div className="product-action-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                        <div className="price-tag">
                          <span className="price-label">Toptan Fiyatı</span>
                          <span className="price-value" style={{ fontSize: '1.1rem' }}>
                            ₺{product.wholesalePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* activeTab === 'orders' */
        <div>
          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>Sipariş Geçmişiniz Yükleniyor...</h3>
            </div>
          ) : myOrders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📋</span>
              <h3>Henüz bir siparişiniz bulunmamaktadır.</h3>
              <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Toptan ürün kataloglarımızı inceleyerek ilk siparişinizi verebilirsiniz.
              </p>
              <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Kataloğu İncele
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {myOrders.map((order) => (
                <div key={order._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Sipariş Tarihi</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{new Date(order.createdAt).toLocaleString('tr-TR')}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'right' }}>Toplam Tutar</span>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                        ₺{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>📍 Teslimat Adresi:</strong> {order.shippingAddress?.fullName} | {order.shippingAddress?.phone} | {order.shippingAddress?.city}, {order.shippingAddress?.district} | {order.shippingAddress?.address}
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', background: '#f1f5f9' }}>
                          <th style={{ padding: '6px 12px', color: 'var(--text-primary)', width: '60px' }}>Görsel</th>
                          <th style={{ padding: '6px 12px', color: 'var(--text-primary)' }}>Ürün Adı</th>
                          <th style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--text-primary)' }}>Toptan Fiyat</th>
                          <th style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--text-primary)' }}>Adet</th>
                          <th style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--text-primary)' }}>Toplam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle' }}>
                            <td style={{ padding: '8px 12px', width: '60px' }}>
                              <img
                                src={item.image || item.product?.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=150'}
                                alt={item.name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=150';
                                }}
                              />
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: '600' }}>{item.name}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                              ₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-primary)' }}>{item.quantity}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                              ₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

    {showDeleteModal && (
      <div className="custom-modal-overlay">
        <div className="custom-modal-card">
          <div className="custom-modal-title">
            <span>⚠️</span> Hesabımı Sil
          </div>
          <p className="custom-modal-text">
            Hesabınızı silmek istediğinize emin misiniz? Bu işlem sonucunda sipariş geçmişiniz dahil tüm verileriniz kalıcı olarak veritabanından silinecektir.
          </p>
          <div className="custom-modal-actions">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={() => setShowDeleteModal(false)}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className="modal-btn-confirm"
              onClick={confirmDeleteAccount}
            >
              Evet, Sil
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Account;
