import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();

  // Style for the active NavLink
  const activeLinkStyle = {
    backgroundColor: '#4f46e5', // A darker indigo color
    color: 'white',
  };

  return (
    <header className="bg-white shadow-md mb-1">
      <nav className="container mx-auto px-6  flex justify-between items-center py-2">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          FolkList
        </Link>
        <div className="flex items-center space-x-2">
          <NavLink
            to="/"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className="px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50"
          >
            Calendar
          </NavLink>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className="px-2 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50"
          >
            Dashboard
          </NavLink>
          <button
            onClick={logout}
            className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;