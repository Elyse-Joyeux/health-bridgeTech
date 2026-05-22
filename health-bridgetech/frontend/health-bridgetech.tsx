import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import './theme.module.css';
import { AuthProvider, useAuth } from './api/auth-context.js';
import { NotificationsProvider } from './api/notifications-context.js';
import { MusicProvider } from './api/music-context.js';
import { AppLayout } from './shell/layout.js';

import { LandingPage } from './pages/landing.js';
import { LoginPage } from './pages/login.js';
import { SignupPage } from './pages/signup.js';
import { ParentConsentPage } from './pages/parent-consent.js';
import { ParentVerifyPage } from './pages/parent-verify.js';
import { OnboardingPage } from './pages/onboarding.js';

import { DashboardPage } from './pages/dashboard.js';
import { CompanionPage } from './pages/companion.js';
import { ActivityPage } from './pages/activity.js';
import { ResourcesPage } from './pages/resources.js';
import { MeditationPage } from './pages/meditation.js';
import { CommunityPage } from './pages/community.js';
import { TherapyPage } from './pages/therapy.js';
import { ProfilePage } from './pages/profile.js';
import { SettingsPage } from './pages/settings.js';
import { MessagesPage } from './pages/messages.js';

/** Gate that redirects unauthenticated users to login */
function Protected({ children }: { children: ReactNode }) {
  const { user, loading, needsParentConsent, needsAssessment } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (needsParentConsent && location.pathname !== '/parent-consent') {
    return <Navigate to="/parent-consent" replace />;
  }
  if (needsAssessment && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

/** Wrap children in the app layout (sidebar + music bar) */
function Shell({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

/** Root component for the Health BridgeTech application */
export function HealthBridgetech() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <MusicProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/parent-verify" element={<ParentVerifyPage />} />
            <Route
              path="/parent-consent"
              element={
                <Protected>
                  <ParentConsentPage />
                </Protected>
              }
            />
            <Route
              path="/onboarding"
              element={
                <Protected>
                  <OnboardingPage />
                </Protected>
              }
            />

            <Route
              path="/dashboard"
              element={
                <Protected>
                  <Shell>
                    <DashboardPage />
                  </Shell>
                </Protected>
              }
            />
            <Route
              path="/companion"
              element={
                <Protected>
                  <Shell>
                    <CompanionPage />
                  </Shell>
                </Protected>
              }
            />
            <Route
              path="/activity"
              element={
                <Protected>
                  <Shell>
                    <ActivityPage />
                  </Shell>
                </Protected>
              }
            />
            <Route
              path="/resources"
              element={
                <Protected>
                  <Shell>
                    <ResourcesPage />
                  </Shell>
                </Protected>
              }
            />
            <Route
              path="/meditation"
              element={
                <Protected>
                  <Shell>
                    <MeditationPage />
                  </Shell>
                </Protected>
              }
            />
            <Route
              path="/community"
              element={
                <Protected>
                  <Shell>
                    <CommunityPage />
                  </Shell>
                </Protected>
              }
            />
            <Route
              path="/therapy"
              element={
                <Protected>
                  <Shell>
                    <TherapyPage />
                  </Shell>
                </Protected>
              }
            />
            <Route
              path="/profile"
              element={
                <Protected>
                  <Shell>
                    <ProfilePage />
                  </Shell>
                </Protected>
              }
            />
            <Route
              path="/settings"
              element={
                <Protected>
                  <Shell>
                    <SettingsPage />
                  </Shell>
                </Protected>
              }
            />
            <Route
              path="/messages"
              element={
                <Protected>
                  <Shell>
                    <MessagesPage />
                  </Shell>
                </Protected>
              }
            />
          </Routes>
        </MusicProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
