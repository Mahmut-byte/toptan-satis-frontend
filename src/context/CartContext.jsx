import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('wholesale_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart data', error);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('wholesale_cart', JSON.stringify(items));
  };

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product, quantity) => {
    const existingItem = cartItems.find((item) => item.product._id === product._id);
    const orderQty = parseInt(quantity);

    // Stock control
    if (product.stock === 0) {
      showToast('Bu ürün tükenmiştir', 'error');
      return;
    }

    if (existingItem) {
      const newQty = existingItem.quantity + orderQty;
      if (newQty > product.stock) {
        showToast(`Stok sınırına ulaşıldı! Maksimum stok: ${product.stock}`, 'error');
        return;
      }
      const updatedItems = cartItems.map((item) =>
        item.product._id === product._id ? { ...item, quantity: newQty } : item
      );
      saveCart(updatedItems);
      showToast(`${product.name} sepetinizde güncellendi. Yeni miktar: ${newQty} adet`, 'success');
    } else {
      if (orderQty > product.stock) {
        showToast(`Stok sınırına ulaşıldı! En fazla ${product.stock} adet ekleyebilirsiniz`, 'error');
        return;
      }
      const updatedItems = [...cartItems, { product, quantity: orderQty }];
      saveCart(updatedItems);
      showToast(`${orderQty} adet ${product.name} sepete eklendi`, 'success');
    }
  };

  const removeFromCart = (productId) => {
    const item = cartItems.find((i) => i.product._id === productId);
    const updatedItems = cartItems.filter((item) => item.product._id !== productId);
    saveCart(updatedItems);
    if (item) {
      showToast(`${item.product.name} sepetten çıkarıldı`, 'info');
    }
  };

  const updateQuantity = (productId, newQty, stockLimit) => {
    const qty = parseInt(newQty);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    if (qty > stockLimit) {
      showToast(`Stok sınırına ulaşıldı! Maksimum stok: ${stockLimit}`, 'error');
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.product._id === productId ? { ...item, quantity: qty } : item
    );
    saveCart(updatedItems);
  };

  const clearCart = () => {
    saveCart([]);
    showToast('Sepetiniz temizlendi', 'info');
  };

  // Compute total price
  const totalAmount = cartItems.reduce((acc, item) => {
    return acc + item.product.wholesalePrice * item.quantity;
  }, 0);

  // Generate WhatsApp Redirect Link
  const getWhatsappUrl = (checkoutDetails = {}) => {
    // Customization of target phone number. Default format is 905000000000.
    const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '905319742102';
    const number = rawNumber.replace(/\D/g, ''); // strip non-digits

    let message = '📋 *TOPTAN SİPARİŞ TALEBİ*\n\n';
    
    if (checkoutDetails.name) {
      message += `👤 *Müşteri:* ${checkoutDetails.name}\n`;
    }
    if (checkoutDetails.phone) {
      message += `📞 *Telefon:* ${checkoutDetails.phone}\n`;
    }
    if (checkoutDetails.address) {
      let fullAddress = checkoutDetails.address;
      if (checkoutDetails.district && checkoutDetails.city) {
        fullAddress += ` - ${checkoutDetails.district} / ${checkoutDetails.city}`;
      } else if (checkoutDetails.city) {
        fullAddress += ` / ${checkoutDetails.city}`;
      }
      message += `📍 *Teslimat Adresi:* ${fullAddress}\n`;
    }
    
    message += '\n📦 *SİPARİŞ EDİLEN ÜRÜNLER:*\n\n';
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. 🧸 ${item.product.name}\n`;
      message += `   Kategori: ${item.product.category}\n`;
      message += `   Adet: ${item.quantity} adet\n`;
      message += `   Toptan Fiyatı: ₺${item.product.wholesalePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n\n`;
    });

    message += 'Sipariş detaylarını onaylamak üzere geri dönüşünüzü bekliyorum. Teşekkürler.';

    const encodedText = encodeURIComponent(message);
    return `https://wa.me/${number}?text=${encodedText}`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        toasts,
        showToast,
        removeToast,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        getWhatsappUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
