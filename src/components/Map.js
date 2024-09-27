// Map.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import marker icon images
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useCallback } from 'react'; 
import { useTranslation } from 'react-i18next'; 


// Set up the default icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Create a custom green icon for Wikipedia markers
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const WikipediaMarker = ({ article, onReadMore }) => {
  const { t } = useTranslation();

  return (
    <Marker position={[article.lat, article.lon]} icon={greenIcon}>
      <Popup>
        <h3>{article.title}</h3>
        <div dangerouslySetInnerHTML={{ __html: article.summary }} />
        <button onClick={() => onReadMore(article)}>{t('readMore')}</button>
      </Popup>
    </Marker>
  );
};

const MapComponent = ({ userLocation, onReadMore, onLocationFound, centerMap, language }) => {
  const map = useMap();
  const [wikiArticles, setWikiArticles] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { t } = useTranslation();
  
  useEffect(() => {
    if (centerMap) {
      map.setView(centerMap, 13);
    }
  }, [centerMap, map]);

  const focusUserLocation = useCallback(() => {
    if (userLocation) {
      map.setView(userLocation, 13);
      onLocationFound(userLocation);
    }
  }, [map, userLocation, onLocationFound]);

  useEffect(() => {
    if (userLocation && isInitialLoad) {
      focusUserLocation();
      setIsInitialLoad(false);
    }
  }, [userLocation, focusUserLocation, isInitialLoad]);

  const fetchWikipediaArticles = useCallback(async (bounds) => {
    const { _southWest, _northEast } = bounds;
    const url = `https://${language}.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gscoord=${(_southWest.lat + _northEast.lat) / 2}|${(_southWest.lng + _northEast.lng) / 2}&gslimit=50&format=json&origin=*&utf8=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const articles = data.query.geosearch.map(item => ({
        title: item.title,
        lat: item.lat,
        lon: item.lon,
        summary: ''
      }));

      const articlesWithSummaries = await Promise.all(articles.map(async (article) => {
        const summaryUrl = `https://${language}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=${encodeURIComponent(article.title)}&format=json&origin=*&utf8=1`;

        const summaryResponse = await fetch(summaryUrl);
        const summaryData = await summaryResponse.json();
        const pages = summaryData.query.pages;
        const pageId = Object.keys(pages)[0];
        article.summary = pages[pageId].extract;
        return article;
      }));

      setWikiArticles(prevArticles => {
        const newArticles = articlesWithSummaries.filter(
          newArticle => !prevArticles.some(prevArticle => prevArticle.title === newArticle.title)
        );
        return [...prevArticles, ...newArticles];
      });
    } catch (error) {
      console.error("Error fetching Wikipedia articles:", error);
    }
  }, [language]);

  const debouncedFetchArticles = useCallback(() => {
    let timeoutId;
    return (bounds) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fetchWikipediaArticles(bounds), 300);
    };
  }, [fetchWikipediaArticles]);

  const mapEvents = useMapEvents({
    moveend: () => {
      debouncedFetchArticles()(map.getBounds());
    },
    zoomend: () => {
      debouncedFetchArticles()(map.getBounds());
    },
  });

  useEffect(() => {
    if (map) {
      fetchWikipediaArticles(map.getBounds());
    }
  }, [language, map, fetchWikipediaArticles]);

  return (
    <>
      {userLocation && <Marker position={userLocation} />}
      {wikiArticles.map((article, index) => (
        <WikipediaMarker key={index} article={article} onReadMore={onReadMore} language={language} />
      ))}
    </>
  );
};

const Map = ({ onReadMore, onLocationFound, centerMap, language}) => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          onLocationFound(location);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, [onLocationFound]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapComponent 
            userLocation={userLocation} 
            onReadMore={onReadMore} 
            onLocationFound={onLocationFound}
            centerMap={centerMap}
            language={language}
          />
          <ZoomControl position="bottomright" />
        </MapContainer>
      )}
    </div>
  );
};

export default Map;