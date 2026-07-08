'use client';
// First-session onboarding: seed the recommendation engine with real taste
// preferences before landing new members on the personalized home.
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import { updateUserPreferences } from '../../src/services/userService';
import { useToast } from '../../src/components/ui/Toast';
import './welcome.css';

const TYPES = ['Dark', 'Milk', 'White', 'Dark Milk', 'Ruby', 'Flavored'];
const FLAVORS = ['Fruity', 'Nutty', 'Floral', 'Caramel', 'Earthy', 'Spicy', 'Coffee', 'Berry', 'Creamy', 'Citrus'];

export default function WelcomeClient() {
  const { currentUser, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [favoriteTypes, setFavoriteTypes] = useState([]);
  const [flavorPreferences, setFlavorPreferences] = useState([]);
  const [saving, setSaving] = useState(false);

  // Redirect must happen after render, never during it
  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/auth');
    }
  }, [loading, currentUser, router]);

  if (!currentUser) {
    return null;
  }

  const toggle = (list, setList, value) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const finish = async (skip = false) => {
    if (skip || !currentUser) {
      router.replace('/');
      return;
    }
    setSaving(true);
    try {
      await updateUserPreferences(currentUser.uid, {
        favoriteTypes,
        flavorPreferences,
        dietaryRestrictions: [],
      });
      await refreshProfile();
      toast.success("You're all set — your home page is now personalized!");
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Couldn't save preferences — you can set them anytime from your profile.");
    } finally {
      setSaving(false);
      router.replace('/');
    }
  };

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-emoji" aria-hidden="true">🍫</div>
        <h1>Welcome to Chocly!</h1>
        <p className="welcome-sub">
          Two quick questions so we can point you at chocolate you&apos;ll love.
        </p>

        <section className="welcome-section">
          <h2>Which styles do you enjoy?</h2>
          <div className="welcome-pills" role="group" aria-label="Favorite chocolate types">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`welcome-pill ${favoriteTypes.includes(t) ? 'selected' : ''}`}
                aria-pressed={favoriteTypes.includes(t)}
                onClick={() => toggle(favoriteTypes, setFavoriteTypes, t)}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="welcome-section">
          <h2>Flavors you gravitate toward?</h2>
          <div className="welcome-pills" role="group" aria-label="Flavor preferences">
            {FLAVORS.map((f) => (
              <button
                key={f}
                type="button"
                className={`welcome-pill ${flavorPreferences.includes(f) ? 'selected' : ''}`}
                aria-pressed={flavorPreferences.includes(f)}
                onClick={() => toggle(flavorPreferences, setFlavorPreferences, f)}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        <div className="welcome-actions">
          <button
            className="welcome-primary"
            onClick={() => finish(false)}
            disabled={saving || (favoriteTypes.length === 0 && flavorPreferences.length === 0)}
          >
            {saving ? 'Saving…' : 'Start exploring'}
          </button>
          <button className="welcome-skip" onClick={() => finish(true)} disabled={saving}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
