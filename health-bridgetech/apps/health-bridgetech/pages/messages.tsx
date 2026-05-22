import { useEffect, useRef, useState } from 'react';
import styles from './messages.module.css';
import { Topbar } from '../shell/topbar.js';
import { api } from '../api/client.js';
import { useAuth } from '../api/auth-context.js';
import type { ChatMessage } from '../api/types.js';
import {
  SearchIcon, SendIcon, AttachIcon, PlusIcon, CalendarIcon, ChatIcon, BookIcon,
} from '../components/icons.js';

const CONVERSATIONS = [
  { id: 'companion', name: 'AI Companion', role: 'Always available', avatar: '', initials: 'AI', isCompanion: true, time: 'Now' },
  { id: 'cv1', name: 'Dr. Sarah Jenkins', role: 'Cognitive Behavioral Specialist', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop', preview: 'Looking forward to our session at 2pm.', time: '10:24 AM', unread: 2 },
  { id: 'cv2', name: 'Maya Wu', role: 'Mindfulness Specialist', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop', preview: 'Your meditation streak is impressive!', time: 'Yesterday' },
  { id: 'cv3', name: 'Anxiety Support Circle', role: 'Community Group \u2022 12 members', initials: 'AS', preview: 'Marcus: Thanks for sharing that technique.', time: 'Yesterday', unread: 5 },
];

const TABS = ['All', 'Care Team', 'Circles', 'Companion'];

/** Messages page — live conversation with the AI Companion via backend */
export function MessagesPage() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState('companion');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const active = CONVERSATIONS.find((c) => c.id === activeId) || CONVERSATIONS[0];

  useEffect(() => {
    if (activeId === 'companion') {
      api<ChatMessage[]>('/api/companion/messages').then(setMessages).catch(() => undefined);
    } else {
      setMessages([]);
    }
  }, [activeId]);

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setText('');
    setSending(true);
    if (activeId === 'companion') {
      const optimistic: ChatMessage = { _id: `tmp-${Date.now()}`, userId: user!.id, role: 'user', text: value, createdAt: new Date().toISOString() };
      setMessages((m) => [...m, optimistic]);
      try {
        const ai = await api<ChatMessage>('/api/companion/messages', { method: 'POST', body: JSON.stringify({ text: value }) });
        setMessages((m) => [...m, ai]);
      } finally {
        setSending(false);
      }
    } else {
      setMessages((m) => [...m, { _id: `me-${Date.now()}`, userId: user!.id, role: 'user', text: value, createdAt: new Date().toISOString() }]);
      setTimeout(() => {
        setMessages((m) => [...m, { _id: `them-${Date.now()}`, userId: 'them', role: 'ai', text: 'Thanks for reaching out \u2014 I will respond within 2 hours.', createdAt: new Date().toISOString() }]);
        setSending(false);
      }, 800);
    }
  };

  return (
    <>
      <Topbar
        title="Messages"
        tabs={[
          { label: 'Therapy', to: '/therapy' },
          { label: 'Metrics', to: '/activity' },
          { label: 'Community', to: '/community' },
        ]}
      />

      <div className={styles.page}>
        <aside className={styles.list}>
          <div className={styles.listHead}>
            <div className={styles.listTitle}>Inbox</div>
            <div className={styles.search}>
              <SearchIcon size={14} />
              <input placeholder="Search conversations..." />
            </div>
          </div>
          <div className={styles.tabs}>
            {TABS.map((t, i) => (
              <span key={t} className={`${styles.tab} ${i === 0 ? styles.tabActive : ''}`}>{t}</span>
            ))}
          </div>

          <div className={styles.threads}>
            {CONVERSATIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.thread} ${activeId === c.id ? styles.threadActive : ''}`}
                onClick={() => setActiveId(c.id)}
                style={{ background: activeId === c.id ? 'var(--hb-mint-pale)' : 'none', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <span className={styles.avatar}>
                  {c.avatar ? <img src={c.avatar} alt={c.name} /> : c.initials}
                </span>
                <div className={styles.threadBody}>
                  <div className={styles.threadHead}>
                    <span className={styles.threadName}>{c.name}</span>
                    <span className={styles.threadTime}>{c.time}</span>
                  </div>
                  <div className={styles.threadRole}>{c.role}</div>
                  <div className={styles.threadPreview}>
                    {c.isCompanion ? 'Tap to chat with your Companion' : (c as any).preview}
                  </div>
                </div>
                {(c as any).unread && <span className={styles.unread}>{(c as any).unread}</span>}
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.conversation}>
          <div className={styles.convHead}>
            <span className={styles.avatar}>
              {active.avatar ? <img src={active.avatar} alt={active.name} /> : active.initials}
            </span>
            <div className={styles.convInfo}>
              <div className={styles.convName}>{active.name}</div>
              <div className={styles.convStatus}>Online &bull; {active.role}</div>
            </div>
            <div className={styles.convActions}>
              <button type="button" className={styles.iconBtn} aria-label="Schedule"><CalendarIcon size={16} /></button>
              <button type="button" className={styles.iconBtn} aria-label="Call"><ChatIcon size={16} /></button>
            </div>
          </div>

          <div className={styles['thread-stream']} ref={scrollerRef}>
            <div className={styles.daySep}>TODAY</div>
            {messages.length === 0 && (
              <div className={`${styles.bubble} ${styles.bubbleThem}`}>
                {active.isCompanion ? 'Hi! What\u2019s on your mind today?' : 'Start a conversation \u2014 messages are end-to-end encrypted.'}
              </div>
            )}
            {messages.map((m) => (
              <div key={m._id} className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleMe : styles.bubbleThem}`}>
                {m.text}
                <div className={`${styles.time} ${m.role === 'user' ? styles.timeMe : ''}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {sending && <div className={`${styles.bubble} ${styles.bubbleThem}`}>typing\u2026</div>}
          </div>

          <form className={styles.composer} onSubmit={(e) => { e.preventDefault(); send(); }}>
            <button type="button" className={styles.iconBtn} aria-label="Attach"><AttachIcon size={16} /></button>
            <button type="button" className={styles.iconBtn} aria-label="Add"><PlusIcon size={16} /></button>
            <input placeholder="Write a message..." value={text} onChange={(e) => setText(e.target.value)} />
            <button type="submit" className={styles.sendBtn} aria-label="Send"><SendIcon size={14} /></button>
          </form>
        </section>

        <aside className={styles.side}>
          <div className={styles.sideCard}>
            <div className={styles.sideAvatar}>
              {active.avatar ? (
                <img src={active.avatar} alt={active.name} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--hb-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--hb-font-serif)', fontSize: 24, fontWeight: 600, color: 'var(--hb-primary)' }}>
                  {active.initials}
                </div>
              )}
            </div>
            <div className={styles.sideName}>{active.name}</div>
            <div className={styles.sideRole}>{active.role}</div>

            <div className={styles.sideRow}>
              <span className={styles.sideRowLabel}>Status</span>
              <span className={styles.sideRowVal}>{active.isCompanion ? '24/7' : 'Online'}</span>
            </div>
            <div className={styles.sideRow}>
              <span className={styles.sideRowLabel}>Messages</span>
              <span className={styles.sideRowVal}>{messages.length}</span>
            </div>
            <div className={styles.sideRow}>
              <span className={styles.sideRowLabel}>Response Time</span>
              <span className={styles.sideRowVal}>{active.isCompanion ? '< 1s' : '< 2 hours'}</span>
            </div>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.sideTitle}>Shared Resources</div>
            {[
              { name: 'CBT Worksheet \u2014 Week 3', meta: 'PDF \u2022 1.2 MB' },
              { name: 'Pre-session Reflection', meta: 'DOCX \u2022 84 KB' },
              { name: 'Cortisol Insight Brief', meta: 'PDF \u2022 540 KB' },
            ].map((f) => (
              <div key={f.name} className={styles.fileRow}>
                <span className={styles.fileIcon}><BookIcon size={14} /></span>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>{f.name}</div>
                  <div className={styles.fileMeta}>{f.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
