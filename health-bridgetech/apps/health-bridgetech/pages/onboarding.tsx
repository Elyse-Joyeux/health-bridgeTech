import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './auth-modern.module.css';
import { useAuth } from '../api/auth-context.js';
import { api } from '../api/client.js';
import type { User } from '../api/types.js';
import {
  ArrowRightIcon, HeartIcon, MoonIcon, CompanionIcon, WindIcon, CloudIcon, LeafIcon,
} from '../components/icons.js';

type Question = { id: string; prompt: string; options: string[] };

const AREA_META: Record<string, { name: string; desc: string; Icon: typeof HeartIcon }> = {
  anxiety: { name: 'Anxiety', desc: 'Calm spiraling thoughts', Icon: CloudIcon },
  sleep: { name: 'Sleep', desc: 'Reset your rhythm', Icon: MoonIcon },
  stress: { name: 'Stress', desc: 'Lower cortisol load', Icon: HeartIcon },
  focus: { name: 'Focus', desc: 'Hold attention longer', Icon: CompanionIcon },
  grief: { name: 'Grief', desc: 'Honor loss with care', Icon: LeafIcon },
  trauma: { name: 'Trauma', desc: 'Slow, somatic healing', Icon: WindIcon },
};

// Render all six immediately so the page is never blank.
const DEFAULT_AREAS = Object.keys(AREA_META);

/** Problem-area selection + tailored questions */
export function OnboardingPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [areas, setAreas] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ areas: string[]; questions: Record<string, Question[]> }>('/api/onboarding/assessment')
      .then((d) => setQuestions(d.questions))
      .catch(() => undefined);
  }, []);

  const toggleArea = (a: string) =>
    setAreas((arr) => (arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a]));

  const activeQuestions = areas.flatMap((a) => questions[a] || []);

  const submit = async () => {
    setLoading(true);
    try {
      const data = await api<{ user: User }>('/api/onboarding/assessment', {
        method: 'POST',
        body: JSON.stringify({ problemAreas: areas, answers }),
      });
      setUser(data.user);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.decorPlant} />
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.brandHead}>
          <BrandLogo />
          <div className={styles.brandName} style={{ marginTop: 8 }}>Health BridgeTech</div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 18, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--hb-text-muted)', fontWeight: 600,
        }}>
          <span>Step {step} of 2</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 28, height: 4, borderRadius: 2, background: 'var(--hb-primary)' }} />
            <span style={{ width: 28, height: 4, borderRadius: 2, background: step === 2 ? 'var(--hb-primary)' : 'var(--hb-border)' }} />
          </div>
        </div>

        {step === 1 && (
          <>
            <h1 className={styles.title}>What would you like to work on?</h1>
            <p className={styles.subtitle}>
              Pick one or more focus areas. Your Companion, content, and metrics will adapt.
            </p>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22,
            }}>
              {DEFAULT_AREAS.map((a) => {
                const meta = AREA_META[a];
                const active = areas.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleArea(a)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 8, padding: '18px 12px',
                      borderRadius: 16,
                      border: active ? '1.5px solid var(--hb-primary)' : '1.5px solid var(--hb-border)',
                      background: active ? 'var(--hb-mint-pale)' : 'var(--hb-surface)',
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 160ms ease',
                    }}
                  >
                    <span style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: active ? 'var(--hb-primary)' : 'var(--hb-mint-pale)',
                      color: active ? '#fff' : 'var(--hb-primary)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <meta.Icon size={18} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--hb-text)' }}>
                      {meta.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--hb-text-muted)', lineHeight: 1.4 }}>
                      {meta.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.submit}
              disabled={!areas.length}
              onClick={() => setStep(2)}
            >
              Continue <ArrowRightIcon size={14} />
            </button>
            {!areas.length && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--hb-text-muted)', textAlign: 'center' }}>
                Pick at least one area to continue.
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={styles.title}>Tell us a bit more</h1>
            <p className={styles.subtitle}>
              A few quick questions help your clinician understand the shape of what you&rsquo;re
              navigating.
            </p>

            {activeQuestions.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--hb-text-muted)', textAlign: 'center', padding: 20 }}>
                Loading questions...
              </div>
            )}

            {activeQuestions.map((q) => (
              <div key={q.id} style={{
                background: 'var(--hb-bg-soft)', borderRadius: 14,
                padding: 18, marginBottom: 14,
              }}>
                <div style={{ fontFamily: 'var(--hb-font-serif)', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                  {q.prompt}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {q.options.map((o) => {
                    const active = answers[q.id] === o;
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id]: o })}
                        style={{
                          padding: '8px 14px', borderRadius: 999,
                          border: active ? '1px solid var(--hb-primary)' : '1px solid var(--hb-border)',
                          background: active ? 'var(--hb-primary)' : 'var(--hb-surface)',
                          color: active ? '#fff' : 'var(--hb-text)',
                          fontSize: 12.5, cursor: 'pointer',
                        }}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '15px 24px', borderRadius: 999,
                  background: 'transparent', border: '1.5px solid var(--hb-border)',
                  color: 'var(--hb-text)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.submit}
                style={{ marginTop: 0, flex: 1 }}
                disabled={loading || activeQuestions.length === 0 || activeQuestions.some((q) => !answers[q.id])}
                onClick={submit}
              >
                {loading ? 'Saving...' : 'Enter your sanctuary'} <ArrowRightIcon size={14} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BrandLogo() {
  return (
    <span style={{
      width: 48, height: 48, borderRadius: 12,
      background: 'var(--hb-primary)', color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 16px rgba(13, 61, 58, 0.18)',
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4v16M18 4v16M6 12h12" />
      </svg>
    </span>
  );
}
