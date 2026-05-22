import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api } from './client.js';
import type { Track } from './types.js';

type MusicState = {
  tracks: Track[];
  current: Track | null;
  playing: boolean;
  volume: number;
  play: (track: Track) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
};

const MusicContext = createContext<MusicState | null>(null);

/** Audio player provider — drives a single hidden audio element used by all pages */
export function MusicProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.6);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    api<Track[]>('/api/music', { auth: false }).then(setTracks).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.loop = true;
      a.volume = volume;
      audioRef.current = a;
    }
  }, [volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  const play = useCallback((track: Track) => {
    const a = audioRef.current;
    if (!a) return;
    if (current?.id !== track.id) {
      a.src = track.url;
      setCurrent(track);
    }
    a.play().catch(() => undefined);
    setPlaying(true);
  }, [current]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().catch(() => undefined);
      setPlaying(true);
    }
  }, [playing, current]);

  const next = useCallback(() => {
    if (!tracks.length || !current) return;
    const i = tracks.findIndex((t) => t.id === current.id);
    play(tracks[(i + 1) % tracks.length]);
  }, [tracks, current, play]);

  const prev = useCallback(() => {
    if (!tracks.length || !current) return;
    const i = tracks.findIndex((t) => t.id === current.id);
    play(tracks[(i - 1 + tracks.length) % tracks.length]);
  }, [tracks, current, play]);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setPlaying(false);
    setCurrent(null);
  }, []);

  const setVolume = useCallback((v: number) => setVolumeState(Math.max(0, Math.min(1, v))), []);

  const value = useMemo<MusicState>(
    () => ({ tracks, current, playing, volume, play, toggle, next, prev, stop, setVolume }),
    [tracks, current, playing, volume, play, toggle, next, prev, stop, setVolume],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

/** Hook for accessing the music player */
export function useMusic(): MusicState {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
