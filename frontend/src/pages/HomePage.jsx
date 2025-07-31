import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import Modal from 'react-modal';

import FestivalDetailModal from '../components/FestivalDetailModal';
import UserEventModal from '../components/UserEventModal';
import FestivalFormModal from '../components/FestivalFormModal';
import DayEventsModal from '../components/DayEventsModal';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

Modal.setAppElement('#root');
const localizer = momentLocalizer(moment);

const HomePage = () => {
  const { token, logout } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date());

  const [dayModal, setDayModal] = useState({ isOpen: false, date: null, events: [] });
  const [detailModalEvent, setDetailModalEvent] = useState(null);
  const [userEventModal, setUserEventModal] = useState({ isOpen: false, event: null });
  const [festivalFormModal, setFestivalFormModal] = useState({ isOpen: false, event: null });

  const secureApi = useMemo(() => {
    return axios.create({
      baseURL: 'http://127.0.0.1:8000',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    });
  }, [token]);

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const [festivalsRes, userEventsRes] = await Promise.all([
            secureApi.get(`/festivals/${year}`),
            secureApi.get(`/events/${year}`),
          ]);
          const formattedFestivals = festivalsRes.data.map((f) => ({ ...f, isUserEvent: false, start: new Date(f.accurate_date), end: new Date(f.accurate_date), title: f.event_name }));
          const formattedUserEvents = userEventsRes.data.map((e) => ({ ...e, isUserEvent: true, start: new Date(e.date), end: new Date(e.date) }));
          setAllEvents([...formattedFestivals, ...formattedUserEvents]);
        } catch (error) {
          if (error.response?.status === 401) logout();
        }
      };
      fetchData();
    }
  }, [year, token, secureApi, logout]);

  // --- THIS FUNCTION IS NOW CORRECTED ---
  const handleSaveFestival = async (festivalData) => {
    const endpoint = festivalData.id ? `/festivals/${festivalData.id}` : '/festivals/';
    const method = festivalData.id ? 'put' : 'post';
    const payload = {
      event_name: festivalData.event_name, location: festivalData.location,
      accurate_date: festivalData.accurate_date, time: festivalData.time || null,
      type: festivalData.type, summary: festivalData.summary, hook_intro: festivalData.hook_intro
    };
    try {
      const response = await secureApi[method](endpoint, payload);
      const savedFestival = { ...response.data, isUserEvent: false, start: new Date(response.data.accurate_date), end: new Date(response.data.accurate_date), title: response.data.event_name };
      
      if (festivalData.id) { // Update
        setAllEvents(prevEvents => prevEvents.map(e => (e.id === savedFestival.id && !e.isUserEvent) ? savedFestival : e));
      } else { // Create
        setAllEvents(prevEvents => [...prevEvents, savedFestival]);
      }
    } catch (error) {
      if (error.response?.data?.detail) alert(`Error: ${error.response.data.detail}`);
      else alert("An unexpected error occurred.");
    }
  };

  // --- THIS FUNCTION IS NOW CORRECTED ---
  const handleSaveUserEvent = async (eventData) => {
    const endpoint = eventData.id ? `/events/${eventData.id}` : '/events/';
    const method = eventData.id ? 'put' : 'post';
    try {
      const response = await secureApi[method](endpoint, { title: eventData.title, date: eventData.date });
      const savedEvent = { ...response.data, isUserEvent: true, start: new Date(response.data.date), end: new Date(response.data.date), title: response.data.title }; // Ensure title is included
      
      if (eventData.id) { // Update
        setAllEvents(prevEvents => prevEvents.map(e => (e.id === savedEvent.id && e.isUserEvent) ? savedEvent : e));
      } else { // Create
        setAllEvents(prevEvents => [...prevEvents, savedEvent]);
      }
    } catch (error) {
      alert("Failed to save event.");
    }
  };

  const handleDeleteEvent = async (event) => {
    const isUserEvent = event.isUserEvent;
    const alertMessage = isUserEvent ? 'Are you sure you want to delete this event?' : 'Are you sure you want to delete this FESTIVAL?';
    if (window.confirm(alertMessage)) {
      const endpoint = isUserEvent ? `/events/${event.id}` : `/festivals/${event.id}`;
      try {
        await secureApi.delete(endpoint);
        setAllEvents(prevEvents => prevEvents.filter(e => !(e.id === event.id && e.isUserEvent === isUserEvent)));
        setDetailModalEvent(null);
      } catch (error) {
        alert("Error: Failed to delete the item.");
      }
    }
  };

  const handleSelectSlot = (slotInfo) => {
    const clickedDateStr = moment(slotInfo.start).format('YYYY-MM-DD');
    const eventsOnDate = allEvents.filter(e => moment(e.start).format('YYYY-MM-DD') === clickedDateStr);
    if (eventsOnDate.length > 0) {
      setDayModal({ isOpen: true, date: slotInfo.start, events: eventsOnDate });
    }
  };
      
  const handleSelectEvent = (event) => {
      setDayModal({isOpen: false, date: null, events:[]});
      setDetailModalEvent(event);
  };

  const handleNavigate = (newDate) => { setDate(newDate); if (newDate.getFullYear() !== year) { setYear(newDate.getFullYear()) } };

  return (
    <div className=" min-h-screen w-screen overflow-y-auto overflow-x-hidden top-0 right-0 left-0 outline-none focus:outline-none bg-gray-100 font-sans">
      <Navbar />  
      <main className="flex-grow p-4 md:p-4  font-sans bg-gray-100 max-w-7xl mx-auto">
        {" "}
        <div className=" mb-2 gap-2 w-full flex justify-between items-center ">
          <button
            onClick={() => setFestivalFormModal({ isOpen: true, event: null })}
            className="px-2 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow w-1/2"
          >
            Add Festival
          </button>
          <button
            onClick={() => setUserEventModal({ isOpen: true, event: null })}
            className="px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 shadow ml-2 w-1/2 z"
          >
            Add Event
          </button>
        </div>
        <div className="h-[85vh] bg-white p-4 rounded-lg shadow-md text-gray-700">
          <Calendar
            localizer={localizer}
            events={allEvents}
            date={date}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            selectable={true}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={(event) => ({
              className: event.isUserEvent ? 'bg-green-500 border-green-500' : 'bg-blue-500 border-blue-500',
            })}
          />
        </div>

        <DayEventsModal
          isOpen={dayModal.isOpen}
          onClose={() => setDayModal({ isOpen: false, date: null, events: [] })}
          date={dayModal.date}
          events={dayModal.events}
          onSelectEvent={handleSelectEvent}
        />

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
        
        <FestivalFormModal
          isOpen={festivalFormModal.isOpen}
          onClose={() => setFestivalFormModal({ isOpen: false, event: null })}
          onSave={handleSaveFestival}
          event={festivalFormModal.event}
        />
      </main>
    </div>
  );
};

export default HomePage;