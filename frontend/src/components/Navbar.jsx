import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchInput from '../ui/SearchInput';
import ProfileDropdown from '../ui/ProfileDropdown';

const Navbar = ({ searchTerm, setSearchTerm, onAddEventClick, onAddFestivalClick }) => {
  // Get the token and other user info from our AuthContext
  const { token, userEmail, logout } = useAuth();

  const activeLinkStyle = { backgroundColor: '#4f46e5', color: 'white' };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 flex justify-between items-center py-3">
        {/* The brand logo is always visible */}
        <NavLink to="/" className="text-2xl font-bold text-indigo-600">
          FolkCal
        </NavLink>

        {/* --- This is the key change --- */}
        {/* We only show the main controls if a token exists (i.e., user is logged in) */}
        {token ? (
          <>
            {/* Logged-in View */}
            <div className="flex-grow max-w-md mx-4">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events & festivals..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <NavLink to="/" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50">
                Calendar
              </NavLink>
              <NavLink to="/dashboard" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50">
                Dashboard
              </NavLink>

              <ProfileDropdown userEmail={userEmail} onLogout={logout} />
            </div>
          </>
        ) : (
          <>
            {/* Logged-out View */}
            <div className="flex items-center space-x-2">
               <NavLink to="/login" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">
                Login
              </NavLink>
               <NavLink to="/register" className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium shadow">
                Sign Up
              </NavLink>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;