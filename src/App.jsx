// Modified src/App.jsx - Complete version with add chocolate route
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChocolateDetailPage from './pages/ChocolateDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import BrowseAllPage from './pages/BrowseAllPage';
import BarcodeSearchPage from './pages/BarcodeSearchPage';
import CategoryPage from './pages/CategoryPage';
import MakerPage from './pages/MakerPage';
import AddChocolatePage from './pages/AddChocolatePage'; // Add this import
import UnifiedAuthPage from './components/auth/UnifiedAuthPage';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BatchImageUploadPage from './pages/BatchImageUploadPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import './App.css';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
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
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/batch-upload" element={<BatchImageUploadPage />} />
              <Route path="/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/maker" element={<MakerPage />} />
              <Route path="/maker/:makerName" element={<MakerPage />} />
              {/* New Add Chocolate Route */}
              <Route path="/add-chocolate" element={<AddChocolatePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;