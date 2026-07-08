'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from './ui/Toast';
import Header from './HeaderClient';
import Footer from './FooterClient';
import ScrollToTop from './ScrollToTopClient';

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Header />
        <main className="main-content" id="main-content">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </ToastProvider>
    </AuthProvider>
  );
}
