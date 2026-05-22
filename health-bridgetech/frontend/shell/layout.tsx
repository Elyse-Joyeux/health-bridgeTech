import type { ReactNode } from 'react';
import { Sidebar } from './sidebar.js';
import { MusicBar } from './music-bar.js';
import styles from './layout.module.css';

/** Outer application shell — sidebar pinned, only main content scrolls */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
          <footer className={styles.footer}>
            <span>&copy; 2026 Health BridgeTech. HIPAA Compliant &amp; Secure Data.</span>
            <div className={styles.footerLinks}>
              <span className={styles.footerLink}>Privacy Policy</span>
              <span className={styles.footerLink}>Terms of Service</span>
              <span className={styles.footerLink}>Security Architecture</span>
            </div>
          </footer>
        </div>
      </main>
      <MusicBar />
    </div>
  );
}
