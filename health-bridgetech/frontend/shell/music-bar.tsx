import { useState } from 'react';
import styles from './music-bar.module.css';
import { useMusic } from '../api/music-context.js';
import { PlayIcon, ChevronRightIcon, MeditationIcon } from '../components/icons.js';

/** Sticky bottom music bar — appears once the user picks a track */
export function MusicBar() {
  const { current, playing, toggle, next, prev, tracks, play, stop, volume, setVolume } =
    useMusic();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!current) {
    return (
      <>
        <button
          type="button"
          className={styles.launcher}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          <MeditationIcon size={16} /> Ambient Soundscapes
        </button>
        {drawerOpen && (
          <div className={styles.drawer}>
            <div className={styles.drawerHead}>
              <div className={styles.drawerTitle}>Choose your ambience</div>
              <button type="button" className={styles.close} onClick={() => setDrawerOpen(false)}>
                Close
              </button>
            </div>
            {tracks.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.track}
                onClick={() => {
                  play(t);
                  setDrawerOpen(false);
                }}
              >
                <span className={styles.trackCover}>
                  <img src={t.cover} alt={t.title} />
                </span>
                <span className={styles.trackInfo}>
                  <span className={styles.trackTitle}>{t.title}</span>
                  <span className={styles.trackMood}>{t.mood} \u00b7 {t.duration}</span>
                </span>
                <span className={styles.trackPlay}>
                  <PlayIcon size={12} />
                </span>
              </button>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.cover}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          <img src={current.cover} alt={current.title} />
        </button>
        <div className={styles.info}>
          <div className={styles.title}>{current.title}</div>
          <div className={styles.mood}>{current.mood}</div>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.iconBtn} onClick={prev} aria-label="Previous">
            <ChevronRightIcon size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button type="button" className={styles.playBtn} onClick={toggle} aria-label="Play/Pause">
            {playing ? (
              <span style={{ display: 'inline-flex', gap: 3 }}>
                <span style={{ width: 3, height: 14, background: 'currentColor', borderRadius: 1 }} />
                <span style={{ width: 3, height: 14, background: 'currentColor', borderRadius: 1 }} />
              </span>
            ) : (
              <PlayIcon size={14} />
            )}
          </button>
          <button type="button" className={styles.iconBtn} onClick={next} aria-label="Next">
            <ChevronRightIcon size={16} />
          </button>
        </div>
        <div className={styles.volume}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
          />
        </div>
        <button type="button" className={styles.iconBtn} onClick={stop} aria-label="Stop">
          \u00d7
        </button>
      </div>

      {drawerOpen && (
        <div className={styles.drawer}>
          <div className={styles.drawerHead}>
            <div className={styles.drawerTitle}>Ambient soundscapes</div>
            <button type="button" className={styles.close} onClick={() => setDrawerOpen(false)}>
              Close
            </button>
          </div>
          {tracks.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.track} ${current?.id === t.id ? styles.trackActive : ''}`}
              onClick={() => {
                play(t);
                setDrawerOpen(false);
              }}
            >
              <span className={styles.trackCover}>
                <img src={t.cover} alt={t.title} />
              </span>
              <span className={styles.trackInfo}>
                <span className={styles.trackTitle}>{t.title}</span>
                <span className={styles.trackMood}>{t.mood} \u00b7 {t.duration}</span>
              </span>
              <span className={styles.trackPlay}>
                <PlayIcon size={12} />
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
