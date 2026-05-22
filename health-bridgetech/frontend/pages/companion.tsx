import { useEffect, useRef, useState } from 'react';
import styles from './companion.module.css';
import { Topbar } from '../shell/topbar.js';
import { api, streamSSE } from '../api/client.js';
import { useAuth } from '../api/auth-context.js';
import { useMusic } from '../api/music-context.js';
import type { Biometric, ChatMessage } from '../api/types.js';
import {
  HeartIcon, MoonIcon, WindIcon, MeditationIcon, SendIcon, PlusIcon,
  LeafIcon, BulbIcon, SparkleIcon, AttachIcon,
} from '../components/icons.js';

const MOOD_OPTS = [
  { label: 'Calm', emoji: '\uD83D\uDE0C' },
  { label: 'Anxious', emoji: '\uD83D\uDE30' },
  { label: 'Energetic', emoji: '\u26A1' },
  { label: 'Tired', emoji: '\uD83D\uDE34' },
];

const QUICK_PROMPTS = [
  { Icon: WindIcon, label: 'I feel anxious', prompt: "I'm feeling anxious right now." },
  { Icon: MoonIcon, label: 'Sleep wasn\u2019t great', prompt: "I didn't sleep well last night." },
  { Icon: HeartIcon, label: 'I feel stressed', prompt: "I'm feeling stressed about my day." },
  { Icon: MeditationIcon, label: 'Help me focus', prompt: 'Help me get into a focus state.' },
];

/** AI Companion page with real chat + sanctuary mode controlling the music bar */
export function CompanionPage() {
  const { user } = useAuth();
  const { play, stop, current, tracks } = useMusic();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [bio, setBio] = useState<Biometric | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<ChatMessage[]>('/api/companion/messages').then(setMessages).catch(() => undefined);
  }, []);

  useEffect(() => streamSSE('/api/biometrics/stream', (p: Biometric) => setBio(p)), []);

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (override?: string) => {
    const value = (override ?? text).trim();
    if (!value || sending) return;
    setText('');
    setSending(true);
    const optimistic: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      userId: user!.id,
      role: 'user',
      text: value,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    try {
      const aiMsg = await api<ChatMessage>('/api/companion/messages', {
        method: 'POST',
        body: JSON.stringify({ text: value }),
      });
      setMessages((m) => [...m, aiMsg]);
    } finally {
      setSending(false);
    }
  };

  const toggleSanctuary = () => {
    if (current) stop();
    else {
      const t = tracks.find((x) => x.id === 'ocean') || tracks[0];
      if (t) play(t);
    }
  };

  const serenity = bio ? Math.max(40, 100 - bio.stressLevel) : 82;
  const hr = bio?.heartRate ?? 66;
  const hrv = bio?.hrv ?? 72;

  return (
    <>
      <Topbar
        title="AI Companion"
        tabs={[
          { label: 'Therapy', to: '/therapy' },
          { label: 'Metrics', to: '/activity' },
          { label: 'Community', to: '/community' },
        ]}
        variant="pill"
      />

      <div className={styles.page}>
        <div className={styles.leftCol}>
          <div className={styles.pulseCard}>
            <div className={styles.pulseHead}>
              <div className={styles.pulseTitle}>Wellness Pulse</div>
              <span style={{ color: 'var(--hb-accent)' }}><SparkleIcon size={16} /></span>
            </div>

            <div className={styles.serenity}>
              <div className={styles.serenityRow}>
                <span>Serenity Level</span>
                <span className={styles.serenityVal}>{serenity}%</span>
              </div>
              <div className={styles.serenityBar}>
                <div className={styles.serenityFill} style={{ width: `${serenity}%` }} />
              </div>
            </div>

            <div className={styles.metricRow}>
              <span className={styles.metricIcon}><HeartIcon size={16} /></span>
              <div>
                <div className={styles.metricLabel}>HEART RATE</div>
                <div className={styles.metricVal}>{hr} BPM</div>
              </div>
            </div>

            <div className={styles.metricRow}>
              <span className={styles.metricIcon}><SparkleIcon size={16} /></span>
              <div>
                <div className={styles.metricLabel}>HRV</div>
                <div className={styles.metricVal}>{hrv} ms</div>
              </div>
            </div>
          </div>

          <div className={styles.xpCard}>
            <div className={styles.xpTitle}>Your Practice</div>
            <div className={styles.xpChips}>
              <span className={styles.xpChip}>{(user?.xp || 0).toLocaleString()} XP</span>
              <span className={styles.xpChipAlt}>Streak: {user?.streak || 0}d</span>
              <span className={styles.xpChipMint}>Lvl {user?.level || 1}</span>
            </div>
          </div>
        </div>

        <div className={styles.center}>
          <div className={styles.centerBg} />
          <div className={styles.header}>
            <span className={styles.orb}>
              <SparkleIcon size={28} />
              <span className={styles.orbStatus} />
            </span>
            <div className={styles.helloName}>Hello, {user?.displayName.split(' ')[0]}</div>
            <p className={styles.helloIntro}>
              I&rsquo;m here whenever you need a moment. What&rsquo;s present for you right now?
            </p>
          </div>

          <div className={styles.chat} ref={scrollerRef}>
            {messages.length === 0 && !sending && (
              <div className={styles.bubble + ' ' + styles.bubbleAi}>
                Welcome. Try a quick prompt below, or type whatever&rsquo;s on your mind.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m._id}
                className={`${styles.bubble} ${m.role === 'ai' ? styles.bubbleAi : styles.bubbleUser}`}
              >
                {m.text}
                <div className={`${styles.bubbleTime} ${m.role === 'user' ? styles.bubbleTimeUser : ''}`}>
                  {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {sending && <div className={styles.typing}><span /><span /><span /></div>}
          </div>

          <div className={styles.suggestions}>
            {QUICK_PROMPTS.map((p) => (
              <button key={p.label} type="button" className={styles.suggChip} onClick={() => send(p.prompt)}>
                <p.Icon size={12} /> {p.label}
              </button>
            ))}
          </div>

          <form className={styles.composer} onSubmit={(e) => { e.preventDefault(); send(); }}>
            <button type="button" className={styles.composerExtra} aria-label="Attach"><AttachIcon size={14} /></button>
            <button type="button" className={styles.composerExtra} aria-label="More"><PlusIcon size={14} /></button>
            <input
              className={styles.composerInput}
              placeholder="Share your thoughts with your Companion..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className={styles.composerSend} disabled={!text.trim() || sending}>
              <SendIcon size={14} />
            </button>
          </form>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.moodCard}>
            <div className={styles.moodCardTitle}>Current Mood</div>
            <div className={styles.moodGrid}>
              {MOOD_OPTS.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  className={`${styles.moodOption} ${mood === m.label ? styles.moodOptionActive : ''}`}
                  onClick={() => setMood(m.label)}
                >
                  <span className={styles.moodEmoji}>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sanctuaryCard}>
            <div className={styles.sanctuaryHead}>
              <LeafIcon size={16} />
              <div className={styles.sanctuaryTitle}>Sanctuary Mode</div>
            </div>
            <div className={styles.sanctuaryBody}>
              Ambient soundscapes help regulate your breathing. Toggle to start an oceanic track in
              the player at the bottom.
            </div>
            <div className={styles.sanctuaryFoot}>
              <span style={{ fontSize: 11.5, color: 'var(--hb-text-muted)' }}>
                {current ? `Playing: ${current.title}` : 'Idle'}
              </span>
              <button type="button" className={styles.sanctuaryBtn} onClick={toggleSanctuary}>
                {current ? 'Stop \u203A' : 'Start \u203A'}
              </button>
            </div>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}><BulbIcon size={16} /></span>
            <div>
              <div className={styles.tipTitle}>Companion Tip</div>
              <div className={styles.tipBody}>
                Slow exhales (2x longer than inhale) signal safety to your nervous system. Try 4-in,
                8-out for two minutes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
