import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
  const { token, logout } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingEvent, setEditingEvent] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });

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
          const formattedFestivals = festivalsRes.data.map((f) => ({ ...f, isUserEvent: false, date: f.accurate_date, title: f.event_name }));
          const formattedUserEvents = userEventsRes.data.map((e) => ({ ...e, isUserEvent: true }));
          setAllEvents([...formattedFestivals, ...formattedUserEvents]);
        } catch (error) {
          if (error.response && error.response.status === 401) logout();
        }
      };
      fetchData();
    }
  }, [year, token, secureApi, logout]);

  const sortedEvents = useMemo(() => {
    let sortableEvents = [...allEvents];
    if (sortConfig !== null) {
      sortableEvents.sort((a, b) => {
        let aValue = sortConfig.key === 'date' ? new Date(a.date) : a.title;
        let bValue = sortConfig.key === 'date' ? new Date(b.date) : b.title;
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableEvents;
  }, [allEvents, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (event) => setEditingEvent({ ...event });
  const handleCancel = () => setEditingEvent(null);

  const handleSave = async () => {
    const endpoint = editingEvent.isUserEvent ? `/events/${editingEvent.id}` : `/festivals/${editingEvent.id}`;
    const payload = editingEvent.isUserEvent 
      ? { title: editingEvent.title, date: editingEvent.date }
      : { 
          event_name: editingEvent.title,
          location: editingEvent.location,
          summary: editingEvent.summary,
          accurate_date: editingEvent.date
        };
    try {
      await secureApi.put(endpoint, payload);
      setAllEvents(allEvents.map(e => e.id === editingEvent.id && e.isUserEvent === editingEvent.isUserEvent ? editingEvent : e));
      setEditingEvent(null);
    } catch (error) {
      console.error("Failed to update event", error);
      alert("Failed to save changes.");
    }
  };
  
  const handleInputChange = (e, field) => {
    setEditingEvent({ ...editingEvent, [field]: e.target.value });
  };

  return (
    <div className="bg-gray-100 min-h-screen w-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Events Dashboard</h1>
          {/* --- Sorting Controls --- */}
          <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
            <span className="text-sm font-medium text-gray-600">Sort by:</span>
            <button onClick={() => requestSort('title')} className={`px-3 py-1 text-sm rounded-md ${sortConfig.key === 'title' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Name</button>
            <button onClick={() => requestSort('date')} className={`px-3 py-1 text-sm rounded-md ${sortConfig.key === 'date' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Date</button>
          </div>
        </div>

        {/* --- Responsive Card Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedEvents.map(event => (
            <div key={`${event.id}-${event.isUserEvent}`} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
              {editingEvent && editingEvent.id === event.id && editingEvent.isUserEvent === event.isUserEvent ? (
                // --- Editing State Card ---
                <div className="p-4 space-y-3">
                  <input type="text" value={editingEvent.title} onChange={(e) => handleInputChange(e, 'title')} className="form-input text-gray-500 text-lg font-bold w-full"/>
                  <input type="date" value={new Date(editingEvent.date).toISOString().split('T')[0]} onChange={(e) => handleInputChange(e, 'date')} className="form-input text-gray-500 w-full"/>
                  <input type="text" value={editingEvent.location || ''} onChange={(e) => handleInputChange(e, 'location')} disabled={event.isUserEvent} className="form-input text-gray-500  w-full disabled:bg-gray-200"/>
                  <textarea value={editingEvent.summary || ''} onChange={(e) => handleInputChange(e, 'summary')} disabled={event.isUserEvent} className="form-input text-gray-500 w-full disabled:bg-gray-200" rows="3"></textarea>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={handleSave} className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600">Save</button>
                    <button onClick={handleCancel} className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
                  </div>
                </div>
              ) : (
                // --- Display State Card ---
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${event.isUserEvent ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {event.isUserEvent ? 'Personal' : (event.type || 'Festival')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">🗓️ {new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">📍 {event.location || 'N/A'}</p>
                  <p className="text-sm text-gray-500 mt-2 h-16 overflow-hidden">{event.summary || 'No summary available.'}</p>
                  <div className="text-right mt-4">
                    <button onClick={() => handleEdit(event)} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium  hover:bg-blue-600 ">Edit</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;