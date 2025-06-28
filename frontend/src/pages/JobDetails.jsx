import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [employerProfile, setEmployerProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBS_ENDPOINT || '/api/jobs'}/${jobId}`)
      .then((res) => res.json())
      .then((data) => setJob(data.job))
      .catch((err) => console.error('Error fetching job:', err));
  }, [jobId]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId || !jobId) return;
  
    const appliedKey = `appliedJobs_${userId}`;
    const appliedJobs = JSON.parse(localStorage.getItem(appliedKey)) || [];
  
    const hasApplied = appliedJobs.some((j) => j._id === jobId);
    setAlreadyApplied(hasApplied);
  }, [jobId]);  

  useEffect(() => {
    if (job?.postedBy) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_EMPLOYER_PROFILE_ENDPOINT || '/api/employerprofile'}/${job.postedBy}`)
        .then((res) => res.json())
        .then((data) => setEmployerProfile(data))
        .catch((err) => console.error('Error fetching employer profile:', err));
    }
  }, [job?.postedBy]);
  

  const handleApply = () => {
    const userId = localStorage.getItem('userId');
    if (!userId || !job) {
      alert('User not logged in or job not loaded');
      return;
    }
  
    const appliedKey = `appliedJobs_${userId}`;
    const appliedJobs = JSON.parse(localStorage.getItem(appliedKey)) || [];
  
    if (!appliedJobs.find((j) => j._id === job._id)) {
      const updatedJobs = [...appliedJobs, { ...job, status: 'pending' }];
      localStorage.setItem(appliedKey, JSON.stringify(updatedJobs));
      setAlreadyApplied(true);
      navigate('/jobseekerdashboard');
    }
  };
  

  if (!job) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <div className="relative max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
      {/* Close Button */}
      <button
        onClick={() => navigate('/jobseekerdashboard')}
        className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 shadow-sm transition"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Job Title and Location */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
        <p className="text-gray-600 mt-1">📍 {job.location}</p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Description & Requirements */}
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
            <p className="text-gray-700 mt-2">{job.description}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">Requirements</h2>
            <p className="text-gray-700 mt-2">{job.requirements}</p>
          </section>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            disabled={alreadyApplied}
            className={`mt-4 px-2 py-2 rounded text-white font-semibold transition ${
              alreadyApplied
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {alreadyApplied ? 'Already Applied' : 'Apply for this Job'}
          </button>
        </div>

        {/* Right Column - Company Info */}
        
            <div className="bg-gray-50 p-6 rounded-md border space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Company Details</h2>

              {employerProfile ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Basic Information</h3>
                    <p className="text-gray-600 text-sm"><strong>Company Name:</strong> {employerProfile.companyName || 'N/A'}</p>
                    <p className="text-gray-600 text-sm"><strong>Industry:</strong> {employerProfile.industry || 'N/A'}</p>
                    <p className="text-gray-600 text-sm"><strong>Company Size:</strong> {employerProfile.companySize || 'N/A'}</p>
                    <p className="text-gray-600 text-sm"><strong>Location:</strong> {employerProfile.location || 'N/A'}</p>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Online Presence</h3>
                    <p className="text-gray-600 text-sm">
                      <strong>Website:</strong>{' '}
                      {employerProfile.website ? (
                        <a
                          href={employerProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {employerProfile.website}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">About the Company</h3>
                    <p className="text-gray-600 text-sm">{employerProfile.description || 'N/A'}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm italic">Loading company info...</p>
              )}
            </div>

      </div>
    </div>
  );
};

export default JobDetails;
