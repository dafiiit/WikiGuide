import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Map as MapIcon, Settings, Search, ArrowLeft, User, LogIn, Crosshair, Download } from 'lucide-react';
import Map from './Map'; // Import the Map component
import { useTranslation } from 'react-i18next';

const ModernUI = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [userCredentials, setUserCredentials] = useState({ email: '', password: '' });
  
  //Farben
  const bgColor = isDarkMode 
    ? 'bg-gradient-to-br from-black to-[#02451b]'
    : 'bg-gradient-to-br from-[#23ff38] to-[#02451b]';
  const textColor = isDarkMode ? 'text-white' : 'text-black';
  const inputBgColor = isDarkMode ? 'bg-green-700' : 'bg-white bg-opacity-60';
  const BoxOverlayColor = isDarkMode ? 'bg-green-700' : 'bg-white bg-opacity-80';
  const MapLowBarColor = isDarkMode ? 'bg-green-800 bg-opacity-50' : 'bg-black bg-opacity-20';
  const buttonBgColor = isDarkMode ? 'bg-green-700' : 'bg-green-500';
  const buttonHoverColor = isDarkMode ? 'hover:bg-green-600' : 'hover:bg-green-400';

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

  // Initialisiere die Sprache beim Laden der Komponente
  useEffect(() => {
    i18n.changeLanguage(language);
  }, []);

  // Ändere die Sprache, wenn sich die language-Variable ändert
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
  }, []);

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

  const handleDownload = () => {
    console.log('Download button clicked');
    // Implement download functionality here
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
              className={`w-full py-2 px-4 ${inputBgColor} ${textColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-300`}
            />
            <input
              type="password"
              placeholder={t('password')}
              value={userCredentials.password}
              onChange={(e) => handleCredentialsChange('password', e.target.value)}
              className={`w-full py-2 px-4 ${inputBgColor} ${textColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-300`}
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
            <div className={`${bgColor} p-4 relative z-10 ${textColor}` }>
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
                    className={`w-full py-2 pl-10 pr-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-300`}
                  />
                  <Search className={`absolute left-3 top-2.5 ${textColor}`} size={20} />
                  {searchSuggestions.length > 0 && (
                    <div className={`absolute z-20 w-full mt-1 ${BoxOverlayColor} rounded-lg shadow-lg`}>
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
                onLocationFound={handleLocationFound}
                centerMap={centerMap}
                language={language}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className={`flex-1 flex flex-col p-6 ${textColor}`}>
            <h2 className="text-2xl font-bold mb-4">{t('settings')}</h2>
            <div className={`${inputBgColor} p-4 rounded-lg mb-4`}>
              <h3 className="text-xl font-semibold mb-2">{t('userProfile')}</h3>
              <p className={textColor}>{t('email')}: {userCredentials.email}</p>
              <button
                onClick={handleLogout}
                className={`mt-2 py-2 px-4 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300`}
              >
                {t('logout')}
              </button>
              <div className="mt-4">
                <p>{t('language')}:</p>
                <select onChange={(e) => handleLanguageChange(e.target.value)} value={language} className={`mt-2 py-2 px-4 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300`}>
                  <option value="en">{t('english')}</option>
                  <option value="de">{t('german')}</option>
                  <option value="fr">{t('french')}</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox text-teal-600" />
                <span>{t('enableNotifications')}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="form-checkbox text-teal-600" 
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode(!isDarkMode)}
                />
                <span>{t('darkMode')}</span>
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
        <nav className={`${MapLowBarColor} backdrop-blur-lg p-4 flex-shrink-0`}>
          <div className="flex justify-around relative">
            <button
              onClick={handleDownload}
              className={`p-2 rounded-full ${buttonBgColor} ${textColor} ${buttonHoverColor} transition-colors duration-300`}
            >
              <Download size={24} />
            </button>
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
    </div>
  );
};

export default ModernUI;