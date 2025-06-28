import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const Home = () => {
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

      
    </div>
      <Footer />
    </div>
  )
}

export default Home
