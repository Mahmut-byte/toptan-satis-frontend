import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { turkeyAddressData } from '../utils/turkeyAddressData';

const Cart = () => {
  const {
    cartItems,
    totalAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
    getWhatsappUrl,
    showToast,
  } = useContext(CartContext);

  const { user } = useContext(AuthContext);

  // checkoutStep: 1 = Sepet İnceleme, 2 = Alıcı / Teslimat Bilgileri
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Form states prefilled from user profile context
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [district, setDistrict] = useState(user?.district || '');

  const cities = Object.keys(turkeyAddressData);
  const districts = city ? turkeyAddressData[city] : [];

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) return;

    if (checkoutStep === 1) {
      setCheckoutStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (!fullName.trim() || !phone.trim() || !address.trim() || !city || !district) {
        showToast('Lütfen tüm alıcı ve teslimat bilgilerini doldurun', 'error');
        return;
      }
      
      try {
        const orderData = {
          items: cartItems.map(item => ({
            product: item.product._id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.wholesalePrice,
            image: item.product.image
          })),
          shippingAddress: {
            fullName,
            phone,
            city,
            district,
            address
          },
          totalAmount
        };
        
        await axios.post('/api/orders', orderData);
        
        const whatsappUrl = getWhatsappUrl({
          name: fullName,
          phone,
          address,
          city,
          district
        });
        showToast('Siparişiniz kaydedildi, WhatsApp\'a yönlendiriliyorsunuz...', 'success');
        
        // Redirect to WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Clear cart after redirect
        clearCart();
      } catch (err) {
        console.error('Error creating order:', err);
        showToast('Sipariş kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-state glass-panel">
        <span className="empty-cart-emoji">🛒</span>
        <h2>Sepetiniz Boş</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', marginTop: '0.5rem' }}>
          Toptan kataloğumuzdan ürün seçip sepetinize ekleyin.
        </p>
        <Link to="/" className="btn btn-primary">
          Kataloğu Görüntüle
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>
        {checkoutStep === 1 ? 'Sipariş Sepetiniz' : 'Siparişinizi Tamamlayın'}
      </h2>

      <div className="cart-grid">
        {checkoutStep === 1 ? (
          /* Cart Items List */
          <div className="cart-items-panel glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Sepetteki Ürünler</span>
              <button onClick={clearCart} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', height: 'auto', padding: '6px 12px' }}>
                Sepeti Temizle
              </button>
            </div>

            <div>
              {cartItems.map((item) => (
                <div key={item.product._id} className="cart-item-row">
                  <div className="cart-item-details">
                    <img src={item.product.image} alt={item.product.name} className="cart-item-thumb" />
                    <div className="cart-item-name-cat">
                      <span className="cart-item-name">{item.product.name}</span>
                      <span className="cart-item-cat">{item.product.category}</span>
                    </div>
                  </div>

                  <div className="cart-item-pricing">
                    {/* Quantity selector */}
                    <div className="quantity-selector">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.product.stock)}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span style={{ width: '40px', textAlign: 'center', fontWeight: '700' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.product.stock)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price-desc">
                      <span className="cart-item-subtotal">
                        ₺{(item.product.wholesalePrice * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({item.quantity} x ₺{item.product.wholesalePrice})
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="btn-icon"
                      style={{ color: 'var(--danger)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Checkout Billing/Delivery Form */
          <div className="cart-items-panel glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>✍️ Alıcı ve Sevkiyat Bilgileri</span>
              <button 
                onClick={() => setCheckoutStep(1)} 
                className="btn btn-outline btn-sm"
                style={{ height: 'auto', padding: '6px 12px' }}
              >
                ← Sepeti Düzenle
              </button>
            </div>

            <form onSubmit={handleCheckout}>
              <div className="form-group">
                <label className="form-label">Alıcı İsim Soyisim *</label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınızı ve soyadınızı girin"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon Numarası *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Örn: 0555 123 4567"
                  required
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
                    required
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
                    required
                  >
                    <option value="">Seçiniz</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Toptan Teslimat Adresi *</label>
                <textarea
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Fatura ve sevkiyat işlemlerinde kullanılacak detaylı toptan teslimat adresi..."
                  rows="4"
                  required
                />
              </div>
            </form>
          </div>
        )}

        {/* Order Summary Panel */}
        <div className="cart-summary-panel glass-panel">
          <h3 className="cart-summary-title">Sipariş Özeti</h3>
          
          <div className="summary-row">
            <span>Toplam Ürün Sayısı:</span>
            <span style={{ fontWeight: '600' }}>
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)} adet
            </span>
          </div>
          
          <div className="summary-row">
            <span>Benzersiz Ürün:</span>
            <span style={{ fontWeight: '600' }}>{cartItems.length} çeşit</span>
          </div>

          <div className="summary-row total">
            <span>Tahmini Tutar:</span>
            <span>₺{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '1.5rem 0', lineHeight: '1.4' }}>
            ⚠️ <strong>Not:</strong> Siparişiniz WhatsApp'a iletildikten sonra toptan satış yetkilimiz sizinle iletişime geçecektir. Sevkiyat ve fatura işlemleri yukarıda belirttiğiniz teslimat bilgileri doğrultusunda planlanacaktır.
          </p>

          <button
            onClick={handleCheckout}
            className="btn btn-whatsapp full-width"
            style={{ display: 'flex', gap: '10px', height: '48px', justifyContent: 'center', alignItems: 'center' }}
          >
            {checkoutStep === 1 ? (
              <span>Alıcı ve Adres Bilgilerini Gir →</span>
            ) : (
              <span>💬 Siparişi WhatsApp ile Tamamla</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
