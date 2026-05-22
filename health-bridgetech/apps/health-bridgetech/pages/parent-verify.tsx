import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './auth-modern.module.css';
import { api } from '../api/client.js';
import { ArrowRightIcon, ShieldIcon, SparkleIcon } from '../components/icons.js';

type ConsentDetails = {
  childName: string;
  childDisplayName: string;
  childEmail: string;
  parentName?: string;
  parentEmail?: string;
  requestedAt?: string;
  verified: boolean;
};

type State = 'loading' | 'review' | 'submitting' | 'success' | 'already' | 'error';

/** Parent lands here after clicking the verification link in their email.
 *  They must explicitly review and accept the consent terms here before the
 *  account is activated — the child never sees or checks this box.
 */
export function ParentVerifyPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [state, setState] = useState<State>('loading');
  const [details, setDetails] = useState<ConsentDetails | null>(null);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing verification token.');
      setState('error');
      return;
    }
    api<ConsentDetails>(`/api/auth/parent-consent/details?token=${encodeURIComponent(token)}`, {
      auth: false,
    })
      .then((d) => {
        setDetails(d);
        setState(d.verified ? 'already' : 'review');
      })
      .catch((err) => {
        setError(err.message || 'This link may have expired or already been used.');
        setState('error');
      });
  }, [token]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError('Please check the box to confirm your consent.');
      return;
    }
    setState('submitting');
    try {
      await api('/api/auth/parent-consent/verify', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ token, agree: true }),
      });
      setState('success');
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
      setState('review');
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.decorPlant} />
      <div className={styles.card}>
        <div className={styles.brandHead}>
          <div className={styles.brandName}>Health BridgeTech</div>
          <div className={styles.brandTag}>Parental Consent Verification</div>
        </div>

        <ConsentBadge state={state} />

        {state === 'loading' && (
          <>
            <h1 className={styles.title}>Loading consent request...</h1>
            <p className={styles.subtitle}>Hang tight while we look up the details.</p>
          </>
        )}

        {state === 'review' && details && (
          <>
            <h1 className={styles.title}>Approve {details.childDisplayName}&rsquo;s account</h1>
            <p className={styles.subtitle}>
              Please review the request and confirm your consent so {details.childDisplayName} can
              start using Health BridgeTech.
            </p>

            <div
              style={{
                background: 'var(--hb-bg-soft)',
                borderRadius: 14,
                padding: 16,
                marginBottom: 18,
                fontSize: 13,
                color: 'var(--hb-text)',
                lineHeight: 1.6,
              }}
            >
              <Row label="Child" value={details.childName} />
              <Row label="Child email" value={details.childEmail} />
              <Row label="Requested by you" value={details.parentName || '\u2014'} />
              {details.requestedAt && (
                <Row
                  label="Requested on"
                  value={new Date(details.requestedAt).toLocaleString()}
                />
              )}
            </div>

            <div className={styles.minorBanner} style={{ alignItems: 'flex-start', marginBottom: 16 }}>
              <ShieldIcon size={18} />
              <div>
                <strong>What you&rsquo;re consenting to:</strong> {details.childDisplayName}
                &rsquo;s use of Health BridgeTech, including biometric monitoring from connected
                wearables, AI Companion conversations, care-team messaging, and community
                circles. All data is HIPAA-compliant and you can revoke consent at any time by
                replying to this email or contacting support.
              </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <form onSubmit={submit}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <div>
                  <strong>I confirm I&rsquo;m {details.childDisplayName}&rsquo;s parent or legal guardian</strong>
                  <span>
                    I consent to {details.childDisplayName}&rsquo;s use of Health BridgeTech as
                    described above, and I understand consent can be revoked at any time.
                  </span>
                </div>
              </label>

              <button type="submit" className={styles.submit}>
                Approve and activate <ArrowRightIcon size={14} />
              </button>
            </form>
          </>
        )}

        {state === 'submitting' && (
          <>
            <h1 className={styles.title}>Confirming...</h1>
            <p className={styles.subtitle}>Activating the account now.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <h1 className={styles.title}>Consent confirmed</h1>
            <p className={styles.subtitle}>
              Thank you. {details?.childDisplayName || 'Your child'}&rsquo;s account is now
              active. They can return to Health BridgeTech and continue setting up their sanctuary.
            </p>
            <Link to="/" className={styles.submit} style={{ textDecoration: 'none' }}>
              Go to Health BridgeTech
            </Link>
          </>
        )}

        {state === 'already' && (
          <>
            <h1 className={styles.title}>Already approved</h1>
            <p className={styles.subtitle}>
              This consent has already been confirmed. Nothing more to do here.
            </p>
            <Link to="/" className={styles.submit} style={{ textDecoration: 'none' }}>
              Go to Health BridgeTech
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <h1 className={styles.title}>Verification failed</h1>
            <p className={styles.subtitle}>
              {error || 'This link may have expired or already been used.'}
            </p>
            <Link to="/" className={styles.submit} style={{ textDecoration: 'none' }}>
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function ConsentBadge({ state }: { state: State }) {
  const isSuccess = state === 'success' || state === 'already';
  const isError = state === 'error';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '8px auto 18px',
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: isSuccess ? 'var(--hb-mint-pale)' : isError ? '#fde2e2' : 'var(--hb-bg-soft)',
        color: isSuccess ? 'var(--hb-primary)' : isError ? '#c14848' : 'var(--hb-text-muted)',
      }}
    >
      {isSuccess ? <SparkleIcon size={26} /> : <ShieldIcon size={28} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '6px 0',
        borderBottom: '1px solid var(--hb-border-soft)',
      }}
    >
      <span style={{ color: 'var(--hb-text-muted)', fontSize: 12.5 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
