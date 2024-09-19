// Map.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import marker icon images
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useCallback } from 'react'; 


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
  return (
    <Marker position={[article.lat, article.lon]} icon={greenIcon}>
      <Popup>
        <h3>{article.title}</h3>
        <div dangerouslySetInnerHTML={{ __html: article.summary }} />
        <button onClick={() => onReadMore(article)}>Read more</button>
      </Popup>
    </Marker>
  );
};

const MapComponent = ({ userLocation, onReadMore, onLocationFound, centerMap}) => {
  const map = useMap();
  const [wikiArticles, setWikiArticles] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true); 
  
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

  const fetchWikipediaArticles = async (bounds) => {
    const { _southWest, _northEast } = bounds;
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gscoord=${_northEast.lat}|${_southWest.lng}&gslimit=50&format=json&origin=*`;

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
        const summaryUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=${encodeURIComponent(article.title)}&format=json&origin=*`;
        const summaryResponse = await fetch(summaryUrl);
        const summaryData = await summaryResponse.json();
        const pages = summaryData.query.pages;
        const pageId = Object.keys(pages)[0];
        article.summary = pages[pageId].extract;
        return article;
      }));

      setWikiArticles(articlesWithSummaries);
    } catch (error) {
      console.error("Error fetching Wikipedia articles:", error);
    }
  };

  useMapEvents({
    moveend: () => {
      fetchWikipediaArticles(map.getBounds());
    },
  });

  return (
    <>
      {userLocation && <Marker position={userLocation} />}
      {wikiArticles.map((article, index) => (
        <WikipediaMarker key={index} article={article} onReadMore={onReadMore} />
      ))}
    </>
  );
};

const Map = ({ onReadMore, onLocationFound, centerMap }) => {
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
    <div style={{ height: 'calc(100vh - 200px)', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          />
          <MapComponent 
            userLocation={userLocation} 
            onReadMore={onReadMore} 
            onLocationFound={onLocationFound}
            centerMap={centerMap}
          />
        </MapContainer>
      )}
    </div>
  );
};

export default Map;