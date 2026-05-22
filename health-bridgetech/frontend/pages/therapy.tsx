import { useState } from 'react';
import styles from './therapy.module.css';
import { Topbar } from '../shell/topbar.js';
import { useAuth } from '../api/auth-context.js';
import { api } from '../api/client.js';
import type { User } from '../api/types.js';
import {
  SearchIcon, FiltersIcon, StarIcon, AwardIcon, CalendarIcon, ChevronRightIcon,
  CompanionIcon, WindIcon, LockIcon, PlusIcon, BulbIcon,
} from '../components/icons.js';

const PRACTITIONERS = [
  {
    id: 'p1',
    name: 'Dr. Elena Vane',
    specialty: 'Trauma & Mindfulness Specialist',
    rating: 4.9,
    reviews: 124,
    description: 'Pioneering a holistic approach to somatic trauma release, Dr. Vane helps patients navigate complex emotional landscapes.',
    price: '$120/hr',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  },
  {
    id: 'p2',
    name: 'Julian Thorne',
    specialty: 'CBT & Behavioral Design',
    rating: 5.0,
    reviews: 89,
    description: 'Julian blends traditional cognitive behavioral therapy with modern behavioral science to create lasting change.',
    price: '$145/hr',
    image: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop',
  },
];

const FILTERS = ['All Specialties', 'CBT', 'Mindfulness', 'Trauma Healing', 'Grief Support', 'Anxiety Mgmt'];
const SESSIONS = [
  { month: 'OCT', day: '14', title: 'Session with Dr. Vane', meta: '10:30 AM \u2022 Video Call' },
  { month: 'OCT', day: '21', title: 'Routine Check-in', meta: '02:00 PM \u2022 Audio Call' },
];

/** Therapy / Find Your Sanctuary page */
export function TherapyPage() {
  const { user, setUser } = useAuth();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  const book = async (p: typeof PRACTITIONERS[number]) => {
    try {
      const res = await api<{ user: User }>('/api/activities', {
        method: 'POST',
        body: JSON.stringify({ type: 'therapy', title: `Booked session with ${p.name}`, durationMinutes: 60 }),
      });
      setUser(res.user);
      setFlash(`Booked with ${p.name} \u2014 confirmation sent to ${user?.email}`);
      setTimeout(() => setFlash(null), 3000);
    } catch {/* ignore */}
  };

  const filtered = PRACTITIONERS.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.specialty.toLowerCase().includes(search.toLowerCase()),
  );

  const TILES = [
    { Icon: CompanionIcon, title: 'Cognitive Focus', sub: 'Rank: Adept', locked: false },
    { Icon: WindIcon, title: 'Breath Work', sub: `${user?.streak ?? 0} Day Streak`, locked: false },
    { Icon: LockIcon, title: 'Inner Silence', sub: 'Locked', locked: true },
    { Icon: LockIcon, title: 'Shadow Work', sub: 'Locked', locked: true },
  ];

  return (
    <>
      <Topbar
        tabs={[
          { label: 'Therapy', to: '/therapy', active: true },
          { label: 'Metrics', to: '/activity' },
          { label: 'Community', to: '/community' },
        ]}
        variant="avatar"
      />

      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Find Your Sanctuary</h1>
          <p className={styles.intro}>
            Connect with world-class practitioners specializing in holistic healing and cognitive well-being.
          </p>

          <div className={styles.searchRow}>
            <div className={styles.search}>
              <SearchIcon size={16} />
              <input
                placeholder="Search by name, specialty or goal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiltersIcon size={16} />
            </div>
          </div>

          <div className={styles.filters}>
            {FILTERS.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(i)}
                className={`${styles.chip} ${i === activeFilter ? styles.chipActive : ''}`}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={styles.featuredLabel}>Featured Practitioners</div>
          <div className={styles.practitioners}>
            {filtered.map((p) => (
              <div key={p.id} className={styles.practitionerCard}>
                <div className={styles.practitionerImg}>
                  <img src={p.image} alt={p.name} />
                  <span className={styles.rating}>
                    <StarIcon size={11} /> {p.rating.toFixed(1)} ({p.reviews})
                  </span>
                </div>
                <div className={styles.practitionerName}>{p.name}</div>
                <div className={styles.practitionerSpec}>{p.specialty}</div>
                <div className={styles.practitionerDesc}>{p.description}</div>
                <div className={styles.practitionerFoot}>
                  <span className={styles.price}>{p.price}</span>
                  <button type="button" className={styles.bookBtn} onClick={() => book(p)}>
                    Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>

          {flash && (
            <div style={{ marginTop: 16, padding: 14, background: 'var(--hb-mint-pale)', borderRadius: 12, fontSize: 13, color: 'var(--hb-primary)', fontWeight: 600 }}>
              {flash}
            </div>
          )}

          <div className={styles.masteryCard}>
            <div className={styles.masteryHead}>
              <div>
                <div className={styles.masteryTitle}>Path to Mastery</div>
                <div className={styles.masterySub}>Your journey toward emotional equilibrium.</div>
              </div>
              <span className={styles.masteryXp}><AwardIcon size={12} /> {(user?.xp ?? 0).toLocaleString()} XP</span>
            </div>

            <div className={styles.masteryProgress}>
              <span>Self-Reflection Habit</span>
              <span className={styles.masteryProgressVal}>{Math.min(100, (user?.streak ?? 0) * 14)}% COMPLETE</span>
            </div>
            <div className={styles.masteryBar}>
              <div className={styles.masteryFill} style={{ width: `${Math.min(100, (user?.streak ?? 0) * 14)}%` }} />
            </div>

            <div className={styles.masteryTiles}>
              {TILES.map((t) => (
                <div key={t.title} className={styles.masteryTile} style={t.locked ? { opacity: 0.6 } : undefined}>
                  <span className={styles.masteryTileIcon}><t.Icon size={20} /></span>
                  <div className={styles.masteryTileTitle}>{t.title}</div>
                  <div className={styles.masteryTileSub}>{t.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className={styles.side}>
          <div className={styles.sideCard}>
            <div className={styles.sideTitle}>
              <span>UPCOMING SESSIONS</span>
              <CalendarIcon size={14} />
            </div>
            {SESSIONS.map((s) => (
              <div key={s.day + s.title} className={styles.sessionItem}>
                <div className={styles.sessionDate}>
                  <span className={styles.sessionMonth}>{s.month}</span>
                  <span className={styles.sessionDay}>{s.day}</span>
                </div>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionTitle}>{s.title}</div>
                  <div className={styles.sessionMeta}>{s.meta}</div>
                </div>
                <ChevronRightIcon size={14} />
              </div>
            ))}
            <button type="button" className={styles.scheduleBtn}>
              <PlusIcon size={14} /> Schedule Session
            </button>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.sideTitle}>CURRENT MILESTONE</div>
            <div className={styles.milestoneTitle}>Emotional Bloom</div>
            <div className={styles.milestoneCopy}>
              Complete 5 journals focusing on positive gratitude prompts.
            </div>
            <div className={styles.milestoneRow}>
              <div className={styles.miniAvatars}>
                <span className={styles.miniAv}>JB</span>
                <span className={styles.miniAv}>EV</span>
              </div>
              <span className={styles.milestoneStatus}>3/5 Completed</span>
            </div>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.insightLabel}>CLINICAL INSIGHT</div>
            <div className={styles.insightBody}>
              <span className={styles.insightIcon}><BulbIcon size={16} /></span>
              <div>
                <div className={styles.insightQuote}>
                  &ldquo;Consistent mindfulness practices have been shown to reduce amygdala
                  reactivity by up to 30% over an 8-week period.&rdquo;
                </div>
                <div className={styles.insightSource}>&mdash; Journal of Neurological Wellness</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
