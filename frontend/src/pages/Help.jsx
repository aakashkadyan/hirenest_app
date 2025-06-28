import React from 'react';
import { Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import { ArrowLeft, Mail, Phone, MessageCircle, FileText, Users, Briefcase, Search } from 'lucide-react';

const Help = () => {
  const isLoggedIn = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <Link to="/" className="hover:opacity-80 transition-opacity duration-200">
          <img 
            src="/images/hirenest-logo-new.png" 
            alt="HireNest Logo" 
            className="h-auto max-h-10 w-auto object-contain"
          />
        </Link>
        
        <div className="flex items-end ml-50">
          {isLoggedIn ? (
            <UserProfile />
          ) : (
            <div className="flex space-x-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">Login</Link>
              <Link to="/signup" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-semibold">Sign Up</Link>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Help Center</h1>
            <p className="text-gray-600 mb-8">Find answers to common questions and get support for your HireNest experience.</p>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <Mail className="text-blue-600 mb-3" size={32} />
                <h3 className="font-semibold text-gray-800 mb-2">Email Support</h3>
                <p className="text-gray-600 text-sm">Get help via email</p>
                <a href="mailto:support@hirenest.com" className="text-blue-600 hover:underline mt-2 inline-block">support@hirenest.com</a>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                <Phone className="text-green-600 mb-3" size={32} />
                <h3 className="font-semibold text-gray-800 mb-2">Phone Support</h3>
                <p className="text-gray-600 text-sm">Call us for immediate help</p>
                <p className="text-green-600 font-semibold mt-2">+1-800-HIRE-NEST</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                <MessageCircle className="text-purple-600 mb-3" size={32} />
                <h3 className="font-semibold text-gray-800 mb-2">Live Chat</h3>
                <p className="text-gray-600 text-sm">Chat with our support team</p>
                <button className="text-purple-600 hover:underline mt-2">Start Chat</button>
              </div>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-8">
              {/* General Help */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="text-blue-600" size={24} />
                  General Help
                </h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-800">How do I create an account?</h3>
                    <p className="text-gray-600 mt-1">Click on "Sign Up" in the top navigation, choose your role (Job Seeker or Employer), and fill in your details.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-800">How do I reset my password?</h3>
                    <p className="text-gray-600 mt-1">On the login page, click "Forgot Password" and follow the instructions sent to your email.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-800">How do I update my profile?</h3>
                    <p className="text-gray-600 mt-1">Click on your profile picture in the top-right corner and select "Edit Profile" to update your information.</p>
                  </div>
                </div>
              </div>

              {/* Job Seeker Help */}
              {(userRole === 'jobseeker' || !isLoggedIn) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Search className="text-green-600" size={24} />
                    For Job Seekers
                  </h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-800">How do I search for jobs?</h3>
                      <p className="text-gray-600 mt-1">Use the search bar on your dashboard to find jobs by title, location, or company. You can also filter results by salary, experience level, and job type.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-800">How do I apply for a job?</h3>
                      <p className="text-gray-600 mt-1">Click on a job posting, review the details, and click "Apply Now". Make sure your profile and resume are up to date.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-800">How do I upload my resume?</h3>
                      <p className="text-gray-600 mt-1">Go to your profile settings and upload your resume in the "Documents" section. Supported formats: PDF, DOC, DOCX.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-800">How do I track my applications?</h3>
                      <p className="text-gray-600 mt-1">Visit your dashboard to see all your job applications and their current status (Applied, Under Review, Interview, etc.).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Employer Help */}
              {(userRole === 'employer' || !isLoggedIn) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase className="text-purple-600" size={24} />
                    For Employers
                  </h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold text-gray-800">How do I post a job?</h3>
                      <p className="text-gray-600 mt-1">Go to your employer dashboard and click "Post New Job". Fill in the job details, requirements, and compensation information.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold text-gray-800">How do I manage applications?</h3>
                      <p className="text-gray-600 mt-1">Access your dashboard to view all applications for your job postings. You can filter, review, and update application statuses.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold text-gray-800">How do I contact candidates?</h3>
                      <p className="text-gray-600 mt-1">Use the messaging system in your dashboard to communicate with candidates or schedule interviews.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h3 className="font-semibold text-gray-800">How do I edit or close a job posting?</h3>
                      <p className="text-gray-600 mt-1">Find the job in your dashboard and use the edit or close options. Closed jobs will no longer accept new applications.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Support */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="text-orange-600" size={24} />
                  Technical Support
                </h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-semibold text-gray-800">The website is loading slowly</h3>
                    <p className="text-gray-600 mt-1">Try clearing your browser cache, checking your internet connection, or switching to a different browser.</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-semibold text-gray-800">I can't upload my resume</h3>
                    <p className="text-gray-600 mt-1">Ensure your file is under 5MB and in PDF, DOC, or DOCX format. If the problem persists, try a different browser.</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-semibold text-gray-800">I'm not receiving email notifications</h3>
                    <p className="text-gray-600 mt-1">Check your spam folder and make sure hirenest.com is not blocked. You can also update your notification preferences in settings.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Still Need Help?</h2>
              <p className="text-gray-600 mb-4">
                If you couldn't find the answer to your question, our support team is here to help you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/contact" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Contact Support
                </Link>
                <a 
                  href="mailto:support@hirenest.com" 
                  className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help; 