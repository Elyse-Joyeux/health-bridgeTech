import { useEffect, useState } from 'react';
import styles from './activity.module.css';
import { Topbar } from '../shell/topbar.js';
import { api, streamSSE } from '../api/client.js';
import type { Biometric, Device } from '../api/types.js';
import { WatchIcon, RefreshIcon, SparkleIcon, ChevronDownIcon } from '../components/icons.js';

const HRV_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEAT_COLORS = ['var(--hb-mint-pale)', 'var(--hb-mint)', 'var(--hb-accent)', '#c14848'];

/** Live metrics deep-dive page */
export function ActivityPage() {
  const [reading, setReading] = useState<Biometric | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    api<Device[]>('/api/devices').then(setDevices).catch(() => undefined);
  }, []);

  useEffect(() => streamSSE('/api/biometrics/stream', (p: Biometric) => {
    setReading(p);
    setHistory((h) => [...h.slice(-30), p.hrv]);
  }), []);

  const hrvSeries = history.length >= 7 ? history.slice(-7) : [60, 72, 55, 80, 68, 78, 65];
  const todayIdx = 3;
  const vitality = reading ? Math.min(100, Math.round(40 + reading.hrv / 2 + (100 - reading.stressLevel) / 5)) : 88;
  const heat = Array.from({ length: 24 }).map((_, i) => (i < 6 ? 0 : i === 12 || i === 13 ? 3 : i < 18 ? 2 : 1));

  return (
    <>
      <Topbar
        title="Metrics Deep Dive"
        tabs={[
          { label: 'Therapy', to: '/therapy' },
          { label: 'Metrics', to: '/activity', active: true },
          { label: 'Community', to: '/community' },
        ]}
      />

      <div className={styles.page}>
        <section className={styles.topRow}>
          <div className={styles.vitalityCard}>
            <div className={styles.vitalityHead}>
              <span className={styles.vitalityEyebrow}>GLOBAL VITALITY INDEX</span>
              <div className={styles.vitalityValue}>{vitality}/100</div>
            </div>
            <p style={{ marginTop: 10, fontSize: 13, color: 'var(--hb-text-muted)', lineHeight: 1.55, maxWidth: 420 }}>
              Your biometric markers indicate a {vitality > 80 ? 'peak' : 'recovering'} state. Streaming live from your wearables.
            </p>

            <div className={styles.spark}>
              <svg viewBox="0 0 600 90" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="vitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--hb-accent)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--hb-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const pts = history.length ? history : [70, 60, 75, 50, 85, 65, 90, 70, 50, 70, 60, 80];
                  const w = 600, h = 90;
                  const step = w / Math.max(1, pts.length - 1);
                  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - ((p - 40) / 60) * h}`).join(' ');
                  return (
                    <>
                      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#vitGrad)" />
                      <path d={path} fill="none" stroke="var(--hb-accent)" strokeWidth={2.5} />
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className={styles.statsRow}>
              <Stat label="HRV STATUS" value={`${reading?.hrv ?? 74} ms`} pct={Math.min(100, reading?.hrv ?? 74)} />
              <Stat label="HEART RATE" value={`${reading?.heartRate ?? 66} bpm`} pct={80} color="var(--hb-accent)" />
              <Stat label="STRESS" value={reading ? (reading.stressLevel < 35 ? 'Low' : reading.stressLevel < 60 ? 'Moderate' : 'High') : 'Low'} pct={100 - (reading?.stressLevel ?? 30)} color="var(--hb-mint)" />
            </div>
          </div>

          <div className={styles.devicesCol}>
            {devices.slice(0, 2).map((d) => (
              <div key={d._id} className={styles.deviceCard}>
                <div className={styles.deviceHead}>
                  <span className={styles.deviceIcon}>
                    {d.type === 'apple-watch' ? <WatchIcon size={18} /> : <RefreshIcon size={18} />}
                  </span>
                  <div>
                    <div className={styles.deviceName}>{d.name}</div>
                    <div className={styles.deviceMeta}>
                      Synced: {d.lastSync ? new Date(d.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'never'}
                    </div>
                  </div>
                  <span className={styles.deviceStatus} />
                </div>
                <div className={styles.deviceRow}>
                  <div className={styles.deviceMetric}>
                    <span className={styles.deviceMetricLabel}>BATTERY</span>
                    <span className={styles.deviceMetricVal}>{d.battery ?? '\u2014'}%</span>
                  </div>
                  <RefreshIcon size={16} />
                </div>
              </div>
            ))}
            {devices.length === 0 && (
              <div className={styles.deviceCard} style={{ fontSize: 12.5, color: 'var(--hb-text-muted)' }}>
                Pair a wearable from Settings to start streaming.
              </div>
            )}
          </div>
        </section>

        <section className={styles.insightCard}>
          <span className={styles.insightLeft}><SparkleIcon size={20} /></span>
          <div className={styles.insightBody}>
            <div className={styles.insightTitle}>AI Health Insight</div>
            <div className={styles.insightCopy}>
              {reading && reading.hrv > 70
                ? <>Your HRV is <strong>{reading.hrv} ms</strong> &mdash; above your typical baseline. Recovery is on track.</>
                : <>Your stress reading is <strong>{reading?.stressLevel ?? 30}%</strong>. A 5-minute breathing reset would help.</>}
            </div>
          </div>
          <a href="/meditation" className={styles.insightBtn} style={{ textDecoration: 'none' }}>Start a session</a>
        </section>

        <section className={styles.midRow}>
          <div className={styles.metricCard}>
            <div className={styles.metricHead}>
              <div>
                <div className={styles.metricTitle}>Heart Rate Variability</div>
                <div className={styles.metricSub}>LIVE STREAM (MS)</div>
              </div>
              <div className={styles.pageDots}>
                <span className={`${styles.pageDot} ${styles.pageDotOn}`} />
                <span className={styles.pageDot} />
              </div>
            </div>

            <div className={styles.hrvChart}>
              <svg viewBox="0 0 600 180" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="hrvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--hb-primary)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--hb-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const w = 600, h = 160;
                  const step = w / (hrvSeries.length - 1);
                  const path = hrvSeries.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - ((p - 40) / 60) * h + 10}`).join(' ');
                  return (
                    <>
                      <path d={`${path} L ${w} ${h + 10} L 0 ${h + 10} Z`} fill="url(#hrvGrad)" />
                      <path d={path} fill="none" stroke="var(--hb-primary)" strokeWidth={2.5} />
                      {hrvSeries.map((p, i) => (
                        <circle key={i} cx={i * step} cy={h - ((p - 40) / 60) * h + 10}
                          r={i === todayIdx ? 5 : 3} fill={i === todayIdx ? 'var(--hb-primary)' : 'var(--hb-accent)'} />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className={styles.hrvDays}>
              {HRV_DAYS.map((d, i) => (
                <span key={d} className={`${styles.hrvDay} ${i === todayIdx ? styles.hrvDayActive : ''}`}>{d}</span>
              ))}
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHead}>
              <div>
                <div className={styles.metricTitle}>Sleep Architecture</div>
                <div className={styles.metricSub}>CURRENT CYCLE BREAKOUT</div>
              </div>
              <span className={styles.lastNight}>Last Night <ChevronDownIcon size={14} /></span>
            </div>

            <div className={styles.sleepRow}>
              {[
                { label: 'Deep Sleep', value: '1h 42m (22%)', pct: 22, color: 'var(--hb-primary)' },
                { label: 'REM Sleep', value: '2h 15m (28%)', pct: 28, color: 'var(--hb-accent)' },
                { label: 'Light Sleep', value: '4h 05m (50%)', pct: 50, color: 'var(--hb-mint)' },
              ].map((s) => (
                <div key={s.label} className={styles.sleepItem}>
                  <div className={styles.sleepHead}>
                    <span className={styles.sleepName}>{s.label}</span>
                    <span className={styles.sleepVal}>{s.value}</span>
                  </div>
                  <div className={styles.sleepBar}>
                    <div className={styles.sleepFill} style={{ width: `${s.pct * 2}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.sleepTip}>
              Tip: Your deep sleep was optimal. Maintain a 68&deg;F room temperature for consistency.
            </div>
          </div>
        </section>

        <section className={styles.stressCard}>
          <div className={styles.metricHead}>
            <div>
              <div className={styles.metricTitle}>Stress Resilience Heatmap</div>
              <div className={styles.metricSub}>24-HOUR CORTISOL PROXY DATA</div>
            </div>
          </div>
          <div className={styles.heatmap}>
            {heat.map((v, i) => (
              <span key={i} className={styles.heatCell} style={{ background: HEAT_COLORS[v] }} />
            ))}
          </div>
          <div className={styles.heatRow}>
            <span>12 AM</span>
            <span>6 AM</span>
            <span className={styles.heatPeak}>LUNCH STRESS PEAK</span>
            <span>6 PM</span>
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({ label, value, pct, color = 'var(--hb-primary)' }: { label: string; value: string; pct: number; color?: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      <div className={styles.statBar}>
        <div className={styles.statFill} style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
    </div>
  );
}
