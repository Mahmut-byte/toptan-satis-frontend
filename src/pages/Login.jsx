import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resend verification email states
  const [isNotVerified, setIsNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  
  const { login, resendVerificationEmail } = useContext(AuthContext);
  const { showToast } = useContext(CartContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    setError('');
    setIsNotVerified(false);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast('Başarıyla giriş yaptınız', 'success');
      navigate('/');
    } else {
      if (res.isNotVerified) {
        setIsNotVerified(true);
        setUnverifiedEmail(res.email || email);
      }
      setError(res.message);
      showToast(res.message, 'error');
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    const res = await resendVerificationEmail(unverifiedEmail);
    setResending(false);
    if (res.success) {
      showToast(res.message || 'Doğrulama e-postası başarıyla gönderildi.', 'success');
      setIsNotVerified(false);
    } else {
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
          <h2>Üye Girişi</h2>
          <p>Toptan fiyatları görmek ve sipariş oluşturmak için giriş yapın</p>
        </div>

        {error && !isNotVerified && (
          <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {isNotVerified && (
          <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#b45309', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Hesabınız henüz doğrulanmamış. Lütfen e-postanızı onaylayın.
            </p>
            <button
              onClick={handleResendVerification}
              className="btn btn-outline btn-sm"
              disabled={resending}
              style={{ fontSize: '0.8rem', padding: '6px 12px', height: 'auto', display: 'inline-flex' }}
            >
              {resending ? 'Gönderiliyor...' : 'Doğrulama E-postasını Tekrar Gönder'}
            </button>
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

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Şifre</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
                Şifremi Unuttum
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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

          <button
            type="submit"
            className="btn btn-primary full-width"
            style={{ marginTop: '1rem', height: '48px' }}
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-footer">
          Henüz üye hesabınız yok mu? <Link to="/register">Kayıt Olun</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
