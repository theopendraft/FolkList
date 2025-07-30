// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import Modal from 'react-modal';

import DayEventsModal from './components/DayEventsModal';
import FestivalDetailModal from './components/FestivalDetailModal';
import UserEventModal from './components/UserEventModal'; // <-- Import the new modal

import 'react-big-calendar/lib/css/react-big-calendar.css';

Modal.setAppElement('#root');
const localizer = momentLocalizer(moment);

// Helper to create the API instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

const App = () => {
  // State Management
  const [festivals, setFestivals] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [combinedEvents, setCombinedEvents] = useState([]);

  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date());

  // Modal States
  const [dayModal, setDayModal] = useState({ isOpen: false, date: null, events: [] });
  const [detailModal, setDetailModal] = useState({ isOpen: false, event: null });
  const [userEventModal, setUserEventModal] = useState({ isOpen: false, event: null });

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [festivalsRes, userEventsRes] = await Promise.all([
          api.get(`/festivals/${year}`),
          api.get(`/events/${year}`),
        ]);

        const formattedFestivals = festivalsRes.data.map((f) => ({ ...f, type: 'festival', start: new Date(f.accurate_date), end: new Date(f.accurate_date), title: f.event_name }));
        const formattedUserEvents = userEventsRes.data.map((e) => ({ ...e, type: 'user', start: new Date(e.date), end: new Date(e.date) }));
        
        setFestivals(formattedFestivals);
        setUserEvents(formattedUserEvents);

      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, [year]);

  // Combine events whenever festivals or user events change
  useEffect(() => {
    setCombinedEvents([...festivals, ...userEvents]);
  }, [festivals, userEvents]);

  // CRUD Handlers
  const handleSaveUserEvent = async (eventData) => {
    try {
      if (userEventModal.event?.id) { // This is an update
        const response = await api.put(`/events/${userEventModal.event.id}`, eventData);
        setUserEvents(userEvents.map(e => e.id === response.data.id ? { ...e, ...response.data, start: new Date(response.data.date), end: new Date(response.data.date) } : e));
      } else { // This is a new event
        const response = await api.post('/events/', eventData);
        setUserEvents([...userEvents, { ...response.data, type: 'user', start: new Date(response.data.date), end: new Date(response.data.date) }]);
      }
    } catch (error) {
      console.error("Failed to save event", error);
    }
    setUserEventModal({ isOpen: false, event: null });
  };

  const handleDeleteUserEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        setUserEvents(userEvents.filter(e => e.id !== eventId));
        setDetailModal({ isOpen: false, event: null });
      } catch (error) {
        console.error("Failed to delete event", error);
      }
    }
  };

  // UI Interaction Handlers
  const handleSelectSlot = (slotInfo) => {
    // Open the "Add Event" modal when a date is clicked
    setUserEventModal({ isOpen: true, event: { date: slotInfo.start } });
  };

  const handleSelectEvent = (event) => {
    setDetailModal({ isOpen: true, event });
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
    if (newDate.getFullYear() !== year) {
      setYear(newDate.getFullYear());
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          FolkCal {year}
        </h1>
        <button 
          onClick={() => setUserEventModal({ isOpen: true, event: {date: new Date()} })}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow"
        >
          Add Event
        </button>
      </div>
      <div className="h-[85vh] bg-white p-4 rounded-lg shadow-md text-gray-800 ">
        <Calendar
          localizer={localizer}
          events={combinedEvents}
          date={date}
          onNavigate={handleNavigate}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => ({ // Style events differently
            className: event.type === 'user' ? 'bg-green-500 border-green-500' : 'bg-blue-500 border-blue-500',
          })}
        />
      </div>

      <FestivalDetailModal
        event={detailModal.event}
        onClose={() => setDetailModal({ isOpen: false, event: null })}
        onEdit={(event) => {
            setDetailModal({ isOpen: false, event: null });
            setUserEventModal({ isOpen: true, event });
        }}
        onDelete={handleDeleteUserEvent}
      />

      <UserEventModal
        isOpen={userEventModal.isOpen}
        onClose={() => setUserEventModal({ isOpen: false, event: null })}
        onSave={handleSaveUserEvent}
        event={userEventModal.event}
      />
    </div>
  );
};

export default App;