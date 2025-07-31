import React from 'react';
import Modal from 'react-modal';

const FestivalDetailModal = ({ event, onClose, onEdit, onDelete }) => {
  if (!event) return null;

  // The 'isUserEvent' flag now correctly comes from the data passed down from App.jsx
  const isUserEvent = event.isUserEvent;

  return (
    <Modal
      isOpen={!!event}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 outline-none z-50 text-gray-800"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h2>
      <hr className="mb-4" />
      {/* Display content based on whether it's a user event or a pre-loaded festival */}
      {isUserEvent ? (
        <p className="text-gray-700">Your personal event.</p>
      ) : (
        <div className="space-y-3 text-gray-700">
          <p><strong>📍 Location:</strong> {event.location}</p>
          <p><strong>🏷️ Type:</strong> {event.type}</p>
          <p><strong>📝 Summary:</strong> {event.summary}</p>
          <p><strong>💡 Hook:</strong> {event.hook_intro}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-3">
        {/* --- This is the main change --- */}
        {/* The Edit and Delete buttons are now always visible */}
        <button
          onClick={() => onDelete(event)} // Pass the full event object
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Delete
        </button>
        <button
          onClick={() => onEdit(event)} // Pass the full event object
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
        >
          Edit
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default FestivalDetailModal;