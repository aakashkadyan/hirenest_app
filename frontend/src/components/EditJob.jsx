import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import GoBackButton from './GoBackButton';

const EditJob = () => {
  const { jobId } = useParams();  // Get jobId from the URL
  const navigate = useNavigate();
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    requirements: '',
    salaryRange: {
      min: '',
      max: '',
      currency: 'INR',
    },
    type: 'full-time',
  });

  // Fetch the job data by jobId
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBS_ENDPOINT || '/api/jobs'}/${jobId}`);
        const data = await response.json();
  
        if (response.ok) {
          // Convert salary min/max to numbers explicitly
          const job = {
            ...data.job,
            salaryRange: {
              ...data.job.salaryRange,
              min: Number(data.job.salaryRange.min),
              max: Number(data.job.salaryRange.max),
            },
          };
          setJobForm(job);
        } else {
          toast.error(data.message || 'Failed to fetch job details');
        }
      } catch (error) {
        console.error('Error fetching job data:', error);
        toast.error('An error occurred while fetching the job data');
      }
    };
  
    fetchJobData();
  }, [jobId]);
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
  
    // Handle salaryRange separately
    if (['min', 'max'].includes(name)) {
      setJobForm((prev) => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          [name]: Number(value), // 👈 Convert to number
        },
      }));
    } else if (name === 'currency') {
      setJobForm((prev) => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          currency: value,
        },
      }));
    } else {
      setJobForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  

  // Handle job update on form submission
  const handleJobUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBS_ENDPOINT || '/api/jobs'}/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobForm),
      });

      const data = await response.json();
      console.log("JOB FORM :",data);  // Log the response data
      if (response.ok) {
        toast.success('Job updated successfully!');
        navigate('/employerdashboard');  // Redirect to dashboard after successful update
      } else {
        toast.error(data.message || 'Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('An error occurred while updating the job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <img
          src="/images/hirenest-logo-new.png"
          alt="HireNest Logo"
          className="h-auto max-h-10 w-auto object-contain"
        />
        <div className="flex items-end ml-50">
          <UserProfile />
        </div>
      </header>

      {/* Back Button - Positioned at left edge */}
      <div className="mt-6 ml-8">
        <GoBackButton />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto mt-6 mb-10 p-8">
        {/* Edit Form */}
        <div className="bg-blue-50 border border-blue-300 shadow-md rounded-md p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Edit Job</h2>
          <form onSubmit={handleJobUpdate} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Job Title</label>
              <input
                type="text"
                name="title"
                value={jobForm.title}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-blue-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
      
            {/* Job Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Job Description</label>
              <textarea
                name="description"
                value={jobForm.description}
                onChange={handleFormChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-blue-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
      
            {/* Requirements */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Requirements</label>
              <textarea
                name="requirements"
                value={jobForm.requirements}
                onChange={handleFormChange}
                rows="3"
                className="w-full px-4 py-2 border border-blue-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
      
            {/* Salary and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Min Salary (INR)</label>
                <input
                  type="number"
                  name="min"
                  value={jobForm.salaryRange.min}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-blue-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Max Salary (INR)</label>
                <input
                  type="number"
                  name="max"
                  value={jobForm.salaryRange.max}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-blue-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Currency</label>
                <select
                  name="currency"
                  value={jobForm.salaryRange.currency}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-blue-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
      
            {/* Location */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={jobForm.location}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-blue-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
      
            {/* Job Type */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Job Type</label>
              <select
                name="type"
                value={jobForm.type}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-blue-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
      
            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Update Job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default EditJob;
