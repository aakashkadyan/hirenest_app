import React from 'react';
import { Link } from "react-router";
import Header from '../components/Header';
import Footer from '../components/Footer';

const CareerPage = ()=> {
  return (
    <div>  
      <Header />
      <div className="min-h-screen bg-gray-50 py-16 px-4 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6 text-blue-700">
            Join Our Team
          </h1>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            We're building products that simplify lives. We're constantly growing and looking for talented individuals to join our team.
          </p>
          
          <div className="bg-white p-10 rounded-xl shadow-lg border-2 border-blue-100 mb-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">No Current Openings</h2>
              <p className="text-gray-600 max-w-lg text-center">
                We don't have any open positions at the moment. Please check back later or submit your resume for future opportunities.
              </p>
              <div className="pt-4">
                <Link to="/contact">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-md mr-4">
                    Contact Us
                  </button>
                </Link>
                <Link to="/">
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg transition duration-300">
                    Back to Home
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-8 rounded-xl border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Future Opportunities</h3>
            <p className="text-gray-700 mb-6">
              We're always interested in connecting with talented professionals. Join our talent pool to be considered for future openings.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
                <h4 className="font-medium text-blue-700 mb-2">Engineering</h4>
                <p className="text-sm text-gray-600">Software development, DevOps, QA</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
                <h4 className="font-medium text-blue-700 mb-2">Design</h4>
                <p className="text-sm text-gray-600">UI/UX, Product, Graphic Design</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
                <h4 className="font-medium text-blue-700 mb-2">Business</h4>
                <p className="text-sm text-gray-600">Marketing, Sales, Operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CareerPage;