// frontend/src/components/FestivalExplorer.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './MapView';
import FestivalSidebar from './FestivalSidebar';
import FestivalDetailModal from './FestivalDetailModal'; // <-- Import the detail modal

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

const FestivalExplorer = () => {
  const [festivals, setFestivals] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedFestival, setSelectedFestival] = useState(null); // <-- State for the modal

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const res = await api.get(`/festivals/${year}`);
        const festivalsWithDate = res.data.map(f => ({ ...f, accurate_date: f.accurate_date || new Date() }));
        setFestivals(festivalsWithDate);
      } catch (error) {
        console.error('Failed to fetch festivals', error);
      }
    };
    fetchFestivals();
  }, [year]);

  // This function will be called when a marker is clicked on the map
  const handleMarkerClick = (festival) => {
    setSelectedFestival(festival);
  };

  return (
    <div className="h-screen w-screen flex font-sans">
      {/* Sidebar */}
      <div className="w-1/3 max-w-sm h-full flex-shrink-0">
        <FestivalSidebar festivals={festivals} />
      </div>
      {/* Map View */}
      <div className="flex-grow h-full">
        <MapView festivals={festivals} onMarkerClick={handleMarkerClick} />
      </div>

      {/* Detail Modal */}
      <FestivalDetailModal
        festival={selectedFestival}
        onClose={() => setSelectedFestival(null)}
      />
    </div>
  );
};

export default FestivalExplorer;