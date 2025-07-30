import React from 'react';
import Modal from 'react-modal';

const DayEventsModal = ({ date, events, onSelectFestival, onClose }) => {
  if (!events || events.length === 0) return null;

  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 outline-none z-50 text-gray-800"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Events for {formattedDate}</h3>
      <ul className="divide-y divide-gray-200">
        {events.map((event) => (
          <li
            key={event.id}
            onClick={() => onSelectFestival(event)}
            className="py-3 px-2 -mx-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
          >
            {event.event_name}
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