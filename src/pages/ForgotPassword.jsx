import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Logo from '../components/Logo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { forgotPassword } = useContext(AuthContext);
  const { showToast } = useContext(CartContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      showToast('Şifre sıfırlama bağlantısı gönderildi.', 'success');
    } else {
      setError(res.message);
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Logo variant="full" width="130px" height="130px" />
          </div>
          <h2>Şifremi Unuttum</h2>
          <p>Kayıtlı e-posta adresinizi girdiğinizde, şifre sıfırlama bağlantısı gönderilecektir.</p>
        </div>

        {successMessage ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h3 style={{ color: '#10b981', marginBottom: '0.75rem' }}>E-posta Gönderildi!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
              {successMessage}
            </p>
            <blockquote style={{ background: '#f1f5f9', borderLeft: '4px solid #6d28d9', padding: '10px 15px', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'left', margin: '0 0 2rem 0', color: '#475569' }}>
              <strong>Not (Geliştirme Modu):</strong> Eğer yerel SMTP bilgileri ayarlanmamışsa sıfırlama bağlantısı <strong>backend terminal konsoluna</strong> yazdırılmıştır. Bağlantıyı konsoldan kopyalayıp tarayıcınıza yapıştırabilirsiniz.
            </blockquote>
            <Link to="/login" className="btn btn-primary full-width" style={{ textDecoration: 'none', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Giriş Sayfasına Dön
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">E-posta Adresi</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary full-width"
                style={{ marginTop: '1rem', height: '48px' }}
                disabled={loading}
              >
                {loading ? 'İstek Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
              Giriş yapmak ister misiniz? <Link to="/login">Giriş Yap</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
