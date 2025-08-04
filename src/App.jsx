// src/App.jsx - Updated with category routes
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChocolateDetailPage from './pages/ChocolateDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import BrowseAllPage from './pages/BrowseAllPage';
import BarcodeSearchPage from './pages/BarcodeSearchPage';
import CategoryPage from './pages/CategoryPage';
import CategoryLandingPage from './pages/CategoryLandingPage'; // NEW
import MakerPage from './pages/MakerPage';
import AddChocolatePage from './pages/AddChocolatePage';
import UnifiedAuthPage from './components/auth/UnifiedAuthPage';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import BatchImageUploadPage from './pages/BatchImageUploadPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SuperAdminEditPage from './pages/SuperAdminEditPage';
import './App.css';

function App() {
  // Get the base URL for GitHub Pages
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chocolate/:id" element={<ChocolateDetailPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/browse" element={<BrowseAllPage />} />
              <Route path="/barcode" element={<BarcodeSearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/auth" element={<UnifiedAuthPage />} />
              <Route path="/login" element={<UnifiedAuthPage />} />
              <Route path="/signup" element={<UnifiedAuthPage />} />
              <Route path="/category" element={<CategoryPage />} />
              <Route path="/chocolate/:id/edit" element={<SuperAdminEditPage />} />
              {/* NEW: Category Landing Pages */}
              <Route path="/category/:categoryType/:categoryValue" element={<CategoryLandingPage />} />
              
              <Route path="/maker" element={<MakerPage />} />
              <Route path="/add-chocolate" element={<AddChocolatePage />} />
              <Route path="/batch-upload" element={<BatchImageUploadPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;