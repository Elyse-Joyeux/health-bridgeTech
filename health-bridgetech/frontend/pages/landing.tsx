import { Link } from 'react-router-dom';
import styles from './landing.module.css';
import {
  ArrowRightIcon, CompanionIcon, ChatIcon, MeditationIcon, PlayIcon, MoonIcon,
  LeafIcon, SparkleIcon, BoltIcon, CloudIcon, WaveIcon, ShareIcon, MessagesIcon, BellIcon,
} from '../components/icons.js';

const FEATURES_NAV = [
  { label: 'Features', active: true },
  { label: 'Community' },
  { label: 'Therapy' },
  { label: 'Yoga & Music' },
];

const MOODS = [
  { label: 'Stressed' },
  { label: 'Anxious' },
  { label: 'Neutral', active: true },
  { label: 'Calm' },
  { label: 'Peaceful' },
];

/** Modernized public landing page */
export function LandingPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brand}>
          Health BridgeTech
        </Link>
        <div className={styles.navLinks}>
          {FEATURES_NAV.map((n) => (
            <span
              key={n.label}
              className={`${styles.navLink} ${n.active ? styles.navLinkActive : ''}`}
            >
              {n.label}
            </span>
          ))}
        </div>
        <div className={styles.navRight}>
          <Link to="/login" className={styles.loginLink}>
            Login
          </Link>
          <Link to="/signup" className={styles.ctaBtn}>
            Get Started
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroEyebrow}>WELCOME TO YOUR CALM</div>
          <h1 className={styles.heroTitle}>
            Your journey to <em>peace</em> starts here.
          </h1>
          <p className={styles.heroLead}>
            Find tranquility in a chaotic world. Health BridgeTech provides the tools, community,
            and professional guidance you need to rediscover your inner balance.
          </p>
          <div className={styles.heroCtaRow}>
            <Link to="/signup" className={styles.btnPrimary}>
              Start Free Trial <ArrowRightIcon size={14} />
            </Link>
            <button type="button" className={styles.btnGhost}>
              How it Works <PlayIcon size={12} />
            </button>
          </div>

          <div className={styles.socialProof}>
            <div className={styles.avatarStack}>
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" alt="" />
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop" alt="" />
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop" alt="" />
            </div>
            <div className={styles.proofText}>
              <strong>2.4k+ active seekers</strong> online now
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.affirmation}>
            <span className={styles.affIcon}>
              <SparkleIcon size={18} />
            </span>
            <div>
              <div className={styles.affLabel}>DAILY AFFIRMATION</div>
              <div className={styles.affQuote}>
                "I am at peace with my past and excited for my future."
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Holistic tools for your wellbeing</h2>
          <p className={styles.sectionLead}>
            We&rsquo;ve crafted a suite of empathetic features designed to support your mental and
            emotional journey, wherever you are.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <Link to="/community" className={styles.featureCard} style={{ textDecoration: 'none' }}>
            <span className={styles.fcIcon}><ChatIcon size={18} /></span>
            <div className={styles.fcTitle}>Community Chat</div>
            <div className={styles.fcBody}>
              Connect with like-minded individuals in safe, moderated spaces focused on growth and
              empathy.
            </div>
            <div className={styles.fcTags}>
              <span className={styles.fcTag}>#SupportCircles</span>
              <span className={`${styles.fcTag} ${styles.fcTagBlue}`}>#DailyGratitude</span>
            </div>
          </Link>

          <div className={`${styles.featureCard} ${styles.fcImage}`}>
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=500&fit=crop"
              alt="Community gathering"
            />
          </div>

          <Link to="/companion" className={`${styles.featureCard} ${styles.fcDark}`} style={{ textDecoration: 'none' }}>
            <span className={styles.fcIcon}><CompanionIcon size={18} /></span>
            <div className={styles.fcTitle}>AI Serenity Bot</div>
            <div className={styles.fcBody}>
              Your 24/7 empathetic companion for mood tracking and quick mindfulness exercises.
            </div>
            <button type="button" className={styles.fcChatBtn}>Chat Now</button>
          </Link>

          <Link to="/therapy" className={styles.featureCard} style={{ textDecoration: 'none' }}>
            <span className={styles.fcIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="9" r="3" />
                <circle cx="17" cy="10" r="2.5" />
                <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
                <path d="M15 18c.4-1.7 1.8-2.7 3.5-2.7 1.8 0 3.1 1 3.5 2.7" />
              </svg>
            </span>
            <div className={styles.fcTitle}>Volunteer Sessions</div>
            <div className={styles.fcBody}>
              Guided group sessions led by certified wellness volunteers every week.
            </div>
          </Link>

          <Link
            to="/meditation"
            className={`${styles.featureCard} ${styles.fcSand}`}
            style={{ gridColumn: 'span 2', textDecoration: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className={styles.fcIcon}><MeditationIcon size={18} /></span>
              <div className={styles.fcTitle}>Yoga & Music</div>
              <div className={styles.fcBody}>
                Immerse yourself in curated soundscapes and gentle movement practices designed for
                any skill level.
              </div>
              <span className={styles.fcLink}>
                <PlayIcon size={11} /> Listen to &lsquo;Morning Mist&rsquo;
              </span>
            </div>
            <div className={styles.fcImageInline} style={{ aspectRatio: '4 / 3' }}>
              <img
                src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop"
                alt="Yoga studio"
              />
            </div>
          </Link>
        </div>
      </section>

      <section className={styles.moodSection}>
        <div>
          <h2 className={styles.moodTitle}>How are you feeling today?</h2>
          <p className={styles.moodLead}>
            Take a moment to check in with yourself. We&rsquo;ll suggest a practice based on your
            current state.
          </p>
          <div className={styles.moodPicker}>
            {MOODS.map((m) => (
              <button
                key={m.label}
                type="button"
                className={`${styles.moodOption} ${m.active ? styles.moodOptionActive : ''}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.moodVisual}>
          <div className={styles.moodOrb}>
            <span className={styles.orbTop}><MoonIcon size={16} /></span>
            <div className={styles.moodOrbInner}>
              <MeditationIcon size={64} />
            </div>
            <span className={styles.orbBottom}><LeafIcon size={14} /></span>
          </div>
        </div>
      </section>

      <section className={styles.bannerSection}>
        <div className={styles.banner}>
          <h2 className={styles.bannerTitle}>Start your transformation today</h2>
          <p className={styles.bannerLead}>
            Join over 500,000 users who have found their center with Health BridgeTech&rsquo;s
            empathetic approach to wellness.
          </p>
          <div className={styles.bannerCtaRow}>
            <Link to="/signup" className={styles.bannerCta}>
              Get Started Free <ArrowRightIcon size={14} />
            </Link>
            <Link to="/therapy" className={styles.bannerGhost}>
              Explore Therapy
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerBrand}>Health BridgeTech</div>
            <p className={styles.footerDesc}>
              Redefining digital mental wellness through empathetic technology and supportive
              community spaces.
            </p>
            <div className={styles.footerSocial}>
              <span className={styles.footerIcon}><ShareIcon size={16} /></span>
              <span className={styles.footerIcon}><MessagesIcon size={16} /></span>
              <span className={styles.footerIcon}><BellIcon size={16} /></span>
            </div>
          </div>

          <div>
            <div className={styles.footerColTitle}>Platform</div>
            <span className={styles.footerLink}>Features</span>
            <span className={styles.footerLink}>Community</span>
            <span className={styles.footerLink}>Yoga &amp; Music</span>
            <span className={styles.footerLink}>AI Companion</span>
          </div>

          <div>
            <div className={styles.footerColTitle}>Resources</div>
            <span className={styles.footerLink}>Help Center</span>
            <span className={styles.footerLink}>Wellness Blog</span>
            <span className={styles.footerLink}>Therapist Directory</span>
            <span className={styles.footerLink}>Scientific Whitepaper</span>
          </div>

          <div>
            <div className={styles.footerColTitle}>Connect</div>
            <span className={styles.footerLink}>hello@bridgetech.io</span>
            <span className={styles.footerLink}>Press kit</span>
            <span className={styles.footerLink}>Partnerships</span>
            <span className={styles.footerLink}>Careers</span>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>&copy; 2026 Health BridgeTech. All rights reserved.</span>
          <div className={styles.footerBottomLinks}>
            <span className={styles.footerLink}>Privacy Policy</span>
            <span className={styles.footerLink}>Terms of Service</span>
            <span className={styles.footerLink}>Cookie Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
