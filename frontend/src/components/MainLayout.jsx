import React, { useState } from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // We pass the searchTerm down to the child page (HomePage or DashboardPage)
  // by cloning the element and adding a new prop.
  const childrenWithProps = React.cloneElement(children, { searchTerm });

  return (
    <div className="h-screen w-screen  flex flex-col">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className=" flex-grow  font-sans bg-gray-100 overflow-y-auto">
        {childrenWithProps}
      </main>
    </div>
  );
};

export default MainLayout;