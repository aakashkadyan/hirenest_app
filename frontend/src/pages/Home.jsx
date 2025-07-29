import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      // Redirect to appropriate dashboard based on user role
      if (userRole === 'jobseeker') {
        navigate('/jobseekerdashboard', { replace: true });
      } else if (userRole === 'employer') {
        navigate('/employerdashboard', { replace: true });
      }
    }
  }, [navigate]);

  // Only render the public home page for non-authenticated users
  const token = localStorage.getItem('token');
  
  // Show loading or return null while checking authentication
  if (token) {
    return null; // This prevents flash of home page before redirect
  }

  return (
    <div>
      <Header />  
      <div className="min-h-screen bg-gray-50 text-gray-800 px-4 py-10">
      {/* Welcome Section */}
      <section className="text-center mb-12 mt-20">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to HireNest</h1>
        <p className="text-lg max-w-xl mx-auto">
          Find your dream job or the perfect candidate with our AI-powered matching system.
        </p>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-blue-500 mb-2">For Job Seekers</h3>
          <p>Discover opportunities that match your skills and aspirations with AI-powered recommendations.</p>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-blue-500 mb-2">For Employers</h3>
          <p>Find the perfect candidates for your positions using our advanced matching system.</p>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <h3 className="text-xl font-semibold text-blue-500 mb-2">AI-Powered</h3>
          <p>Our intelligent system learns from your preferences to provide better matches over time.</p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
        <p className="text-lg mb-6">Join thousands of job seekers and employers who trust HireNest</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => navigate('/signup')}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Sign Up Now
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </section>
    </div>
      <Footer />
    </div>
  )
}

export default Home
