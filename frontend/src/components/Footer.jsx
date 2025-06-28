import React from 'react';
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="bg-[#042538] text-white py-5">
      <div className="container mx-auto px-6">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          {/* Brand Section */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-1">HireNest</h3>
            <div className="w-12 h-0.5 bg-[#146edb] mx-auto md:mx-0 mb-2"></div>
            <p className="text-white/80 text-sm">
              Your gateway to dream careers
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <Link to="/login" className="text-white/90 hover:text-[#146edb] transition-colors duration-200 font-medium text-sm">
              Jobs
            </Link>
            <Link to="/about" className="text-white/90 hover:text-[#146edb] transition-colors duration-200 font-medium text-sm">
              About
            </Link>
            <Link to="/contact" className="text-white/90 hover:text-[#146edb] transition-colors duration-200 font-medium text-sm">
              Contact
            </Link>
          </div>
          
        </div>

        {/* Bottom Border & Copyright */}
        <div className="border-t border-white/20 pt-3 text-center">
          <p className="text-white/60 text-sm">
            &copy; {new Date().getFullYear()} HireNest. All rights reserved.
          </p>
        </div>
        
      </div>
    </footer>
  )
}

export default Footer