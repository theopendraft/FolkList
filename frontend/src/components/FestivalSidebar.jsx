// frontend/src/components/FestivalSidebar.jsx
import React from 'react';

const FestivalSidebar = ({ festivals }) => {
  return (
    <div className="h-full bg-white shadow-lg overflow-y-auto">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-xl font-bold text-gray-800">Festivals</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {festivals.map(festival => (
          <li key={festival.id} className="p-4 hover:bg-gray-50 cursor-pointer">
            <h3 className="font-semibold text-gray-900">{festival.event_name}</h3>
            <p className="text-sm text-gray-600">📍 {festival.location}</p>
            <p className="text-sm text-gray-500">
              🗓️ {new Date(festival.accurate_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FestivalSidebar;