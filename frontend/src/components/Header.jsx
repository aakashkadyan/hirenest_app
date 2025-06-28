import React, { useState } from 'react';
import { Link } from "react-router";
import UserProfile from './UserProfile';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = localStorage.getItem('token');

  return (
    <>
    
    <header className="bg-[#042538] text-white">
  <div className="container mx-auto flex items-center justify-between py-4 px-6">
    {/* Logo or Brand on the left */}
    <div className="flex items-center">
     <Link to="/" className="hover:opacity-80 transition-opacity duration-200">
       <img 
         src="/images/hirenest-logo-new.png" 
         alt="HireNest Logo" 
         className="h-10 w-auto"
       />
     </Link> 
    </div>

    
    <div className="flex items-center space-x-6 ml-auto">
     
      <nav className="flex space-x-6">
        <Link to="/" className="hover:text-[#146edb] hover:scale-105 text-lg font-semibold transition-all duration-200">Home</Link>
        <Link to="/about" className="hover:text-[#146edb] hover:scale-105 text-lg font-semibold transition-all duration-200">About Us</Link>
        <Link to="/career" className="hover:text-[#146edb] hover:scale-105 text-lg font-semibold transition-all duration-200">Career</Link>
        <Link to="/contact" className="hover:text-[#146edb] hover:scale-105 text-lg font-semibold transition-all duration-200">Contact Us</Link>
      </nav>
      
      {isLoggedIn ? (
        <UserProfile />
      ) : (
        <div className="flex space-x-4">
          <Link to="/login"
            className="text-white font-semibold rounded px-3 py-1 hover:border hover:border-blue-500 transition-all duration-200"
          >
            Login
          </Link>
          <Link to="/signup" className='hover:scale-110 cursor-pointer bg-blue-500 text-white font-semibold rounded px-3 py-1 transition-all duration-200 hover:bg-blue-600'>
            Signup
          </Link>
        </div>
      )}
    </div>
  </div>
</header>
    </>
  );
};

export default Header;
