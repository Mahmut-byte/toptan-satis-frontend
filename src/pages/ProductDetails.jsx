import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { globalCache } from '../utils/cache';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, syncUserFavorites } = useContext(AuthContext);
  const { addToCart, showToast } = useContext(CartContext);

  const foundProduct = globalCache.products?.find((p) => p._id === id);

  const [product, setProduct] = useState(foundProduct || null);
  const [loading, setLoading] = useState(!foundProduct);
  const [activeImage, setActiveImage] = useState(foundProduct?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
        if (!activeImage) {
          setActiveImage(res.data.image);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (!foundProduct) {
          showToast('Ürün detayları yüklenirken hata oluştu', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <h3>Ürün detayları yükleniyor...</h3>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Ürün bulunamadı.</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>
          Anasayfaya Dön
        </Link>
      </div>
    );
  }

  const isFavorite = user?.favorites?.includes(product._id);
  const isOutOfStock = product.stock <= 0;

  const handleFavoriteToggle = async () => {
    if (!user) return;
    try {
      const res = await axios.post(`/api/auth/favorites/${product._id}`);
      syncUserFavorites(res.data.favorites);
      showToast(res.data.message, 'success');
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleAdd = () => {
    setAdding(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setAdding(false);
      showToast(`${quantity} adet ürün sepetinize eklendi`, 'success');
    }, 400);
  };

  // Compile all images (primary + additional)
  const productImages = [product.image, ...(product.images || [])].filter(
    (img, idx, self) => img && self.indexOf(img) === idx
  );

  const handlePrevImage = () => {
    const currentIndex = productImages.indexOf(activeImage || product.image);
    const prevIndex = (currentIndex - 1 + productImages.length) % productImages.length;
    setActiveImage(productImages[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = productImages.indexOf(activeImage || product.image);
    const nextIndex = (currentIndex + 1) % productImages.length;
    setActiveImage(productImages[nextIndex]);
  };

  // Generate direct inquiry WhatsApp link
  const getInquiryWhatsappUrl = () => {
    const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '905319742102';
    const number = rawNumber.replace(/\D/g, '');
    const message = `Merhaba, şu ürün hakkında detaylı toptan satış bilgisi alabilir miyim?\n\n📦 *Ürün:* ${product.name}\n📂 *Kategori:* ${product.category}\n💰 *Toptan Fiyatı:* ₺${product.wholesalePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-primary"
        style={{
          height: '42px',
          padding: '0 20px',
          marginBottom: '1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(108, 92, 231, 0.25)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.95rem',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}
      >
        ← Geri Dön
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Image Gallery */}
        <div>
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px', position: 'relative' }}>
            {/* Main active image */}
            <img
              src={activeImage || product.image}
              alt={product.name}
              style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: '8px' }}
            />

            {productImages.length > 1 && (
              <>
                {/* Left Arrow */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    zIndex: 4
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                  aria-label="Önceki Görsel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '20px', height: '20px', color: 'var(--text-primary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* Right Arrow */}
                <button
                  type="button"
                  onClick={handleNextImage}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    zIndex: 4
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                  aria-label="Sonraki Görsel"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '20px', height: '20px', color: 'var(--text-primary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
            
            {user && user.role !== 'admin' && (
              <button
                type="button"
                onClick={handleFavoriteToggle}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  zIndex: 5
                }}
                title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? '#ef4444' : 'none'}
                  stroke={isFavorite ? '#ef4444' : '#64748b'}
                  strokeWidth={2}
                  style={{ width: '22px', height: '22px' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </button>
            )}
          </div>

          {/* Thumbnail list if there are multiple images */}
          {productImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', overflowX: 'auto', padding: '4px 0' }}>
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{
                    padding: 0,
                    border: activeImage === img ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: 'none',
                    cursor: 'pointer',
                    width: '70px',
                    height: '70px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img
                    src={img}
                    alt={`Küçük Resim ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info details */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ 
              display: 'inline-block',
              background: 'var(--accent-glow)',
              color: 'var(--primary)',
              fontWeight: '700',
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '20px',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: '800' }}>
              {product.name}
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
              {product.description || 'Bu toptan ürün için henüz açıklama girilmemiştir.'}
            </p>
          </div>

          <div>
            {user ? (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Toptan Birim Fiyatı
                    </span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      ₺{product.wholesalePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div>
                    {isOutOfStock ? (
                      <span className="stock-status-badge out-of-stock" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                        Stokta Yok
                      </span>
                    ) : (
                      <span className="stock-status-badge in-stock" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                        Stokta Var
                      </span>
                    )}
                  </div>
                </div>

                {user.role !== 'admin' ? (
                  <>
                    {!isOutOfStock ? (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <div className="quantity-selector" style={{ height: '48px', width: '120px' }}>
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
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={handleAdd}
                          className="btn btn-primary"
                          style={{ flex: 1, height: '48px' }}
                          disabled={adding}
                        >
                          {adding ? 'Sepete Ekleniyor...' : 'Sepete Ekle'}
                        </button>
                      </div>
                    ) : null}

                    {/* WhatsApp inquiry button */}
                    <a
                      href={getInquiryWhatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        height: '48px', 
                        textDecoration: 'none',
                        color: '#ffffff',
                        fontWeight: '600'
                      }}
                    >
                      💬 WhatsApp ile Bilgi Al / Sipariş Ver
                    </a>
                  </>
                ) : (
                  <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    👑 <strong>Admin Görünümü:</strong> Yönetici hesabı ile giriş yaptınız. Bu sayfadan doğrudan WhatsApp sorgusu gönderebilir veya stokları düzenlemek için yönetim paneline geçebilirsiniz.
                    <Link to="/admin" className="btn btn-outline" style={{ display: 'block', marginTop: '0.8rem', textAlign: 'center', textDecoration: 'none', height: 'auto', padding: '8px' }}>
                      Yönetim Paneline Git
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Fiyatları görmek, stok durumunu incelemek ve toptan sipariş vermek için lütfen üye girişi yapın.
                </p>
                <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Giriş Yap
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
