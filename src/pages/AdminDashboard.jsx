import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { globalCache } from '../utils/cache';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [fetchingDetailsId, setFetchingDetailsId] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [category, setCategory] = useState('Oyuncak');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [inStock, setInStock] = useState(true);
  const [description, setDescription] = useState('');

  const { showToast } = useContext(CartContext);

  const [activeSection, setActiveSection] = useState('products');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showToast('Sipariş geçmişi yüklenirken hata oluştu', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteOrder = (orderId) => {
    setConfirmModal({
      show: true,
      title: 'Siparişi Sil',
      message: 'Bu siparişi silmek istediğinize emin misiniz?',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/orders/${orderId}`);
          globalCache.orders = null;
          showToast('Sipariş başarıyla silindi', 'success');
          fetchOrders();
        } catch (err) {
          console.error('Error deleting order:', err);
          showToast('Sipariş silinirken hata oluştu', 'error');
        }
      }
    });
  };

  useEffect(() => {
    if (activeSection === 'orders') {
      fetchOrders();
    }
  }, [activeSection]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Ürün listesi yüklenirken hata oluştu', 'error');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const compressImage = (base64Str, maxWidth = 450, maxHeight = 450) => {
    return new Promise((resolve) => {
      if (!base64Str || !base64Str.startsWith('data:')) {
        resolve(base64Str);
        return;
      }
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.60));
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Görsel boyutu 10MB\'dan küçük olmalıdır', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result);
        setImage(compressed);
      };
      reader.onerror = () => {
        showToast('Görsel okunurken bir hata oluştu', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalFilesChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        showToast(`"${file.name}" boyutu 10MB'dan küçük olmalıdır`, 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result);
        setAdditionalImages(prev => [...prev, compressed]);
      };
      reader.onerror = () => {
        showToast('Görsel okunurken bir hata oluştu', 'error');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrlInput = async (url) => {
    if (url && url.trim()) {
      let finalUrl = url.trim();
      if (finalUrl.startsWith('data:image/')) {
        finalUrl = await compressImage(finalUrl);
      }
      setAdditionalImages(prev => [...prev, finalUrl]);
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleEdit = async (product) => {
    try {
      setFetchingDetailsId(product._id);
      const res = await axios.get(`/api/products/${product._id}`);
      const fullProduct = res.data;

      setEditingProduct(fullProduct);
      setName(fullProduct.name);
      setImage(fullProduct.image);
      
      if (fullProduct.image && fullProduct.image.startsWith('data:')) {
        setUploadMode('file');
      } else {
        setUploadMode('url');
      }
      
      const allImages = fullProduct.images || [];
      const mainImg = fullProduct.image;
      const extraImgs = allImages.filter(img => img !== mainImg);
      setAdditionalImages(extraImgs);
      
      setCategory(fullProduct.category);
      setWholesalePrice(fullProduct.wholesalePrice);
      setInStock(fullProduct.stock > 0);
      setDescription(fullProduct.description || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error fetching product details for editing:', err);
      showToast('Ürün detayları yüklenirken hata oluştu', 'error');
    } finally {
      setFetchingDetailsId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    clearForm();
  };

  const clearForm = () => {
    setName('');
    setImage('');
    setAdditionalImages([]);
    setUploadMode('file');
    setCategory('Oyuncak');
    setWholesalePrice('');
    setInStock(true);
    setDescription('');
    
    const fileInput = document.getElementById('productImageFileInput');
    if (fileInput) {
      fileInput.value = '';
    }
    const extraFileInput = document.getElementById('productExtraImagesFileInput');
    if (extraFileInput) {
      extraFileInput.value = '';
    }
  };

  const handleDelete = (productId, productName) => {
    setConfirmModal({
      show: true,
      title: 'Ürünü Sil',
      message: `"${productName}" isimli ürünü silmek istediğinize emin misiniz?`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/products/${productId}`);
          globalCache.products = null;
          showToast('Ürün başarıyla silindi', 'success');
          fetchProducts();
          if (editingProduct?._id === productId) {
            handleCancelEdit();
          }
        } catch (err) {
          console.error('Error deleting product:', err);
          showToast('Ürün silinirken bir hata oluştu', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !image || !category || wholesalePrice === '') {
      showToast('Lütfen gerekli tüm alanları doldurun', 'error');
      return;
    }

    const finalMainImage = image.startsWith('data:image/') ? await compressImage(image) : image;

    const finalAdditionalImages = await Promise.all(
      additionalImages.map(async (img) => {
        if (img && img.startsWith('data:image/')) {
          return await compressImage(img);
        }
        return img;
      })
    );

    const productData = {
      name,
      image: finalMainImage,
      images: [finalMainImage, ...finalAdditionalImages].filter(Boolean),
      category,
      wholesalePrice: parseFloat(wholesalePrice),
      stock: inStock ? 99999 : 0,
      description,
    };

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData);
        globalCache.products = null;
        showToast('Ürün başarıyla güncellendi', 'success');
        setEditingProduct(null);
      } else {
        await axios.post('/api/products', productData);
        globalCache.products = null;
        showToast('Yeni ürün başarıyla eklendi', 'success');
      }
      clearForm();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      showToast(err.response?.data?.message || 'Ürün kaydedilirken bir hata oluştu', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <h2>Yönetim Paneli Yükleniyor...</h2>
      </div>
    );
  }

  const uniqueUsers = [];
  const seen = new Set();
  orders.forEach(order => {
    if (order.user && !seen.has(order.user._id)) {
      seen.add(order.user._id);
      uniqueUsers.push(order.user);
    }
  });

  const filteredOrders = selectedUserId 
    ? orders.filter(o => o.user?._id === selectedUserId)
    : orders;

  return (
    <>
      <div>
      <h2 className="admin-title">Toptan Sipariş ve Stok Yönetimi (Admin)</h2>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveSection('products')}
          className={`btn ${activeSection === 'products' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 20px', borderRadius: '4px 4px 0 0', borderBottom: 'none', height: 'auto' }}
        >
          📦 Stok & Ürün Yönetimi
        </button>
        <button
          onClick={() => setActiveSection('orders')}
          className={`btn ${activeSection === 'orders' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 20px', borderRadius: '4px 4px 0 0', borderBottom: 'none', height: 'auto' }}
        >
          📋 Sipariş Geçmişi ({orders.length})
        </button>
      </div>

      {activeSection === 'products' ? (
        <div className="admin-grid">
          {/* Product Add/Edit Form */}
          <div className="admin-form-panel glass-panel">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Ürün Adı *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Uzaktan Kumandalı Araba"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span>Görsel Ekle *</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => { setUploadMode('file'); setImage(''); }}
                      className={`btn ${uploadMode === 'file' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', height: 'auto' }}
                    >
                      💻 Bilgisayardan Yükle
                    </button>
                    <button
                      type="button"
                      onClick={() => { setUploadMode('url'); setImage(''); }}
                      className={`btn ${uploadMode === 'url' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', height: 'auto' }}
                    >
                      🌐 URL Gir
                    </button>
                  </div>
                </label>

                {uploadMode === 'file' ? (
                  <input
                    type="file"
                    id="productImageFileInput"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!editingProduct || !image}
                    style={{ padding: '8px 12px' }}
                  />
                ) : (
                  <input
                    type="url"
                    className="form-control"
                    value={image && image.startsWith('data:') ? '' : image}
                    onChange={async (e) => {
                      const val = e.target.value;
                      if (val.startsWith('data:image/')) {
                        const compressed = await compressImage(val);
                        setImage(compressed);
                      } else {
                        setImage(val);
                      }
                    }}
                    placeholder="Örn: https://resim.url/araba.jpg"
                    required
                  />
                )}

                {/* Image Preview Box */}
                {image && (
                  <div style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={image}
                      alt="Önizleme"
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>Görsel Önizleme</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {uploadMode === 'file' ? 'Bilgisayardan yüklendi (Base64)' : 'İnternet bağlantılı URL'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                    >
                      Kaldır
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Images Section */}
              <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ek Görseller (İsteğe Bağlı)</span>
                  <input
                    type="file"
                    id="productExtraImagesFileInput"
                    multiple
                    accept="image/*"
                    onChange={handleAdditionalFilesChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('productExtraImagesFileInput').click()}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', height: 'auto' }}
                  >
                    📸 Dosya Seç
                  </button>
                </label>
                
                {/* Additional Images URL Paste Row */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="url"
                    id="additionalImageUrlInput"
                    className="form-control"
                    placeholder="Ek görsel URL'si yapıştırın"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrlInput(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('additionalImageUrlInput');
                      handleAddImageUrlInput(input.value);
                      input.value = '';
                    }}
                    className="btn btn-outline"
                    style={{ height: 'auto', padding: '0 12px' }}
                  >
                    Ekle
                  </button>
                </div>

                {/* Additional Images Preview Grid */}
                {additionalImages.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', 
                    gap: '8px', 
                    marginTop: '12px',
                    background: '#f8fafc',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {additionalImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '70px', height: '70px' }}>
                        <img 
                          src={img} 
                          alt={`Ek görsel ${idx + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Oyuncak">Oyuncak</option>
                    <option value="Hediyelik">Hediyelik</option>
                    <option value="Kırtasiye">Kırtasiye</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Toptan Fiyat (₺) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Stok Durumu *</label>
                <select
                  className="form-control"
                  value={inStock ? 'true' : 'false'}
                  onChange={(e) => setInStock(e.target.value === 'true')}
                  required
                >
                  <option value="true">Stokta Var</option>
                  <option value="false">Stokta Yok</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ürün Açıklaması</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kutu içeriği, ebatlar vb. detaylar..."
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  {editingProduct ? 'Güncelle' : 'Ekle'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={handleCancelEdit} className="btn btn-outline">
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products List Table */}
          <div className="admin-list-panel glass-panel">
            <h3 style={{ marginBottom: '1.5rem' }}>Ürün Envanteri ({products.length} Ürün)</h3>
            
            {products.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                Sistemde kayıtlı ürün bulunmamaktadır.
              </p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Görsel</th>
                      <th>Ürün Adı</th>
                      <th>Kategori</th>
                      <th>Fiyat</th>
                      <th>Stok Durumu</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-table-thumb"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1537884944318-390069bb8665?auto=format&fit=crop&q=80&w=150';
                            }}
                          />
                        </td>
                        <td style={{ fontWeight: '600' }}>{product.name}</td>
                        <td>{product.category}</td>
                        <td>₺{product.wholesalePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                        <td>
                          {product.stock <= 0 ? (
                            <span className="badge badge-danger">Stokta Yok</span>
                          ) : (
                            <span className="badge badge-success">Stokta Var</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(product)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              disabled={fetchingDetailsId !== null}
                            >
                              {fetchingDetailsId === product._id ? 'Yükleniyor...' : 'Düzenle'}
                            </button>
                            <button
                              onClick={() => handleDelete(product._id, product.name)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Orders Dashboard */
        <div className="admin-orders-grid">
          {/* Left Sidebar: Customers List */}
          <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--text-primary)' }}>
              👤 Müşteriler
            </h4>
            {loadingOrders ? (
              <p style={{ color: 'var(--text-secondary)' }}>Yükleniyor...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setSelectedUserId('')}
                  className={`btn ${selectedUserId === '' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', textAlign: 'left', display: 'block', height: 'auto', padding: '10px 15px' }}
                >
                  📋 Tüm Siparişler ({orders.length})
                </button>
                {uniqueUsers.map(customer => {
                  const customerOrders = orders.filter(o => o.user?._id === customer._id);
                  return (
                    <button
                      key={customer._id}
                      onClick={() => setSelectedUserId(customer._id)}
                      className={`btn ${selectedUserId === customer._id ? 'btn-primary' : 'btn-outline'}`}
                      style={{ width: '100%', textAlign: 'left', display: 'block', height: 'auto', padding: '10px 15px' }}
                    >
                      <strong>{customer.name}</strong>
                      <span style={{ fontSize: '0.75rem', display: 'block', opacity: 0.85, marginTop: '2px' }}>
                        {customer.email} • {customerOrders.length} Sipariş
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Main Area: Orders List */}
          <div>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              {selectedUserId 
                ? `${orders.find(o => o.user?._id === selectedUserId)?.user?.name || 'Müşteri'} Sipariş Geçmişi`
                : 'Tüm Sipariş Geçmişi'}
            </h3>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>Siparişler Yükleniyor...</h3>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                📭 Seçilen kriterde sipariş bulunmamaktadır.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredOrders.map(order => (
                  <div key={order._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Sipariş Tarihi</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{new Date(order.createdAt).toLocaleString('tr-TR')}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'right' }}>Müşteri</span>
                        <span style={{ color: 'var(--text-primary)' }}>{order.user?.name} ({order.user?.email})</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'right' }}>Toplam Tutar</span>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                          ₺{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>

                    {/* Shipping info */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>📍 Teslimat Adresi:</strong> {order.shippingAddress?.fullName} | {order.shippingAddress?.phone} | {order.shippingAddress?.city}, {order.shippingAddress?.district} | {order.shippingAddress?.address}
                    </div>

                    {/* Products table */}
                    <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', background: '#f1f5f9' }}>
                            <th style={{ padding: '6px 12px', color: 'var(--text-primary)', width: '60px' }}>Görsel</th>
                            <th style={{ padding: '6px 12px', color: 'var(--text-primary)' }}>Ürün Adı</th>
                            <th style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--text-primary)' }}>Birim Fiyat</th>
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

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <a
                        href={`https://wa.me/${order.shippingAddress?.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px', textDecoration: 'none', padding: '0 16px', color: '#ffffff', fontWeight: '600' }}
                      >
                        💬 WhatsApp'tan Yaz
                      </a>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="btn btn-danger btn-sm"
                        style={{ height: '36px', padding: '0 16px' }}
                      >
                        Siparişi Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {confirmModal.show && (
      <div className="custom-modal-overlay">
        <div className="custom-modal-card">
          <div className="custom-modal-title">
            <span>⚠️</span> {confirmModal.title}
          </div>
          <p className="custom-modal-text">{confirmModal.message}</p>
          <div className="custom-modal-actions">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={() => setConfirmModal({ ...confirmModal, show: false })}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className="modal-btn-confirm"
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal({ ...confirmModal, show: false });
              }}
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

export default AdminDashboard;
