import React from 'react';
import Modal from 'react-modal';

const DayEventsModal = ({ isOpen, onClose, events, date, onSelectEvent }) => {
  const formattedDate = date 
    ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 outline-none"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Events for {formattedDate}</h3>
      <ul className="divide-y divide-gray-200">
        {events.map((event) => (
          <li
            key={`${event.id}-${event.isUserEvent}`}
            onClick={() => onSelectEvent(event)}
            className="py-3 px-2 -mx-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
          >
            <span className={`font-semibold ${event.isUserEvent ? 'text-green-700' : 'text-blue-700'}`}>
              {event.title}
            </span>
          </li>
        ))}
      </ul>
      <button
        onClick={onClose}
        className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Close
      </button>
    </Modal>
  );
};

export default DayEventsModal;