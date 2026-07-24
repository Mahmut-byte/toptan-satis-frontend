import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import Logo from '../components/Logo';

const VerifyEmail = () => {
  const { token } = useParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { showToast } = useContext(CartContext);

  useEffect(() => {
    const performVerification = async () => {
      try {
        const res = await axios.get(`/api/auth/verify-email/${token}`);
        setSuccess(true);
        setVerifying(false);
        showToast(res.data.message || 'E-posta doğrulama başarılı!', 'success');
      } catch (err) {
        setError(err.response?.data?.message || 'Hesap doğrulama işlemi başarısız oldu. Bağlantı geçersiz veya süresi dolmuş olabilir.');
        setVerifying(false);
        showToast(err.response?.data?.message || 'Doğrulama başarısız.', 'error');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Logo variant="full" width="130px" height="130px" />
        </div>

        {verifying ? (
          <div>
            <div style={{ fontSize: '3rem', animation: 'spin 2s linear infinite', display: 'inline-block', marginBottom: '1rem' }}>🔄</div>
            <h2>Hesabınız Doğrulanıyor</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Lütfen bekleyin, aktivasyon işleminiz gerçekleştiriliyor...</p>
          </div>
        ) : success ? (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#10b981' }}>Doğrulama Başarılı!</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 2rem 0', lineHeight: '1.6' }}>
              E-posta adresiniz başarıyla onaylandı. Hesabınız aktifleştirilmiştir. Toptan fiyatlarla sipariş oluşturmak için giriş yapabilirsiniz.
            </p>
            <Link to="/login" className="btn btn-primary full-width" style={{ textDecoration: 'none', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Giriş Yap
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: 'var(--danger)' }}>Doğrulama Başarısız</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0 2rem 0', lineHeight: '1.6' }}>
              {error}
            </p>
            <Link to="/login" className="btn btn-primary full-width" style={{ textDecoration: 'none', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              Giriş Sayfasına Git
            </Link>
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
              Yeni Hesap Oluştur
            </Link>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default VerifyEmail;
