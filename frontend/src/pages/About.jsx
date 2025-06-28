import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'



const About = () => {
  return (
    <div>

     <Header/>    
     <div className="py-12 px-4 md:px-16 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">About HireNest</h1>
        <p className="text-gray-700 text-lg mb-10">
          Welcome to <span className="font-semibold">HireNest</span>, your premier destination for connecting talent with opportunity.
          Founded with a vision to revolutionize the hiring process, we leverage cutting-edge AI technology
          to create perfect matches between job seekers and employers. Our platform goes beyond traditional
          job listings by providing personalized recommendations, skill-based matching, and a seamless
          application process. Whether you're a job seeker looking for your next career move or an employer
          seeking top talent, Job Board is your trusted partner in the modern hiring landscape.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">Our Mission</h2>
            <p className="text-gray-700">
              To empower careers and businesses by creating meaningful connections through innovative technology
              and personalized job matching.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">Our Vision</h2>
            <p className="text-gray-700">
              To be the world's leading AI-powered job platform, transforming how people find jobs and companies discover talent.
            </p>
          </div>
        </div>
      </div>
    </div>
     <Footer/>
    </div>
  )
}

export default About
