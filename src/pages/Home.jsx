import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';
import { globalCache } from '../utils/cache';

const normalizeString = (str) => {
  if (!str) return '';
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const Home = () => {
  const [products, setProducts] = useState(globalCache.products || []);
  const [loading, setLoading] = useState(!globalCache.products);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useContext(CartContext);

  const selectedCategory = searchParams.get('category') || 'Hepsi';
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        globalCache.products = res.data;
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        if (!globalCache.products) {
          setError('Ürünler yüklenirken bir hata oluştu');
          showToast('Ürün listesi yüklenemedi', 'error');
        }
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const setSelectedCategory = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === 'Hepsi') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const handleDiscoverClick = () => {
    const catalogElement = document.getElementById('catalog-section');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter products by category and search term (case-insensitive, Turkish-friendly normalization)
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'Hepsi' ||
      normalizeString(product.category) === normalizeString(selectedCategory);
    const matchesSearch =
      normalizeString(product.name).includes(normalizeString(searchTerm)) ||
      (product.description && normalizeString(product.description).includes(normalizeString(searchTerm)));
    return matchesCategory && matchesSearch;
  });

  const categoriesConfig = [
    { name: 'Hediyelik', image: '/images/gift_box_3d.png' },
    { name: 'Oyuncak', image: '/images/toy_pyramid_3d.png' },
    { name: 'Kırtasiye', image: '/images/stationery_3d.png' },
    { name: 'Elektronik', image: '/images/electronics_3d.png' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <h2>Ürünler Yükleniyor...</h2>
      </div>
    );
  }

  return (
    <div>
      {/* 3D Hero Banner */}
      <div className="hero-banner-new">
        <div className="hero-content-new">
          <h1>
            HEDİYE VE OYUNCAKTA<br />
            <span className="highlight-blue">YARATICI</span> <span className="highlight-green">DÜNYA.</span>
          </h1>
          <p>
            En popüler hediyelik eşya, oyuncak, kırtasiye ve elektronik ürünlerinde en uygun toptan fiyatlar. Siparişlerinizi sepetinize ekleyin ve WhatsApp üzerinden kolayca tamamlayın!
          </p>
          <button className="btn btn-secondary btn-lg" style={{ height: '48px', padding: '0 28px', fontSize: '1.05rem', borderRadius: 'var(--radius-sm)' }} onClick={handleDiscoverClick}>
            Keşfet
          </button>
        </div>
        <div className="hero-img-new">
          <img src="/images/hero_3d_banner.png" alt="ERN Toptan Banner" />
        </div>
      </div>

      {/* Promotional Cards (2-columns) */}
      <div className="promo-grid">
        <div className="promo-card teal" onClick={() => setSelectedCategory('Hediyelik')} style={{ cursor: 'pointer' }}>
          <div className="promo-info">
            <h2>HEDİYELİK<br />DÜNYASI</h2>
            <p>Seçkin Toptan Hediyelikler</p>
          </div>
          <div className="promo-img">
            <img src="/images/gift_box_3d.png" alt="Hediyelik Dünyası" />
          </div>
        </div>
        
        <div className="promo-card yellow" onClick={() => setSelectedCategory('Oyuncak')} style={{ cursor: 'pointer' }}>
          <div className="promo-info">
            <h2>OYUNCAKTA<br />YENİLİK</h2>
            <p>Eğlenceli & Eğitici Oyuncaklar</p>
          </div>
          <div className="promo-img">
            <img src="/images/toy_pyramid_3d.png" alt="Oyuncak Dünyası" />
          </div>
        </div>
      </div>

      {/* Interactive Category Selector Grid */}
      <div>
        <h2 className="cat-section-title">Kategoriler</h2>
        <div className="cat-card-grid">
          {categoriesConfig.map((cat) => (
            <div
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`cat-card ${selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''}`}
            >
              <div className="cat-card-img">
                <img src={cat.image} alt={cat.name} />
              </div>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog & Filter Section Header */}
      <div id="catalog-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginTop: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0' }}>
            {selectedCategory === 'Hepsi' ? 'Tüm Ürünler' : `${selectedCategory} Kategorisi`}
          </h2>
          {searchTerm && (
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              🔍 "<strong>{searchTerm}</strong>" araması için sonuçlar listeleniyor.
            </p>
          )}
        </div>
        <button
          onClick={() => {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('category');
            newParams.delete('search');
            setSearchParams(newParams);
          }}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.85rem' }}
          disabled={selectedCategory === 'Hepsi' && !searchTerm}
        >
          Filtreleri Temizle
        </button>
      </div>

      {/* Error View */}
      {error && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)', background: '#ffffff' }}>
          <p>{error}</p>
        </div>
      )}

      {/* Product Grid */}
      {!error && filteredProducts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#ffffff' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
          <p>Aramanıza veya seçtiğiniz kategoriye uygun ürün bulunamadı.</p>
        </div>
      ) : (
        <div className="grid-catalog">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
