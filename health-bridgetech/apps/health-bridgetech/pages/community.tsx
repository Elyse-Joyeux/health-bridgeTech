import { useState } from 'react';
import styles from './community.module.css';
import { Topbar } from '../shell/topbar.js';
import { useAuth } from '../api/auth-context.js';
import {
  MicIcon, HeadphonesIcon, CalendarIcon, HeartFilledIcon, CommentIcon, ShareIcon,
  BookIcon, AwardIcon,
} from '../components/icons.js';

const CIRCLES = [
  { id: 'c1', title: 'Anxiety Support', description: 'Navigating social triggers in professional environments with Dr. Aris.', status: 'live' as const, statusLabel: 'LIVE NOW', ctaLabel: 'Join Voice', ctaIcon: MicIcon, variant: 'primary' as const, participants: 12 },
  { id: 'c2', title: 'Sleep Science', description: 'The relationship between blue light, melatonin, and REM cycles.', status: 'active' as const, statusLabel: '18 ACTIVE', ctaLabel: 'Listen In', ctaIcon: HeadphonesIcon, variant: 'secondary' as const },
  { id: 'c3', title: 'Mindful Eating', description: 'A deep dive into sensory awareness during evening meals with Sarah J.', status: 'starting' as const, statusLabel: 'STARTING IN 12M', ctaLabel: 'Set Reminder', ctaIcon: CalendarIcon, variant: 'outline' as const },
];

const POSTS = [
  {
    id: 'p1',
    author: 'Marcus Aurelius',
    initials: 'MA',
    posted: '2 hours ago in Anxiety Support',
    badge: 'COMMUNITY STAR',
    body: 'Practiced the 5-4-3-2-1 grounding technique during a high-stress meeting today. It really works. Grateful for the tips shared in yesterday\u2019s circle. \uD83C\uDF3F',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&h=500&fit=crop',
    likes: 124, comments: 18,
  },
  {
    id: 'p2',
    author: 'Sarah Luna',
    initials: 'SL',
    posted: '5 hours ago',
    body: 'A small reminder for anyone who needs it today: we all grow at our own pace. \uD83C\uDF19',
    likes: 89, comments: 3,
  },
];

const KNOWLEDGE = [
  { title: 'Understanding Cortisol Spikes', meta: '5 min read \u2022 By Dr. Aris' },
  { title: 'Circadian Rhythms & Recovery', meta: '8 min read \u2022 Sleep Science' },
  { title: 'Neuroplasticity in Adult Brains', meta: '12 min read \u2022 Behavioral Science' },
];

const GUIDES = [
  { name: 'Dr. Aris Thorne', role: 'Clinical Psychologist', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop' },
  { name: 'Maya Wu', role: 'Mindfulness Specialist', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop' },
];

const variantBorder = { primary: 'circlePrimary', secondary: 'circleSecondary', outline: 'circleOutline' } as const;
const variantBtn = { primary: 'btnPrimary', secondary: 'btnSecondary', outline: 'btnOutline' } as const;
const statusClass = { live: 'statusLive', active: 'statusActive', starting: 'statusStarting' } as const;

/** Community hub page */
export function CommunityPage() {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Record<string, number>>({});

  const toggleLike = (id: string, base: number) =>
    setLikes((l) => ({ ...l, [id]: l[id] === base + 1 ? base : base + 1 }));

  return (
    <>
      <Topbar
        title="Community"
        tabs={[
          { label: 'Therapy', to: '/therapy' },
          { label: 'Metrics', to: '/activity' },
          { label: 'Community', to: '/community', active: true },
        ]}
        right={
          <button type="button" style={{ background: 'var(--hb-primary)', color: '#fff', padding: '10px 22px', borderRadius: 999, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}>
            New Post
          </button>
        }
      />

      <div className={styles.page}>
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.sectionTitle}>Community Circles</div>
              <div className={styles.sectionSub}>Join a live discussion or support session</div>
            </div>
            <span className={styles.viewAll}>View All Circles &rarr;</span>
          </div>

          <div className={styles.circles}>
            {CIRCLES.map((c) => (
              <div key={c.id} className={`${styles.circleCard} ${styles[variantBorder[c.variant]]}`}>
                <div className={styles.circleHead}>
                  <span className={`${styles.statusPill} ${styles[statusClass[c.status]]}`}>
                    <span className={styles.statusDot} />
                    {c.statusLabel}
                  </span>
                  <div className={styles.avatars}>
                    <span className={styles.avStack} style={{ background: '#c2dcd1' }} />
                    <span className={styles.avStack} style={{ background: '#6fa294' }} />
                    {c.participants && <span className={styles.avPlus}>+{c.participants}</span>}
                  </div>
                </div>
                <div className={styles.circleTitle}>{c.title}</div>
                <div className={styles.circleDesc}>{c.description}</div>
                <button type="button" className={`${styles.circleBtn} ${styles[variantBtn[c.variant]]}`}>
                  <c.ctaIcon size={14} />
                  {c.ctaLabel}
                </button>
              </div>
            ))}
          </div>

          <div className={styles.upliftLabel}>Uplifting Moments</div>

          <div className={styles.posts}>
            {POSTS.map((p) => (
              <article key={p.id} className={styles.post}>
                <div className={styles.postHead}>
                  <span className={styles.postAvatar}>{p.initials}</span>
                  <div>
                    <div className={styles.postAuthor}>{p.author}</div>
                    <div className={styles.postMeta}>{p.posted}</div>
                  </div>
                  {p.badge && <span className={styles.postBadge}>{p.badge}</span>}
                </div>
                <div className={styles.postBody}>{p.body}</div>
                {p.image && (
                  <div className={styles.postImg}><img src={p.image} alt="" /></div>
                )}
                <div className={styles.postFoot}>
                  <button type="button" onClick={() => toggleLike(p.id, p.likes)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: likes[p.id] ? 'var(--hb-danger)' : 'var(--hb-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5 }}>
                    <HeartFilledIcon size={14} /> {likes[p.id] ?? p.likes}
                  </button>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <CommentIcon size={14} /> {p.comments} Comments
                  </span>
                  <span className={styles.postFootSpacer} />
                  <ShareIcon size={14} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className={styles.side}>
          <div className={styles.kbCard}>
            <div className={styles.kbHead}>
              <BookIcon size={18} />
              <div className={styles.kbTitle}>Knowledge Base</div>
            </div>
            <div className={styles.kbIntro}>Recommended for your active circles</div>
            {KNOWLEDGE.map((k) => (
              <div key={k.title} className={styles.kbItem}>
                <div className={styles.kbItemTitle}>{k.title}</div>
                <div className={styles.kbItemMeta}>{k.meta}</div>
              </div>
            ))}
            <button type="button" className={styles.kbBtn}>Browse All Articles</button>
          </div>

          <div className={styles.guidesCard}>
            <div className={styles.guidesTitle}>On-Duty Guides</div>
            {GUIDES.map((g) => (
              <div key={g.name} className={styles.guideRow}>
                <span className={styles.guideAvatar}>
                  <img src={g.avatar} alt={g.name} />
                  <span className={styles.guideDot} />
                </span>
                <div>
                  <div className={styles.guideName}>{g.name}</div>
                  <div className={styles.guideRole}>{g.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.contributionCard}>
            <div className={styles.contribHead}>
              <div className={styles.contribLabel}>Community<br />Contribution</div>
              <AwardIcon size={18} />
            </div>
            <div className={styles.contribValue}>{(user?.xp ?? 0).toLocaleString()} XP</div>
            <div className={styles.contribCopy}>
              Keep practicing to reach the next milestone tier.
            </div>
            <div className={styles.contribBar}>
              <div className={styles.contribFill} style={{ width: `${Math.min(100, ((user?.xp ?? 0) % 3000) / 30)}%` }} />
            </div>
            <div className={styles.contribRow}>
              <span>Lvl {user?.level ?? 1}</span>
              <span>Lvl {(user?.level ?? 1) + 1}</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
