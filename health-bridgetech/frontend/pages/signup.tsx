import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './auth-modern.module.css';
import { useAuth } from '../api/auth-context.js';
import { ArrowRightIcon, ShieldIcon } from '../components/icons.js';
import { GoogleIcon } from '../components/google-icon.js';

/** Compute age in years from a YYYY-MM-DD string */
function ageFrom(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

/** Modernized signup page with full name, confirm password, age check, and Google sign-up */
export function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [dob, setDob] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const age = useMemo(() => ageFrom(dob), [dob]);
  const isMinor = age !== null && age < 18 && age >= 0;
  const passwordMismatch = !!confirm && password !== confirm;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (passwordMismatch) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('Please accept the terms to continue.');
      return;
    }
    setLoading(true);
    try {
      const { needsParentConsent } = await signup({
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email,
        password,
        dateOfBirth: dob,
      });
      navigate(needsParentConsent ? '/parent-consent' : '/onboarding');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.decorPlant} />
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.brandHead}>
          <div className={styles.brandName}>Health BridgeTech</div>
          <div className={styles.brandTag}>Welcome to your calm space.</div>
        </div>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Please provide your details and verify your age to continue.
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <button
          type="button"
          className={styles.googleBtn}
          onClick={onGoogle}
          disabled={googleLoading}
        >
          <GoogleIcon size={18} />
          {googleLoading ? 'Connecting...' : 'Sign up with Google'}
        </button>

        <div className={styles.divider}>or with email</div>

        <form onSubmit={onSubmit}>
          <div className={styles.fieldGrid}>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.label}>First Name</label>
              <div className={styles.inputWrap}>
                <input
                  className={`${styles.input} ${styles.inputNoIcon}`}
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex"
                />
              </div>
            </div>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.label}>Last Name</label>
              <div className={styles.inputWrap}>
                <input
                  className={`${styles.input} ${styles.inputNoIcon}`}
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mercer"
                />
              </div>
            </div>
          </div>

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
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
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
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
              />
            </div>
            {passwordMismatch && <div className={styles.matchError}>Passwords don&rsquo;t match.</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Date of Birth</label>
            <div className={styles.inputWrap}>
              <input
                className={`${styles.input} ${styles.inputNoIcon}`}
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          {isMinor && (
            <div className={styles.minorBanner}>
              <ShieldIcon size={16} />
              <span>
                You&rsquo;re under 18 &mdash; we&rsquo;ll guide you through a brief parent consent
                step right after this.
              </span>
            </div>
          )}

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <div>
              <strong>I am 18 years or older</strong>
              <span>
                Our platform is designed for adults. If you are under 18, parental consent is
                mandatory for participation in guided sessions and community features.
              </span>
            </div>
          </label>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Creating account...' : 'Get Started'} <ArrowRightIcon size={14} />
          </button>
        </form>

        <div className={styles.alt}>
          Already have an account?
          <Link to="/login" className={styles.altLink}>
            Login here
          </Link>
        </div>

        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.dotActive}`} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    </div>
  );
}
