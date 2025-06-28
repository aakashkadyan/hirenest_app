import React, { useState } from 'react'
import { Link } from "react-router";
import Header from '../components/Header'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer'

const Login = () => {
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState({
        email: '',
        password: '',
      });
    
      const handleChange = (e) => {
        setFormData((prev) => ({
          ...prev,
          [e.target.name]: e.target.value,
        }));
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_LOGIN_ENDPOINT || '/login'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
    
          const data = await res.json();

          console.log("Login response Data: ", data);
    
          if (res.ok) {
            // Save token (optional: to localStorage or cookie)
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userId', data.user._id);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);

            //alert('Login successful!');
           

      // Redirect based on role
      if (data.user.role === 'employer') {
        navigate('/employerdashboard');
      } else if (data.user.role === 'jobseeker') {
        navigate('/jobseekerdashboard');
      } else {
        toast.error('Unknown role');
      }} else {
            toast.error('Error: ' + data.error);
          }
        } catch (err) {
          console.error(err);
          toast.error('An error occurred during login');
        }
      };
  return (
    <div>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-lg border-2 border-blue-100 mx-4">
              <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Login to HireNest</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email" 
                      id="email"
                      name="email"
                      required
                      onChange={handleChange}
                      className="w-full px-5 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-colors" 
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password" 
                      id="password"
                      name="password"
                      required
                      onChange={handleChange}
                      className="w-full px-5 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-colors" 
                    />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300 text-lg shadow-md"
                >
                  Login
                </button>
              </form>
              <p className="text-sm text-center mt-6 text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                  Sign up here
                </Link>
              </p>
          </div>
        </div>
        <Footer />
    </div>
  )
}

export default Login
