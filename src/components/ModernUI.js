// ModernUI.js
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Map as MapIcon, Settings, Search, ArrowLeft, FileText, Route, X, User, LogIn, Crosshair } from 'lucide-react';
import Map from './Map'; // Import the Map component
import { useCallback } from 'react'; 

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

  const handleLocationFound = useCallback((location) => {
    setCurrentLocation(location);
  }, []);

  const handleCenterMap = useCallback(() => {
    if (currentLocation) {
      setCenterMap([...currentLocation]); // Create a new array to trigger re-render
    }
  }, [currentLocation]);

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
          <h2 className="text-2xl font-bold mb-4">{isSignUp ? 'Create Account' : 'Login'}</h2>
          <div className="w-full max-w-md space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={userCredentials.email}
              onChange={(e) => handleCredentialsChange('email', e.target.value)}
              className={`w-full py-2 px-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
            />
            <input
              type="password"
              placeholder="Password"
              value={userCredentials.password}
              onChange={(e) => handleCredentialsChange('password', e.target.value)}
              className={`w-full py-2 px-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
            />
            <button
              onClick={isSignUp ? handleSignUp : handleLogin}
              className={`w-full py-2 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300`}
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className={`w-full py-2 ${inputBgColor} ${textColor} rounded-lg hover:bg-opacity-70 transition-colors duration-300`}
            >
              {isSignUp ? 'Already have an account? Login' : 'New user? Create account'}
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
      case 'map':
        return (
          <div className={`flex-1 flex flex-col p-6 ${textColor}`}>
            <h2 className="text-2xl font-bold mb-4">Map</h2>
            <div className="relative flex-1 flex flex-col">
              <div className="mb-4 flex items-center">
                <div className="flex-grow mr-2">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    className={`w-full py-2 pl-10 pr-4 ${inputBgColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all duration-300`}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
                <button
                  onClick={handleCenterMap}
                  className={`p-2 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300 flex items-center justify-center`}
                  title="Focus on current location"
                >
                  <Crosshair size={20} />
                </button>
              </div>
              <div className="flex-1 relative">
                <Map 
                  onReadMore={handleReadMore} 
                  onLocationFound={handleLocationFound}
                  centerMap={centerMap}
                />
              </div>
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
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className={`${inputBgColor} p-4 rounded-lg mb-4`}>
              <h3 className="text-xl font-semibold mb-2">User Profile</h3>
              <p>Email: {userCredentials.email}</p>
              <button
                onClick={handleLogout}
                className={`mt-2 py-2 px-4 ${buttonBgColor} ${textColor} rounded-lg ${buttonHoverColor} transition-colors duration-300`}
              >
                Logout
              </button>
            </div>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox text-teal-600" />
                <span>Enable notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="form-checkbox text-teal-600" 
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode(!isDarkMode)}
                />
                <span>Dark mode</span>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen ${bgColor} flex flex-col`}>
      <div className="flex-1 overflow-y-hidden flex flex-col">
        {renderPage()}
      </div>
      {isLoggedIn && (
        <nav className={`${inputBgColor} backdrop-blur-lg p-4`}>
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