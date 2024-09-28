// ModernUI.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Map as MapIcon, Settings, Search, ArrowLeft, FileText, Route, X, User, LogIn, Crosshair } from 'lucide-react';
import Map from './Map'; // Import the Map component
import { useTranslation } from 'react-i18next';

const ModernUI = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isRouteCreatorOpen, setIsRouteCreatorOpen] = useState(false);
  const [isArticleCreatorOpen, setIsArticleCreatorOpen] = useState(false);
  const [waypoints, setWaypoints] = useState(['']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [userCredentials, setUserCredentials] = useState({ email: '', password: '' });
  const [newArticle, setNewArticle] = useState({ heading: '', location: '', description: '', content: '' });
  const [fullArticle, setFullArticle] = useState(null);
  const addMenuRef = useRef(null);
  
  const bgColor = isDarkMode 
    ? 'bg-gradient-to-br from-teal-900 to-green-950'
    : 'bg-gradient-to-br from-teal-400 to-green-700';

  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const inputBgColor = isDarkMode ? 'bg-gray-700' : 'bg-white bg-opacity-50';
  const buttonBgColor = isDarkMode ? 'bg-teal-700' : 'bg-teal-500';
  const buttonHoverColor = isDarkMode ? 'hover:bg-teal-600' : 'hover:bg-teal-400';
  const [currentLocation, setCurrentLocation] = useState(null);
  const [centerMap, setCenterMap] = useState(null);
  const [language, setLanguage] = useState(navigator.language.split('-')[0] || 'en'); // Standard-Sprache aus den Systemeinstellungen
  const { t, i18n } = useTranslation(); 
  const mapContainerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapClick = useCallback((e) => {
    // Verhindern Sie, dass der Klick auf die Karte den Vollbildmodus aktiviert
    e.stopPropagation();
  }, []);

  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage); // Change the language in i18next
  }, [i18n]);

  const handleLocationFound = useCallback((location) => {
    setCurrentLocation(location);
  }, []);

  const handleCenterMap = useCallback(() => {
    if (currentLocation) {
      setCenterMap([...currentLocation]); // Create a new array to trigger re-render
    }
  }, [currentLocation]);

  const handleSearch = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchSuggestions([]);
      return;
    }

    const url = `https://${language}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setSearchSuggestions(data[1].map((title, index) => ({
        title,
        description: data[2][index],
        link: data[3][index]
      })));
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
    }
  }, [language]);

  const handleSuggestionClick = useCallback(async (suggestion) => {
    const url = `https://${language}.wikipedia.org/w/api.php?action=query&prop=coordinates&titles=${encodeURIComponent(suggestion.title)}&format=json&origin=*`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      const coordinates = pages[pageId].coordinates[0];

      if (coordinates) {
        setSelectedLocation({
          lat: coordinates.lat,
          lon: coordinates.lon,
          title: suggestion.title
        });
        setCenterMap([coordinates.lat, coordinates.lon]);
      }
    } catch (error) {
      console.error("Error fetching location coordinates:", error);
    }
    setSearchQuery('');
    setSearchSuggestions([]);
  }, [language]);

  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.addEventListener('click', handleMapClick);
    }
    return () => {
      if (mapContainer) {
        mapContainer.removeEventListener('click', handleMapClick);
      }
    };
  }, [handleMapClick]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
        setIsAddMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const setVH = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
    };
  }, []);

  const handleReadMore = (article) => {
    setFullArticle(article);
    setCurrentPage('article');
  };

  const handleAddWaypoint = () => {
    setWaypoints([...waypoints, '']);
  };

  const handleWaypointChange = (index, value) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
  };

  const handleRemoveWaypoint = (index) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(newWaypoints);
  };

  const handleCredentialsChange = (field, value) => {
    setUserCredentials({ ...userCredentials, [field]: value });
  };

  const handleLogin = () => {
    console.log('Login attempt with:', userCredentials);
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleSignUp = () => {
    console.log('Sign up attempt with:', userCredentials);
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setUserCredentials({ email: '', password: '' });
  };

  const handleArticleChange = (field, value) => {
    setNewArticle({ ...newArticle, [field]: value });
  };

  const handleCreateArticle = () => {
    console.log('New article created:', newArticle);
    setIsArticleCreatorOpen(false);
    setNewArticle({ heading: '', location: '', description: '', content: '' });
  };

  const renderPage = () => {
    if (!isLoggedIn && currentPage === 'login') {
      return (
        <div className={`flex-1 flex flex-col justify-center items-center p-6 ${textColor}`}>
          <h2 className="text-2xl font-bold mb-4">{isSignUp ? t('createAccount') : t('login')}</h2>
          <div className="w-full max-w-md space-y-4">
            <input
              type="email"
              placeholder={t('email')}
              value={userCredentials.email}
              onChange={(e) => handleCredentialsChange('email', e.target.value)}
              className={`w-full py-2 px-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
            />
            <input
              type="password"
              placeholder={t('password')}
              value={userCredentials.password}
              onChange={(e) => handleCredentialsChange('password', e.target.value)}
              className={`w-full py-2 px-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
            />
            <button
              onClick={isSignUp ? handleSignUp : handleLogin}
              className={`w-full py-2 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300`}
            >
              {isSignUp ? t('signUp') : t('login')}
            </button>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className={`w-full py-2 ${inputBgColor} ${textColor} rounded-lg hover:bg-opacity-70 transition-colors duration-300`}
            >
              {isSignUp ? t('alreadyHaveAccount') : t('newUser')}
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
      case 'map':
        return (
          <div className="flex flex-col h-full">
            <div className={`${bgColor} p-4 relative z-10`}>
              <h2 className="text-2xl font-bold mb-4">{t('map')}</h2>
              <div className="flex items-center mb-4">
                <div className="flex-grow mr-2 relative">
                  <input
                    type="text"
                    placeholder={t('searchLocations')}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className={`w-full py-2 pl-10 pr-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
                  {searchSuggestions.length > 0 && (
                    <div className={`absolute z-20 w-full mt-1 ${inputBgColor} rounded-lg shadow-lg`}>
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`p-2 hover:bg-opacity-70 cursor-pointer ${index > 0 ? 'border-t border-gray-200' : ''}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="font-semibold">{suggestion.title}</div>
                          <div className="text-sm text-gray-500">{suggestion.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCenterMap}
                  className={`p-2 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300 flex items-center justify-center`}
                  title={t('focusOnCurrentLocation')}
                >
                  <Crosshair size={20} />
                </button>
              </div>
            </div>
            <div className="flex-grow relative z-0">
              <Map
                onReadMore={handleReadMore}
                onLocationFound={handleLocationFound}
                centerMap={centerMap}
                language={language}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        );
      case 'article':
        return (
          <div className={`flex-1 flex flex-col p-6 ${textColor} overflow-y-auto`}>
            <button
              onClick={() => setCurrentPage('map')}
              className={`mb-4 flex items-center ${buttonBgColor} ${textColor} px-4 py-2 rounded-lg ${buttonHoverColor} transition-colors duration-300`}
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Map
            </button>
            {fullArticle && (
              <>
                <h2 className="text-2xl font-bold mb-4">{fullArticle.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: fullArticle.summary }} />
              </>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className={`flex-1 flex flex-col p-6 ${textColor}`}>
            <h2 className="text-2xl font-bold mb-4">{t('settings')}</h2> {/* Übersetzung für "Settings" */}
            <div className={`${inputBgColor} p-4 rounded-lg mb-4`}>
              <h3 className="text-xl font-semibold mb-2">{t('userProfile')}</h3> {/* Übersetzung für "User Profile" */}
              <p>{t('email')}: {userCredentials.email}</p>
              <button
                onClick={handleLogout}
                className={`mt-2 py-2 px-4 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300`}
              >
                {t('logout')} {/* Übersetzung für "Logout" */}
              </button>
              <div className="mt-4">
                <p>{t('language')}:</p> {/* Übersetzung für "Language" */}
                <select onChange={(e) => handleLanguageChange(e.target.value)} value={language} className={`mt-2 py-2 px-4 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300`}>
                  <option value="en">{t('english')}</option> {/* Übersetzung für "English" */}
                  <option value="de">{t('german')}</option> {/* Übersetzung für "German" */}
                  <option value="fr">{t('french')}</option> {/* Übersetzung für "French" */}
                  {/* Weitere Sprachen hinzufügen */}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox text-teal-600" />
                <span>{t('enableNotifications')}</span> {/* Übersetzung für "Enable notifications" */}
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="form-checkbox text-teal-600" 
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode(!isDarkMode)}
                />
                <span>{t('darkMode')}</span> {/* Übersetzung für "Dark mode" */}
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen ${bgColor} flex flex-col`} style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      <div className="flex-grow overflow-hidden flex flex-col">
        {renderPage()}
      </div>
      {isLoggedIn && (
        <nav className={`${inputBgColor} backdrop-blur-lg p-4 flex-shrink-0`}>
          <div className="flex justify-around relative">
            <div ref={addMenuRef}>
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className={`p-2 rounded-full ${buttonBgColor} ${textColor} ${buttonHoverColor} transition-colors duration-300`}
              >
                <Plus size={24} />
              </button>
              
              {isAddMenuOpen && (
                <div className={`absolute bottom-full left-0 mb-2 p-2 ${inputBgColor} rounded-lg shadow-lg flex space-x-2`}>
                  <button
                    onClick={() => {
                      setIsArticleCreatorOpen(true);
                      setIsAddMenuOpen(false);
                    }}
                    className={`p-2 rounded-full ${buttonBgColor} ${textColor} ${buttonHoverColor} transition-colors duration-300`}
                  >
                    <FileText size={24} />
                  </button>
                  <button
                    onClick={() => {
                      setIsRouteCreatorOpen(true);
                      setIsAddMenuOpen(false);
                    }}
                    className={`p-2 rounded-full ${buttonBgColor} ${textColor} ${buttonHoverColor} transition-colors duration-300`}
                  >
                    <Route size={24} />
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setCurrentPage('home')}
              className={`p-2 rounded-full ${buttonBgColor} ${textColor} ${buttonHoverColor} transition-colors duration-300`}
            >
              <MapIcon size={24} />
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`p-2 rounded-full ${buttonBgColor} ${textColor} ${buttonHoverColor} transition-colors duration-300`}
            >
              <Settings size={24} />
            </button>
          </div>
        </nav>
      )}

      {isRouteCreatorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${inputBgColor} rounded-xl p-6 w-full max-w-md space-y-4`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${textColor}`}>Create New Route</h2>
              <button onClick={() => setIsRouteCreatorOpen(false)}>
                <X size={24} className={`${textColor} hover:text-gray-400`} />
              </button>
            </div>
            {waypoints.map((waypoint, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={waypoint}
                  onChange={(e) => handleWaypointChange(index, e.target.value)}
                  placeholder={`Waypoint ${index + 1}`}
                  className={`flex-1 py-2 px-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
                />
                {waypoints.length > 1 && (
                  <button onClick={() => handleRemoveWaypoint(index)} className={`${textColor} hover:text-gray-400`}>
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddWaypoint}
              className={`w-full py-2 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300`}
            >
              Add Waypoint
            </button>
            <button
              onClick={() => {
                console.log('Route created:', waypoints);
                setIsRouteCreatorOpen(false);
                setWaypoints(['']);
              }}
              className={`w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors duration-300`}
            >
              Create Route
            </button>
          </div>
        </div>
      )}

{isArticleCreatorOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className={`${inputBgColor} rounded-xl p-6 w-full max-w-md space-y-4`}>
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${textColor}`}>Create New Article</h2>
        <button onClick={() => setIsArticleCreatorOpen(false)}>
          <X size={24} className={`${textColor} hover:text-gray-400`} />
        </button>
      </div>
      <input
        type="text"
        value={newArticle.heading}
        onChange={(e) => handleArticleChange('heading', e.target.value)}
        placeholder="Heading"
        className={`w-full py-2 px-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
      />
      <input
        type="text"
        value={newArticle.location}
        onChange={(e) => handleArticleChange('location', e.target.value)}
        placeholder="Location"
        className={`w-full py-2 px-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
      />
      <textarea
        value={newArticle.description}
        onChange={(e) => handleArticleChange('description', e.target.value)}
        placeholder="Short Description"
        className={`w-full py-2 px-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
        rows={3}
      />
      <textarea
        value={newArticle.content}
        onChange={(e) => handleArticleChange('content', e.target.value)}
        placeholder="Article Content"
        className={`w-full py-2 px-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
        rows={6}
      />
      <button
        onClick={handleCreateArticle}
        className={`w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors duration-300`}
      >
        Create Article
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default ModernUI;