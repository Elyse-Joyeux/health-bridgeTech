import { useEffect, useState, type FormEvent } from 'react';
import styles from './settings.module.css';
import { Topbar } from '../shell/topbar.js';
import {
  ProfileIcon,
  BellIcon,
  ShieldIcon,
  WatchIcon,
  RefreshIcon,
  GlobeIcon,
  CompanionIcon,
} from '../components/icons.js';
import { api } from '../api/client.js';
import { useAuth } from '../api/auth-context.js';
import type { Device, User } from '../api/types.js';

type Section =
  | 'account'
  | 'notifications'
  | 'privacy'
  | 'devices'
  | 'companion'
  | 'language';

const NAV: { id: Section; label: string; Icon: typeof ProfileIcon }[] = [
  { id: 'account', label: 'Account', Icon: ProfileIcon },
  { id: 'notifications', label: 'Notifications', Icon: BellIcon },
  { id: 'privacy', label: 'Privacy & Security', Icon: ShieldIcon },
  { id: 'devices', label: 'Connected Devices', Icon: WatchIcon },
  { id: 'companion', label: 'AI Companion', Icon: CompanionIcon },
  { id: 'language', label: 'Language & Region', Icon: GlobeIcon },
];

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Espa\u00f1ol' },
  { code: 'fr', name: 'French', native: 'Fran\u00e7ais' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ja', name: 'Japanese', native: '\u65e5\u672c\u8a9e' },
  { code: 'pt', name: 'Portuguese', native: 'Portugu\u00eas' },
];

const COMPANION_STYLES = [
  {
    id: 'gentle',
    title: 'Gentle Guide',
    desc: 'Soft, patient prompts. Lots of space.',
  },
  {
    id: 'clinical',
    title: 'Clinical',
    desc: 'Evidence-led, structured frameworks.',
  },
  {
    id: 'coach',
    title: 'Coach',
    desc: 'Direct, motivating, momentum-oriented.',
  },
];

type ToggleRow = { id: string; title: string; desc: string; on: boolean };

const INITIAL_NOTIFS: ToggleRow[] = [
  {
    id: 't1',
    title: 'Morning check-in reminder',
    desc: 'A gentle nudge to log how you\u2019re feeling each morning.',
    on: true,
  },
  {
    id: 't2',
    title: 'Session start alerts',
    desc: 'Alert 10 minutes before a scheduled therapy session.',
    on: true,
  },
  {
    id: 't3',
    title: 'Community Circle digest',
    desc: 'Weekly summary of new posts in circles you\u2019ve joined.',
    on: false,
  },
  {
    id: 't4',
    title: 'AI Companion proactive tips',
    desc: 'Let your Companion reach out when biometrics suggest a reset.',
    on: true,
  },
];

const INITIAL_PRIVACY: ToggleRow[] = [
  {
    id: 'p1',
    title: 'Share biometrics with care team',
    desc: 'Your therapist can view HRV, sleep, and mood trends.',
    on: true,
  },
  {
    id: 'p2',
    title: 'Two-factor authentication',
    desc: 'Add an extra layer of security via authenticator app.',
    on: true,
  },
  {
    id: 'p3',
    title: 'Anonymous community pulse',
    desc: 'Show your XP on leaderboards without revealing identity.',
    on: false,
  },
];

/** Settings page with multiple sections, device detail, language picker, companion style */
export function SettingsPage() {
  const { user, setUser } = useAuth();
  const [section, setSection] = useState<Section>('account');
  const [notifs, setNotifs] = useState<ToggleRow[]>(INITIAL_NOTIFS);
  const [privacy, setPrivacy] = useState<ToggleRow[]>(INITIAL_PRIVACY);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [deviceHistory, setDeviceHistory] = useState<
    { at: string; hrv: number; hr: number }[]
  >([]);
  const [lang, setLang] = useState('en');
  const [companionStyle, setCompanionStyle] = useState('gentle');
  const [flash, setFlash] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    displayName: user?.displayName || '',
    timezone: user?.timezone || 'America/Los_Angeles',
    primaryGoal: user?.primaryGoal || 'focus',
  });

  useEffect(() => {
    api<Device[]>('/api/devices').then((d: Device[]) => {
      setDevices(d);
      if (d.length) setActiveDevice(d[0]);
    });
  }, []);

  useEffect(() => {
    if (!activeDevice) return;
    api<{ device: Device; history: { at: string; hrv: number; hr: number }[] }>(
      `/api/devices/${activeDevice._id}`
    )
      .then(
        (d: {
          device: Device;
          history: { at: string; hrv: number; hr: number }[];
        }) => setDeviceHistory(d.history)
      )
      .catch(() => undefined);
  }, [activeDevice?._id]);

  const flashOk = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 2200);
  };

  const toggle = (group: 'notifs' | 'privacy', id: string) => {
    const setter = group === 'notifs' ? setNotifs : setPrivacy;
    setter((rows) => rows.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
    flashOk('Preference saved');
  };

  const saveAccount = async (e: FormEvent) => {
    e.preventDefault();
    const data = await api<{ user: User }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(form),
    });
    setUser(data.user);
    flashOk('Account saved');
  };

  const syncDevice = async (d: Device) => {
    const updated = await api<Device>(`/api/devices/${d._id}/sync`, {
      method: 'POST',
    });
    setDevices((arr) => arr.map((x) => (x._id === updated._id ? updated : x)));
    setActiveDevice(updated);
    flashOk('Device synced');
  };

  return (
    <>
      <Topbar
        title="Settings"
        tabs={[
          { label: 'Therapy', to: '/therapy' },
          { label: 'Metrics', to: '/activity' },
          { label: 'Community', to: '/community' },
        ]}
      />

      <h1 className={styles.heading}>Settings</h1>
      <p className={styles.intro}>
        Tailor your sanctuary &mdash; manage your account, privacy, devices, and
        Companion.
      </p>

      <div className={styles.page}>
        <nav className={styles.sideNav}>
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`${styles.sideItem} ${section === n.id ? styles.sideItemActive : ''}`}
              onClick={() => setSection(n.id)}
            >
              <n.Icon size={16} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.main}>
          {section === 'account' && (
            <form onSubmit={saveAccount} className={styles.card}>
              <div className={styles.cardTitle}>Account</div>
              <div className={styles.cardSub}>
                Your basic identity and contact information.
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>FULL NAME</label>
                  <input
                    className={styles.input}
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>DISPLAY NAME</label>
                  <input
                    className={styles.input}
                    value={form.displayName}
                    onChange={(e) =>
                      setForm({ ...form, displayName: e.target.value })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>EMAIL</label>
                  <input
                    className={styles.input}
                    value={user?.email || ''}
                    readOnly
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>DATE OF BIRTH</label>
                  <input
                    className={styles.input}
                    value={user?.dateOfBirth || ''}
                    readOnly
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>TIMEZONE</label>
                  <select
                    className={styles.select}
                    value={form.timezone}
                    onChange={(e) =>
                      setForm({ ...form, timezone: e.target.value })
                    }
                  >
                    <option value="America/Los_Angeles">
                      Pacific Time (UTC-8)
                    </option>
                    <option value="America/Denver">
                      Mountain Time (UTC-7)
                    </option>
                    <option value="America/New_York">
                      Eastern Time (UTC-5)
                    </option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">London (UTC+0)</option>
                    <option value="Europe/Paris">Paris (UTC+1)</option>
                    <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>PRIMARY GOAL</label>
                  <select
                    className={styles.select}
                    value={form.primaryGoal}
                    onChange={(e) =>
                      setForm({ ...form, primaryGoal: e.target.value })
                    }
                  >
                    <option value="focus">Cognitive Focus</option>
                    <option value="sleep">Sleep Optimization</option>
                    <option value="stress">Stress Resilience</option>
                    <option value="recovery">Recovery</option>
                  </select>
                </div>
              </div>
              <div className={styles.actions}>
                {flash && <span className={styles.savedFlash}>{flash}</span>}
                <button type="submit" className={styles.btnPrimary}>
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {section === 'notifications' && (
            <section className={styles.card}>
              <div className={styles.cardTitle}>Notifications</div>
              <div className={styles.cardSub}>
                Choose how Health BridgeTech keeps you informed.
              </div>
              {notifs.map((t) => (
                <div key={t.id} className={styles.row}>
                  <div className={styles.rowInfo}>
                    <div className={styles.rowTitle}>{t.title}</div>
                    <div className={styles.rowDesc}>{t.desc}</div>
                  </div>
                  <button
                    type="button"
                    className={`${styles.toggle} ${t.on ? styles.toggleOn : ''}`}
                    onClick={() => toggle('notifs', t.id)}
                  >
                    <span className={styles.toggleKnob} />
                  </button>
                </div>
              ))}
              {flash && (
                <div className={styles.actions}>
                  <span className={styles.savedFlash}>{flash}</span>
                </div>
              )}
            </section>
          )}

          {section === 'privacy' && (
            <section className={styles.card}>
              <div className={styles.cardTitle}>Privacy &amp; Security</div>
              <div className={styles.cardSub}>
                HIPAA-compliant controls for your data.
              </div>
              {privacy.map((t) => (
                <div key={t.id} className={styles.row}>
                  <div className={styles.rowInfo}>
                    <div className={styles.rowTitle}>{t.title}</div>
                    <div className={styles.rowDesc}>{t.desc}</div>
                  </div>
                  <button
                    type="button"
                    className={`${styles.toggle} ${t.on ? styles.toggleOn : ''}`}
                    onClick={() => toggle('privacy', t.id)}
                  >
                    <span className={styles.toggleKnob} />
                  </button>
                </div>
              ))}
              {flash && (
                <div className={styles.actions}>
                  <span className={styles.savedFlash}>{flash}</span>
                </div>
              )}
            </section>
          )}

          {section === 'devices' && (
            <section className={styles.card}>
              <div className={styles.cardTitle}>Connected Devices</div>
              <div className={styles.cardSub}>
                Click a device to view live readings, last sync, and recent
                history.
              </div>
              <div className={styles.devicesList}>
                {devices.map((d) => (
                  <button
                    key={d._id}
                    type="button"
                    className={`${styles.deviceRow} ${activeDevice?._id === d._id ? styles.deviceRowActive : ''}`}
                    onClick={() => setActiveDevice(d)}
                  >
                    <span className={styles.deviceIcon}>
                      {d.type === 'apple-watch' ? (
                        <WatchIcon size={18} />
                      ) : (
                        <RefreshIcon size={18} />
                      )}
                    </span>
                    <div className={styles.deviceInfo}>
                      <div className={styles.deviceName}>{d.name}</div>
                      <div className={styles.deviceMeta}>
                        {d.paired ? 'Connected' : 'Available'} &middot; Last
                        sync{' '}
                        {d.lastSync
                          ? new Date(d.lastSync).toLocaleString()
                          : 'never'}
                      </div>
                    </div>
                    <span className={styles.deviceBadge}>
                      {d.paired ? 'ACTIVE' : 'PAIR'}
                    </span>
                  </button>
                ))}
                {devices.length === 0 && (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--hb-text-muted)',
                      padding: 12,
                    }}
                  >
                    No devices yet. Pair one to start streaming biometrics.
                  </div>
                )}
              </div>

              {activeDevice && (
                <div className={styles.deviceDetail}>
                  <div className={styles.detailHead}>
                    <div className={styles.detailTitle}>
                      {activeDevice.name}
                    </div>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={() => syncDevice(activeDevice)}
                    >
                      Sync Now
                    </button>
                  </div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailStat}>
                      <div className={styles.detailStatLabel}>BATTERY</div>
                      <div className={styles.detailStatVal}>
                        {activeDevice.battery ?? '\u2014'}%
                      </div>
                    </div>
                    <div className={styles.detailStat}>
                      <div className={styles.detailStatLabel}>LAST SYNC</div>
                      <div className={styles.detailStatVal}>
                        {activeDevice.lastSync
                          ? new Date(activeDevice.lastSync).toLocaleTimeString(
                              [],
                              { hour: '2-digit', minute: '2-digit' }
                            )
                          : '\u2014'}
                      </div>
                    </div>
                    <div className={styles.detailStat}>
                      <div className={styles.detailStatLabel}>STATUS</div>
                      <div className={styles.detailStatVal}>
                        {activeDevice.paired ? 'Live' : 'Idle'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--hb-text-muted)',
                      marginBottom: 8,
                      fontWeight: 600,
                    }}
                  >
                    RECENT READINGS
                  </div>
                  <div className={styles.historyTable}>
                    {deviceHistory.map((h, i) => (
                      <div key={i} className={styles.historyRow}>
                        <span>
                          {new Date(h.at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>HRV {h.hrv} ms</span>
                        <span>HR {h.hr} bpm</span>
                      </div>
                    ))}
                    {deviceHistory.length === 0 && (
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--hb-text-muted)',
                          padding: 6,
                        }}
                      >
                        No readings yet.
                      </div>
                    )}
                  </div>
                  {flash && (
                    <div className={styles.actions}>
                      <span className={styles.savedFlash}>{flash}</span>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {section === 'companion' && (
            <section className={styles.card}>
              <div className={styles.cardTitle}>AI Companion</div>
              <div className={styles.cardSub}>
                Choose how your Companion communicates with you.
              </div>
              <div className={styles.companionGrid}>
                {COMPANION_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.companionStyle} ${companionStyle === s.id ? styles.companionStyleActive : ''}`}
                    onClick={() => {
                      setCompanionStyle(s.id);
                      flashOk('Companion style updated');
                    }}
                  >
                    <div className={styles.companionTitle}>{s.title}</div>
                    <div className={styles.companionDesc}>{s.desc}</div>
                  </button>
                ))}
              </div>
              {flash && (
                <div className={styles.actions}>
                  <span className={styles.savedFlash}>{flash}</span>
                </div>
              )}
            </section>
          )}

          {section === 'language' && (
            <section className={styles.card}>
              <div className={styles.cardTitle}>Language &amp; Region</div>
              <div className={styles.cardSub}>
                Localize content and dates to your preference.
              </div>
              <div className={styles.langGrid}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`${styles.langCard} ${lang === l.code ? styles.langActive : ''}`}
                    onClick={() => {
                      setLang(l.code);
                      flashOk('Language saved');
                    }}
                  >
                    <div className={styles.langName}>{l.name}</div>
                    <div className={styles.langNative}>{l.native}</div>
                  </button>
                ))}
              </div>
              {flash && (
                <div className={styles.actions}>
                  <span className={styles.savedFlash}>{flash}</span>
                </div>
              )}
            </section>
          )}

          <section className={styles.dangerCard}>
            <div className={styles.dangerTitle}>Danger Zone</div>
            <div className={styles.dangerSub}>
              Permanently delete your data or close your sanctuary. These
              actions cannot be undone.
            </div>
            <button type="button" className={styles.dangerBtn}>
              Delete Account
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
