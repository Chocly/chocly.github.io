import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChocolateDetailPage from './pages/ChocolateDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import BrowseAllPage from './pages/BrowseAllPage';
import SignUpForm from './components/auth/SignUpForm';
import LoginForm from './components/auth/LoginForm';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
        <Routes>
        <Route path="/" element={<HomePage />} />
              <Route path="/chocolate/:id" element={<ChocolateDetailPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/browse" element={<BrowseAllPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/login" element={<LoginForm />} />
        </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;