import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import Modal from 'react-modal';

// Correctly named imports
import FestivalDetailModal from './components/FestivalDetailModal';
import UserEventModal from './components/UserEventModal';
import FestivalFormModal from './components/FestivalFormModal'; 

import 'react-big-calendar/lib/css/react-big-calendar.css';

Modal.setAppElement('#root');
const localizer = momentLocalizer(moment);

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

const App = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date());

  // Consolidated state for all modals
  const [detailModalEvent, setDetailModalEvent] = useState(null);
  const [userEventModal, setUserEventModal] = useState({ isOpen: false, event: null });
  const [festivalFormModal, setFestivalFormModal] = useState({ isOpen: false, event: null });

  // Data Fetching Logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [festivalsRes, userEventsRes] = await Promise.all([
          api.get(`/festivals/${year}`),
          api.get(`/events/${year}`),
        ]);
        const formattedFestivals = festivalsRes.data.map((f) => ({ ...f, isUserEvent: false, start: new Date(f.accurate_date), end: new Date(f.accurate_date), title: f.event_name }));
        const formattedUserEvents = userEventsRes.data.map((e) => ({ ...e, isUserEvent: true, start: new Date(e.date), end: new Date(e.date) }));
        setAllEvents([...formattedFestivals, ...formattedUserEvents]);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, [year]);

  // --- CRUD Handlers ---

  const handleSaveFestival = async (festivalData) => {
    const endpoint = festivalData.id ? `/festivals/${festivalData.id}` : '/festivals/';
    const method = festivalData.id ? 'put' : 'post';
    try {
      const response = await api[method](endpoint, festivalData);
      const savedFestival = { ...response.data, isUserEvent: false, start: new Date(response.data.accurate_date), end: new Date(response.data.accurate_date), title: response.data.event_name };
      
      if (festivalData.id) { // Update
        setAllEvents(allEvents.map(e => (e.id === savedFestival.id && !e.isUserEvent) ? savedFestival : e));
      } else { // Create
        setAllEvents([...allEvents, savedFestival]);
      }
    } catch (error) {
      console.error("Failed to save festival:", error);
      alert("Error: Failed to save festival. The name may already exist.");
    }
  };

  const handleSaveUserEvent = async (eventData) => {
    try {
      if (eventData.id) { // Update
        const response = await api.put(`/events/${eventData.id}`, { title: eventData.title, date: eventData.date });
        setAllEvents(allEvents.map(e => (e.id === response.data.id && e.isUserEvent) ? { ...e, ...response.data, start: new Date(response.data.date), end: new Date(response.data.date) } : e));
      } else { // Create
        const response = await api.post('/events/', { title: eventData.title, date: eventData.date });
        setAllEvents([...allEvents, { ...response.data, isUserEvent: true, start: new Date(response.data.date), end: new Date(response.data.date) }]);
      }
    } catch (error) {
      console.error("Failed to save event", error);
    }
  };

  const handleDeleteEvent = async (event) => {
    const isUserEvent = event.isUserEvent;
    const alertMessage = isUserEvent ? 'Are you sure you want to delete this event?' : 'Are you sure you want to delete this FESTIVAL? This action is for all users.';
    
    if (window.confirm(alertMessage)) {
      const endpoint = isUserEvent ? `/events/${event.id}` : `/festivals/${event.id}`;
      try {
        await api.delete(endpoint);
        setAllEvents(allEvents.filter(e => !(e.id === event.id && e.isUserEvent === isUserEvent)));
        setDetailModalEvent(null);
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Error: Failed to delete the item.");
      }
    }
  };

  const handleSelectEvent = (event) => {
    setDetailModalEvent(event);
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
    if (newDate.getFullYear() !== year) {
      setYear(newDate.getFullYear());
    }
  };

  return (
    <div className="p-4 h-screen w-screen bg-gray-100 md:p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          FolkList {year}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFestivalFormModal({ isOpen: true, event: null })}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow"
          >
            Add Festival
          </button>
          <button
            onClick={() => setUserEventModal({ isOpen: true, event: null })}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow"
          >
            Add Event
          </button>
        </div>
      </div>
      <div className="h-[85vh] bg-white p-4 rounded-lg shadow-md text-gray-800">
        <Calendar
          localizer={localizer}
          events={allEvents}
          date={date}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => ({
            className: event.isUserEvent ? "bg-green-500 border-green-500" : "bg-blue-500 border-blue-500",
          })}
        />
      </div>

      <FestivalDetailModal
        event={detailModalEvent}
        onClose={() => setDetailModalEvent(null)}
        onEdit={(event) => {
          setDetailModalEvent(null);
          if (event.isUserEvent) {
            setUserEventModal({ isOpen: true, event });
          } else {
            setFestivalFormModal({ isOpen: true, event });
          }
        }}
        onDelete={handleDeleteEvent}
      />

      <UserEventModal
        isOpen={userEventModal.isOpen}
        onClose={() => setUserEventModal({ isOpen: false, event: null })}
        onSave={handleSaveUserEvent}
        event={userEventModal.event}
      />

      {/* --- THIS COMPONENT WAS MISSING FROM THE RENDERED JSX --- */}
      <FestivalFormModal
        isOpen={festivalFormModal.isOpen}
        onClose={() => setFestivalFormModal({ isOpen: false, event: null })}
        onSave={handleSaveFestival}
        event={festivalFormModal.event}
      />
    </div>
  );
};

export default App;