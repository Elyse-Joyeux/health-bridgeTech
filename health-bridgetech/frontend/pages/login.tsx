import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './auth-modern.module.css';
import { useAuth } from '../api/auth-context.js';
import { ArrowRightIcon } from '../components/icons.js';
import { GoogleIcon } from '../components/google-icon.js';

/** Login page */
export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.decorPlant} />
      <div className={styles.card}>
        <div className={styles.brandHead}>
          <div className={styles.brandName}>Health BridgeTech</div>
          <div className={styles.brandTag}>Welcome back to your calm space.</div>
        </div>

        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Continue your journey toward inner balance.</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <button
          type="button"
          className={styles.googleBtn}
          onClick={onGoogle}
          disabled={googleLoading}
        >
          <GoogleIcon size={18} />
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className={styles.divider}>or sign in with email</div>

        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <input
                className={styles.input}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
              </span>
              <input
                className={styles.input}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
          </div>

          <div className={styles.forgotLink}>
            <span>Forgot password?</span>
          </div>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'} <ArrowRightIcon size={14} />
          </button>
        </form>

        <div className={styles.alt}>
          New here?
          <Link to="/signup" className={styles.altLink}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
