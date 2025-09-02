import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getFeaturedChocolates } from '../services/chocolateFirebaseService';
import heroBackground from '../assets/Gemini hero image.png';
import cacaoFarmer from '../assets/gemini cacao farmer.png';  // Import the new image
import choclyIcon from '../assets/CHOCLY icon B8693D.png';  // Add this line
import './HomePage-new.css';

const HomePage = () => {
  const [featuredChocolates, setFeaturedChocolates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // TEST: Check Firebase connection
  useEffect(() => {
    const testFirebase = async () => {
      console.log('🔥 Testing Firebase connection...');
      try {
        // Direct Firebase query
        const testQuery = query(
          collection(db, 'chocolates'),
          limit(3)
        );
        const snapshot = await getDocs(testQuery);
        console.log('📊 Firebase test results:');
        console.log('- Documents found:', snapshot.size);
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`- Chocolate ${index + 1}:`, {
            id: doc.id,
            name: data.name,
            imageUrl: data.imageUrl,
            hasImage: !!data.imageUrl,
            imageType: typeof data.imageUrl
          });
        });
      } catch (error) {
        console.error('🚨 Firebase test failed:', error);
      }
    };
    
    testFirebase();
  }, []);

  useEffect(() => {
    fetchFeaturedChocolates();
  }, []);

  const fetchFeaturedChocolates = async () => {
    try {
      console.log('🍫 Starting to fetch chocolates...');
      
      // Try using getFeaturedChocolates from your service
      const allChocolates = await getFeaturedChocolates(20);
      console.log('📦 Raw chocolates from Firebase:', allChocolates);
      
      if (allChocolates && allChocolates.length > 0) {
        // Filter for chocolates with Firebase Storage images (these work reliably)
        const chocolatesWithGoodImages = allChocolates.filter(choc => 
          choc.imageUrl && 
          (choc.imageUrl.includes('firebasestorage.googleapis.com') || 
           choc.imageUrl.includes('firebase'))
        );
        
        console.log(`Found ${chocolatesWithGoodImages.length} chocolates with Firebase images`);
        
        // If we have enough with good images, use those
        let finalChocolates;
        if (chocolatesWithGoodImages.length >= 3) {
          finalChocolates = chocolatesWithGoodImages.slice(0, 3);
        } else {
          // Mix Firebase images with others, but Firebase first
          const othersWithImages = allChocolates.filter(choc => 
            choc.imageUrl && 
            !choc.imageUrl.includes('firebasestorage.googleapis.com')
          );
          finalChocolates = [...chocolatesWithGoodImages, ...othersWithImages].slice(0, 3);
        }
        
        // Add descriptions if missing
        finalChocolates = finalChocolates.map(choc => ({
          ...choc,
          description: choc.description || 
            `"Experience the unique taste of ${choc.name} from ${choc.maker}."`
        }));
        
        console.log('✅ Final chocolates to display:', finalChocolates);
        setFeaturedChocolates(finalChocolates);
      } else {
        console.log('⚠️ No chocolates found in database');
        setFeaturedChocolates(getFallbackChocolates());
      }
    } catch (error) {
      console.error('❌ Error fetching chocolates:', error);
      setFeaturedChocolates(getFallbackChocolates());
    }
  };

  // Fallback chocolates with placeholder images
  const getFallbackChocolates = () => [
    {
      id: '1',
      name: 'Hazelnut Butter',
      maker: 'Blue Stripes',
      description: '"Experience the unique taste of Hazelnut Butter from Blue Stripes."',
      imageUrl: '/placeholder-chocolate.jpg',
      cacaoPercentage: 72
    },
    {
      id: '2',
      name: 'Dark Chocolate Bar w/Sea Salt & Almonds',
      maker: 'Endangered Species',
      description: '"Experience the unique taste of Dark Chocolate Bar w/Sea Salt & Almonds from Endangered Species."',
      imageUrl: '/placeholder-chocolate.jpg',
      cacaoPercentage: 45
    },
    {
      id: '3',
      name: 'Sourdough & Sea Salt',
      maker: 'Pump Street',
      description: '"A unique combination of our two signature products: dark chocolate and sourdough."',
      imageUrl: '/placeholder-chocolate.jpg',
      cacaoPercentage: 70
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="homepage-new">
      {/* Hero Section */}
      <section className="hero-section-new" style={{ backgroundImage: `url(${heroBackground})` }}>
        <div className="hero-content-new">
          <h1 className="hero-title-new">
            indulge<br />
            better.
          </h1>
          <p className="hero-subtitle-new">
            Explore new flavors, share reviews, and discover<br />
            your next obsession.
          </p>
          <form onSubmit={handleSearch} className="hero-search-new">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-new"
            />
            <button type="submit" className="search-icon-new">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </form>
        </div>
        
        {/* Wave transition */}
        <div className="wave-transition">
          <svg viewBox="0 0 1440 150" preserveAspectRatio="none">
            {/* Removed stroke for cleaner transition */}
            <path 
              d="M0,60 C360,120 720,20 1080,80 C1260,110 1380,90 1440,60 L1440,150 L0,150 Z" 
              fill="#F9EBCC"
            />
          </svg>
        </div>
      </section>

      {/* Today's Treats Section */}
      <section className="treats-section-new">
        <div className="container">
          <h2 className="section-title-new">Today's treats</h2>
          <div className="treats-grid-new">
            {featuredChocolates.map((chocolate) => (
              <Link to={`/chocolate/${chocolate.id}`} key={chocolate.id} className="treat-card-new">
                <div className="treat-image-wrapper-new">
                  <div className="treat-image-circle-new">
                    <img 
                      src={chocolate.imageUrl} 
                      alt={chocolate.name}
                      loading="lazy"
                      onError={(e) => {
                        console.error(`❌ Failed to load image for ${chocolate.name}:`, {
                          url: chocolate.imageUrl,
                          isFirebase: chocolate.imageUrl?.includes('firebasestorage'),
                          isOpenFood: chocolate.imageUrl?.includes('openfoodfacts')
                        });
                      }}
                      onLoad={(e) => {
                        console.log(`✅ Successfully loaded image for ${chocolate.name}`);
                      }}
                    />
                  </div>
                </div>
                <h3 className="treat-name-new">
                  {chocolate.maker} {chocolate.name}
                </h3>
                <p className="treat-description-new">{chocolate.description}</p>
              </Link>
            ))}
          </div>
          
          {/* View All Button */}
          <div className="view-all-container">
            <Link to="/browse" className="btn-view-all">View all</Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-new">
        <div className="container">
          <h2 className="section-title-new white">How it works</h2>
          <div className="steps-grid-new">
            <div className="step-new">
              <div className="step-icon-new">
              <img src={choclyIcon} alt="Discover" style={{width: '50px', height: '50px'}} />
              </div>
              <h3>Discover</h3>
              <p>Explore our extensive chocolate database and find chocolates based on origin, flavor profile, or maker</p>
            </div>
            <div className="step-new">
              <div className="step-icon-new">
              <img src={choclyIcon} alt="Connect" style={{width: '50px', height: '50px'}} />
              </div>
              <h3>Taste & Rate</h3>
              <p>Develop your palate by tasting and rating chocolates, tracking your personal chocolate journey</p>
            </div>
            <div className="step-new">
              <div className="step-icon-new">
              <img src={choclyIcon} alt="Taste & Rate" style={{width: '50px', height: '50px'}} />
              </div>
              <h3>Connect</h3>
              <p>Share recommendations, follow fellow chocolate lovers, and join tasting events in your area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Community Section */}
      <section className="join-section-new">
        <div className="container">
          <div className="join-content-new">
            <div className="join-image-new">
              <img src={cacaoFarmer} alt="Cacao farmer" />
            </div>
            <div className="join-text-new">
              <h2 className="join-title-new">Join the<br />community</h2>
              <Link to="/signup" className="btn-join-new">Create account</Link>
              <p className="signin-link-new">
                Already have an account? <Link to="/signin">click here to sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;