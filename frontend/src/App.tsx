import React, { useState, useEffect } from 'react';
import { BrowserRouter, HashRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import AppRoutes from './router';
import SetPinModal from './components/SetPinModal';
import DesktopUpdater from './components/DesktopUpdater';
import { usesHashRouter } from './config/appSurface';

function AppContent() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  useEffect(() => {
    // Check if PIN code is required
    if (location.pathname === '/login' || location.pathname === '/') {
      return;
    }

    if (token && user) {
      if (user.has_pin_code === false) {
        setIsPinModalOpen(true);
      }
    }
  }, [location.pathname, token, user]);

  return (
    <>
      <AppRoutes />
      <SetPinModal
        isOpen={isPinModalOpen}
        isClosable={true}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => setIsPinModalOpen(false)}
      />
      <DesktopUpdater />
    </>
  );
}

export default function App() {
  const Router = usesHashRouter ? HashRouter : BrowserRouter;

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
