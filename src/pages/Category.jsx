import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

const getCategoryTheme = (category) => {
  const normalized = normalizeString(category);
  switch (normalized) {
    case 'hediyelik':
      return {
        title: 'Toptan Hediyelik Eşyalar',
        subtitle: 'En seçkin hediyelik ürünler ve özel kutu modelleri.',
        bgClass: 'promo-card teal',
        image: '/images/gift_box_3d.png'
      };
    case 'oyuncak':
      return {
        title: 'Toptan Oyuncaklar',
        subtitle: 'Eğlenceli, eğitici ve kaliteli çocuk oyuncak modelleri.',
        bgClass: 'promo-card yellow',
        image: '/images/toy_pyramid_3d.png'
      };
    case 'kirtasiye':
      return {
        title: 'Kırtasiye Ürünleri',
        subtitle: 'Kalem, defter ve tüm toptan okul/ofis sarf malzemeleri.',
        bgClass: 'promo-card rose',
        image: '/images/stationery_3d.png'
      };
    case 'elektronik':
      return {
        title: 'Toptan Elektronik',
        subtitle: 'Kulaklıklar, şarj aletleri ve aradığınız tüm teknolojik aksesuarlar.',
        bgClass: 'promo-card indigo',
        image: '/images/electronics_3d.png'
      };
    default:
      return {
        title: `${category} Ürünleri`,
        subtitle: `Toptan ${category} modelleri en uygun fiyatlarla.`,
        bgClass: 'promo-card gray',
        image: '/images/hero_3d_banner.png'
      };
  }
};

const Category = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState(globalCache.products || []);
  const [loading, setLoading] = useState(!globalCache.products);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useContext(CartContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryName]);

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
  }, [showToast]);

  const theme = getCategoryTheme(categoryName);

  // Filter products by category and local search term
  const categoryProducts = products.filter((product) => {
    const matchesCategory = normalizeString(product.category) === normalizeString(categoryName);
    const matchesSearch =
      normalizeString(product.name).includes(normalizeString(searchTerm)) ||
      normalizeString(product.productCode).includes(normalizeString(searchTerm)) ||
      (product.description && normalizeString(product.description).includes(normalizeString(searchTerm)));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <h2>Kategori Ürünleri Yükleniyor...</h2>
      </div>
    );
  }

  return (
    <div className="category-page-container" style={{ padding: '2rem 0' }}>
      {/* Category Banner Card */}
      <div className={`promo-card ${theme.bgClass}`} style={{ marginBottom: '2rem', minHeight: '200px', cursor: 'default' }}>
        <div className="promo-info">
          <Link to="/" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', color: 'inherit', borderColor: 'inherit' }}>
            ← Ana Sayfaya Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2', margin: '0 0 10px 0' }}>
            {theme.title}
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>
            {theme.subtitle}
          </p>
        </div>
        <div className="promo-img" style={{ maxHeight: '180px' }}>
          <img src={theme.image} alt={theme.title} style={{ objectFit: 'contain' }} />
        </div>
      </div>

      {/* Filter and Search controls */}
      <div id="catalog-section" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0' }}>
            Ürünler ({categoryProducts.length} adet)
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end', maxWidth: '400px' }}>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Bu kategoride ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 16px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="btn btn-outline btn-sm"
              style={{ padding: '8px 12px' }}
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)', background: '#ffffff' }}>
          <p>{error}</p>
        </div>
      )}

      {/* Product List */}
      {!error && categoryProducts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#ffffff' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📦</span>
          <p>Bu kategoride uygun ürün bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid-catalog">
          {categoryProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
