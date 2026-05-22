import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './auth-modern.module.css';
import { useAuth } from '../api/auth-context.js';
import { api } from '../api/client.js';
import { ArrowRightIcon, ShieldIcon, SparkleIcon } from '../components/icons.js';

type ConsentStatus = {
  requested: boolean;
  verified: boolean;
  parentEmail?: string;
  parentName?: string;
  verifyUrl?: string;
};

/** Parent-consent flow:
 *  1) User submits parent name + email
 *  2) Backend stores a token and "sends" a verification email to the parent
 *  3) Parent clicks the link in their inbox → /parent-verify → status becomes verified
 *  4) This page polls status every 5s and unlocks the rest of the app on verify
 */
export function ParentConsentPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);

  // On mount, check whether a consent request is already pending.
  useEffect(() => {
    api<ConsentStatus>('/api/auth/parent-consent/status')
      .then((s) => {
        setStatus(s);
        if (s.verifyUrl) setVerifyUrl(s.verifyUrl);
      })
      .catch(() => undefined);
  }, []);

  // Poll every 5s for verification; redirect once granted.
  useEffect(() => {
    if (!status?.requested) return;
    if (status.verified) {
      refresh().then(() => navigate('/onboarding'));
      return;
    }
    const t = setInterval(async () => {
      try {
        const s = await api<ConsentStatus>('/api/auth/parent-consent/status');
        setStatus(s);
        if (s.verifyUrl) setVerifyUrl(s.verifyUrl);
        if (s.verified) {
          clearInterval(t);
          await refresh();
          navigate('/onboarding');
        }
      } catch {/* ignore */}
    }, 5000);
    return () => clearInterval(t);
  }, [status?.requested, status?.verified, refresh, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const userEmail = (user?.email || '').toLowerCase();
    const parent = parentEmail.trim().toLowerCase();

    if (!agree) return setError('Please confirm parental consent.');
    if (!parent || !parentName.trim()) return setError('Please enter your guardian\u2019s name and email.');
    if (parent === userEmail) {
      return setError("Parent's email cannot be the same as your account email.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent)) {
      return setError('Please enter a valid parent email address.');
    }

    setLoading(true);
    try {
      const res = await api<{ ok: boolean; parentEmail: string; verifyUrl: string }>(
        '/api/auth/parent-consent/request',
        {
          method: 'POST',
          body: JSON.stringify({ parentName, parentEmail: parent, agree }),
        },
      );
      setVerifyUrl(res.verifyUrl);
      setStatus({ requested: true, verified: false, parentEmail: res.parentEmail, parentName });
    } catch (err: any) {
      setError(err.message || 'Could not send verification email');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const res = await api<{ verifyUrl: string }>('/api/auth/parent-consent/resend', {
        method: 'POST',
      });
      setVerifyUrl(res.verifyUrl);
    } finally {
      setResending(false);
    }
  };

  // Already requested — show waiting state with verify link visible for testing.
  if (status?.requested && !status.verified) {
    return (
      <div className={styles.shell}>
        <div className={styles.decorPlant} />
        <div className={styles.card}>
          <div className={styles.brandHead}>
            <div className={styles.brandName}>Health BridgeTech</div>
            <div className={styles.brandTag}>Waiting for guardian approval.</div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '8px auto 18px', width: 72, height: 72, borderRadius: '50%',
            background: 'var(--hb-mint-pale)', color: 'var(--hb-primary)',
          }}>
            <ShieldIcon size={28} />
          </div>

          <h1 className={styles.title}>Email sent</h1>
          <p className={styles.subtitle}>
            We sent a verification link to{' '}
            <strong style={{ color: 'var(--hb-primary)' }}>{status.parentEmail}</strong>. Once{' '}
            {status.parentName || 'your guardian'} clicks it, your sanctuary will unlock
            automatically.
          </p>

          <div style={{
            background: 'var(--hb-mint-pale)', border: '1px solid var(--hb-mint)',
            borderRadius: 14, padding: 16, marginBottom: 16,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <SparkleIcon size={18} />
            <div style={{ flex: 1, fontSize: 12.5, color: 'var(--hb-text)' }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>Demo / testing link:</strong>
              {verifyUrl ? (
                <>
                  <span style={{ wordBreak: 'break-all', color: 'var(--hb-text-muted)' }}>
                    {verifyUrl}
                  </span>
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-block', marginTop: 8, color: 'var(--hb-primary)', fontWeight: 600 }}
                  >
                    Open verification link &rarr;
                  </a>
                </>
              ) : (
                <span style={{ color: 'var(--hb-text-muted)' }}>
                  Sent earlier &mdash; check the parent&rsquo;s inbox.
                </span>
              )}
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
            fontSize: 12.5, color: 'var(--hb-text-muted)', marginBottom: 14,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--hb-accent)' }} />
            Polling for verification every 5 seconds&hellip;
          </div>

          <button
            type="button"
            className={styles.submit}
            onClick={resend}
            disabled={resending}
            style={{ background: 'transparent', color: 'var(--hb-primary)', border: '1.5px solid var(--hb-primary)' }}
          >
            {resending ? 'Resending...' : 'Resend verification email'}
          </button>

          <div className={styles.alt}>
            Wrong email?{' '}
            <button
              type="button"
              onClick={() => setStatus(null)}
              style={{ background: 'none', border: 'none', color: 'var(--hb-primary)', fontWeight: 600, cursor: 'pointer' }}
            >
              Change parent details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className={styles.shell}>
      <div className={styles.decorPlant} />
      <div className={styles.card}>
        <div className={styles.brandHead}>
          <div className={styles.brandName}>Health BridgeTech</div>
          <div className={styles.brandTag}>A guardian must consent first.</div>
        </div>

        <h1 className={styles.title}>Parental consent</h1>
        <p className={styles.subtitle}>
          Because {user?.displayName || 'you'} are under 18, we&rsquo;ll email your parent or
          guardian to confirm before unlocking biometric tracking and the AI Companion.
        </p>

        <div className={styles.minorBanner} style={{ alignItems: 'flex-start', marginBottom: 18 }}>
          <ShieldIcon size={18} />
          <div>
            <strong>How it works:</strong> we&rsquo;ll send a one-time verification link to the
            parent email below. Once they click it, your account is automatically activated. Use a
            real guardian inbox &mdash; not your own.
          </div>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Parent / Guardian Name</label>
            <div className={styles.inputWrap}>
              <input
                className={`${styles.input} ${styles.inputNoIcon}`}
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Jamie Mercer"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Parent / Guardian Email</label>
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
                required
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="guardian@example.com"
              />
            </div>
            {parentEmail && parentEmail.toLowerCase() === user?.email.toLowerCase() && (
              <div className={styles.matchError}>
                That&rsquo;s your own email. Please enter a guardian&rsquo;s address.
              </div>
            )}
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <div>
              <strong>I confirm this is my parent or legal guardian</strong>
              <span>
                I understand they will receive a verification email and must approve before my
                account is activated. The email address above belongs to a real adult guardian who
                can speak on my behalf.
              </span>
            </div>
          </label>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Sending email...' : 'Send verification email'} <ArrowRightIcon size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
