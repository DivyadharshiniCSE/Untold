import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import HomePage from '@/pages/HomePage';
import StoriesPage from '@/pages/StoriesPage';
import StoryReaderPage from '@/pages/StoryReaderPage';
import StudioLogin from '@/pages/StudioLogin';
import StudioDashboard from '@/pages/StudioDashboard';
import CustomCursor from '@/components/CustomCursor';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0908' }}>
        <p className="font-serif text-2xl text-ivory-400 animate-pulse">Loading...</p>
      </div>
    );
  }
  if (!session) return <Navigate to="/story-studio" replace />;
  return <>{children}</>;
}

import DDOrb from '@/components/DDOrb';

function PublicLayout() {
  return (
    <>
      <CustomCursor />
      <DDOrb />
      <div className="grain-overlay" />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/stories/:slug" element={<StoryReaderPage />} />
            <Route path="/story-studio" element={<StudioLogin />} />
            <Route
              path="/studio"
              element={
                <ProtectedRoute>
                  <StudioDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
