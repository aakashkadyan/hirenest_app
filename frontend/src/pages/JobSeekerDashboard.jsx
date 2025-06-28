import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReadMore from '../components/ReadMore';
import ReactPaginate from 'react-paginate';
import UserProfile from '../components/UserProfile';

const JobSeekerDashboard = () => {
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('apply-jobs');
  const [jobs, setJobs] = useState([]);
  const [allFetchedJobs, setAllFetchedJobs] = useState([]); // Store all fetched jobs
  const [itemOffset, setItemOffset] = useState(0);
  const [limit] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [jobsPerPage] = useState(5);  

  const [totalJobs, setTotalJobs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const stored = localStorage.getItem(`appliedJobs_${userId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [savedJobs, setSavedJobs] = useState(() => {
    const stored = localStorage.getItem(`savedJobs_${userId}`);
    return stored ? JSON.parse(stored) : [];
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const tabs = [
    { id: 'apply-jobs', label: 'Apply for Jobs →' },
    { id: 'past-applications', label: 'Past Applications →' },
    { id: 'recommendations', label: 'Recommendations →' },
    { id: 'saved-jobs', label: 'Saved Jobs →' },
  ];

  // Helper function to get filtered jobs (excluding already applied and saved jobs)
  const getFilteredJobs = (allJobs) => {
    const appliedJobIds = appliedJobs.map(job => job._id);
    const savedJobIds = savedJobs.map(job => job._id);
    return allJobs.filter(job => 
      !appliedJobIds.includes(job._id) && !savedJobIds.includes(job._id)
    );
  };

  useEffect(() => {
    if (activeTab === 'apply-jobs') {
      // Fetch jobs based on search criteria
      let url = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBS_ENDPOINT || '/api/jobs'}?offset=0&limit=100`; // Fetch more jobs initially
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (location) url += `&location=${encodeURIComponent(location)}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.jobs) {
            setAllFetchedJobs(data.jobs); // Store all fetched jobs
          }
        })
        .catch((err) => console.error('Failed to fetch jobs:', err));
    }
  }, [activeTab, searchTerm, location]);

  // Separate useEffect for filtering and pagination
  useEffect(() => {
    if (activeTab === 'apply-jobs' && allFetchedJobs.length > 0) {
      const filteredJobs = getFilteredJobs(allFetchedJobs);
      
      // Set the filtered jobs for current page
      const startIndex = itemOffset;
      const endIndex = startIndex + limit;
      const currentPageJobs = filteredJobs.slice(startIndex, endIndex);
      
      setJobs(currentPageJobs);
      setTotalJobs(filteredJobs.length); // Use filtered count for pagination
      
      // Reset to first page if current page is beyond available pages
      if (itemOffset >= filteredJobs.length && filteredJobs.length > 0) {
        setItemOffset(0);
      }
    }
  }, [allFetchedJobs, appliedJobs, savedJobs, itemOffset, activeTab]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_ENDPOINT || '/api/applications'}/${userId}`);
        const data = await res.json();
        if (data?.applications) {
          setAppliedJobs(data.applications);
          localStorage.setItem(`appliedJobs_${userId}`, JSON.stringify(data.applications));
        }
      } catch (err) {
        console.error('Error fetching applied jobs:', err);
      }
    };

    fetchAppliedJobs();
  }, [userId]);

  const handleQuickApply = async (job) => {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!userName || !userEmail) {
      toast.error("User information not found. Please log in again.");
      return;
    }

    // Create a modal or prompt for quick application
    const resumeFile = document.createElement('input');
    resumeFile.type = 'file';
    resumeFile.accept = '.pdf,.doc,.docx';
    resumeFile.style.display = 'none';
    document.body.appendChild(resumeFile);

    resumeFile.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        document.body.removeChild(resumeFile);
        return;
      }

      try {
        // Create a temporary profile or apply directly
        const formData = new FormData();
        formData.append('job', job._id);
        formData.append('applicantName', userName);
        formData.append('applicantEmail', userEmail);
        formData.append('resume', file);
        formData.append('coverLetter', `I am interested in the ${job.title} position and would like to apply. Please find my resume attached.`);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_ENDPOINT || '/api/applications'}/quick-apply`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const updatedApplied = [...appliedJobs, { ...job, status: 'pending' }];
          setAppliedJobs(updatedApplied);
          localStorage.setItem(`appliedJobs_${userId}`, JSON.stringify(updatedApplied));
          
          setJobs(prevJobs => prevJobs.filter((j) => j._id !== job._id));
          setAllFetchedJobs(prevJobs => prevJobs.filter((j) => j._id !== job._id));
          
          toast.success("Quick application submitted! Consider creating a full profile for better opportunities.");
        } else {
          toast.error("Failed to submit quick application. Please try the regular application process.");
        }
      } catch (error) {
        console.error("Error in quick apply:", error);
        toast.error("Error submitting quick application.");
      }
      
      document.body.removeChild(resumeFile);
    };

    resumeFile.click();
  };

  const handleApply = async (job) => {
    const userId = localStorage.getItem("userId");
  
    if (!appliedJobs.find((j) => j._id === job._id)) {
      try {
        // Check if JobSeeker profile exists
        const resumeRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBSEEKERS_ENDPOINT || '/api/jobseekers'}/${userId}`);
        
        if (!resumeRes.ok || resumeRes.status === 404) {
          // Profile doesn't exist - offer to create one
          const shouldCreateProfile = window.confirm(
            `To apply for jobs, you need to create your JobSeeker profile first.\n\n` +
            `This includes your bio, skills, experience, and resume.\n\n` +
            `Would you like to create your profile now? The job "${job.title}" will be saved for you.`
          );
          
          if (shouldCreateProfile) {
            // Save the job they want to apply to
            localStorage.setItem('pendingJobApplication', JSON.stringify(job));
            // Redirect to profile creation
            navigate('/jobseekerform');
          } else {
            toast.info("You can create your profile anytime from the sidebar to start applying for jobs.");
          }
          return;
        }

        const resumeData = await resumeRes.json();

        if (!resumeData._id) {
          toast.error("Failed to fetch your profile. Please try again.");
          return;
        }

        const jobSeekerId = resumeData._id;

        // Submit application
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_ENDPOINT || '/api/applications'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job: job._id,
            applicant: jobSeekerId, 
            resume: jobSeekerId,   
            coverLetter: `I am genuinely excited about the opportunity to contribute to the ${job.title} role, and I am confident that my skills and experience align well with your expectations.`,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("Failed to submit application:", data);
          toast.error("Failed to submit application. Please try again.");
          return;
        }

        // Update applied jobs state and localStorage
        const updatedApplied = [...appliedJobs, { ...job, status: 'pending' }];
        setAppliedJobs(updatedApplied);
        localStorage.setItem(`appliedJobs_${userId}`, JSON.stringify(updatedApplied));

        // Remove job from current jobs list and all fetched jobs
        setJobs(prevJobs => prevJobs.filter((j) => j._id !== job._id));
        setAllFetchedJobs(prevJobs => prevJobs.filter((j) => j._id !== job._id));
        
        console.log("Application submitted successfully:", data);
        toast.success("Application submitted successfully!");

      } catch (error) {
        console.error("Error during application submission:", error);
        toast.error("Error submitting application. Please try again.");
      }
    } else {
      toast.info("You have already applied to this job.");
    }
  };
    
  const handleRemoveApplication = async (jobId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_ENDPOINT || '/api/applications'}/${jobId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const updatedApplications = appliedJobs.filter((job) => job._id !== jobId);
        setAppliedJobs(updatedApplications);
        localStorage.setItem(`appliedJobs_${userId}`, JSON.stringify(updatedApplications));
        toast.success("Application removed successfully!");
      } else {
        toast.error("Failed to remove application.");
      }
    } catch (error) {
      console.error('Failed to remove application:', error);
      toast.error("Error removing application.");
    }
  };

  const handleSaveJob = (job) => {
    if (!savedJobs.find((j) => j._id === job._id)) {
      // Update saved jobs state and localStorage
      const updatedSaved = [...savedJobs, job];
      setSavedJobs(updatedSaved);
      localStorage.setItem(`savedJobs_${userId}`, JSON.stringify(updatedSaved));

      // Remove job from current jobs list and all fetched jobs
      setJobs(prevJobs => prevJobs.filter((j) => j._id !== job._id));
      setAllFetchedJobs(prevJobs => prevJobs.filter((j) => j._id !== job._id));
      
      toast.success("Job saved successfully!");
    } else {
      toast.info("Job is already saved.");
    }
  };

  const handleUnsaveJob = (job) => {
    const updatedSaved = savedJobs.filter((j) => j._id !== job._id);
    setSavedJobs(updatedSaved);
    localStorage.setItem(`savedJobs_${userId}`, JSON.stringify(updatedSaved));
    toast.success("Job removed from saved jobs!");
  };

  const handleApplyFromSaved = async (job) => {
    // First apply for the job
    await handleApply(job);
    
    // Then remove from saved jobs
    const updatedSaved = savedJobs.filter((j) => j._id !== job._id);
    setSavedJobs(updatedSaved);
    localStorage.setItem(`savedJobs_${userId}`, JSON.stringify(updatedSaved));
  };

  const endOffset = itemOffset + limit;
  const pageCount = Math.ceil(totalJobs / limit); // This will now use filtered count

  const handlePageClick = (event) => {
    const newOffset = (event.selected * limit);
    setItemOffset(newOffset);
  };

  // Get actual counts for display
  const getTabCounts = () => {
    return {
      'apply-jobs': totalJobs, // Use the filtered total count
      'past-applications': appliedJobs.length,
      'saved-jobs': savedJobs.length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

      {/* Dashboard */}
      <main className="grid grid-cols-12 gap-4 m-4">
        {/* Sidebar */}
        <aside className="col-span-3 bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold text-blue-600 mb-4">Dashboard</h2>
          
          {/* Profile Status Check */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Profile Status</h3>
            <p className="text-xs text-yellow-700 mb-2">
              Having a complete profile increases your chances of getting hired by 75%!
            </p>
            <button
              onClick={() => navigate('/jobseekerform')}
              className="w-full bg-yellow-500 text-white text-sm px-3 py-2 rounded hover:bg-yellow-600 transition"
            >
              {/* This will be dynamically updated based on profile existence */}
              Create/Update Profile
            </button>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => {
              const count = tabCounts[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex justify-between items-center text-left px-3 py-2 rounded ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {(tab.id === 'apply-jobs' || tab.id === 'past-applications' || tab.id === 'saved-jobs') && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <section className="col-span-9 bg-white p-6 rounded shadow">
          {activeTab === 'apply-jobs' && (
            <div>
              <h2 className="text-xl text-blue-600 font-bold mb-4">Apply for Jobs</h2>

              {/* Application Methods Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Application Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Apply:</strong> Uses your complete profile with bio, skills, experience, and education. Best for showcasing your full qualifications.
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Quick Apply:</strong> Apply instantly with just your resume. Perfect for quick applications when you're browsing jobs.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by text..."
                  className="border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 flex-1 rounded"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => {
                    setItemOffset(0);
                    setCurrentPage(0);
                  }}
                >
                  Search
                </button>
              </div>

              {jobs.length > 0 ? (
                <>
                  <ul className="space-y-6">
                    {jobs.map((job) => (
                      <li
                        key={job._id}
                        className="bg-white p-6 rounded-lg border-2 border-blue-400 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        <h3 className="text-xl font-bold text-blue-700 mb-2">{job.title}</h3>
                        <ReadMore text={job.description} />
                        <p className="text-gray-700 text-sm my-3">{job.requirements}</p>
                      
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <span>📍 {job.location}</span>
                          <span>💰 {job.salaryRange ? `${job.salaryRange.currency} ${job.salaryRange.min} - ${job.salaryRange.max}` : 'Not specified'}</span>
                        </div>
                      
                        <div className="flex gap-4">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(job);
                            }}
                          >
                            Apply
                          </button>
                          <button
                            className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 text-sm font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickApply(job);
                            }}
                            title="Apply quickly with just your resume"
                          >
                            Quick Apply
                          </button>
                          <button
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveJob(job);
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel="Next >"
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={5}
                      pageCount={pageCount}
                      previousLabel="< Prev"
                      containerClassName="flex justify-center space-x-2 mt-4"
                      pageClassName="px-3 py-1 border rounded hover:bg-gray-200"
                      activeClassName="bg-blue-500 text-white"
                      previousClassName="px-3 py-1 border rounded hover:bg-gray-200"
                      nextClassName="px-3 py-1 border rounded hover:bg-gray-200"
                      disabledClassName="opacity-50 cursor-not-allowed"
                    />
                  </div>
                </>
              ) : (
                <p>No available jobs found.</p>
              )}
            </div>
          )}

          {activeTab === 'past-applications' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Your Applications</h2>

              <div className="space-y-6">
                {appliedJobs.length > 0 ? (
                  <>
                    {appliedJobs
                      .slice(currentPage * jobsPerPage, currentPage * jobsPerPage + jobsPerPage)
                      .map((job) => (
                        <div
                          key={job._id}
                          className="bg-white p-6 rounded-lg border-2 border-blue-400 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <h3 className="text-xl font-bold text-blue-700 mb-2">{job.title}</h3>
                          <ReadMore text={job.description} />
                          <p className="text-gray-700 text-sm my-3">{job.requirements}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <span>📍 {job.location}</span>
                            <span>💰 {job.salaryRange ? `${job.salaryRange.currency} ${job.salaryRange.min} - ${job.salaryRange.max}` : 'Not specified'}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Status: {job.status}</span>
                          </div>
                        </div>
                      ))}
                    <div className="mt-6">
                      <ReactPaginate
                        breakLabel="..."
                        nextLabel="Next >"
                        onPageChange={({ selected }) => setCurrentPage(selected)}
                        pageRangeDisplayed={5}
                        pageCount={Math.ceil(appliedJobs.length / jobsPerPage)}
                        previousLabel="< Prev"
                        containerClassName="flex justify-center space-x-2 mt-4"
                        pageClassName="px-3 py-1 border rounded hover:bg-gray-200"
                        activeClassName="bg-blue-500 text-white"
                        previousClassName="px-3 py-1 border rounded hover:bg-gray-200"
                        nextClassName="px-3 py-1 border rounded hover:bg-gray-200"
                        disabledClassName="opacity-50 cursor-not-allowed"
                      />
                    </div>
                  </>
                ) : (
                  <p>You have not applied to any jobs yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Job Recommendations</h2>
              <p>Recommendations based on your skills and preferences.</p>
            </div>
          )}

          {activeTab === 'saved-jobs' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Saved Jobs</h2>

              <div className="space-y-6">
                {savedJobs.length > 0 ? savedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white p-6 rounded-lg border-2 border-blue-400 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-xl font-bold text-blue-700 mb-2">{job.title}</h3>
                    <ReadMore text={job.description} />
                    <p className="text-gray-700 text-sm my-3">{job.requirements}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📍 {job.location}</span>
                      <span>💰 {job.salaryRange ? `${job.salaryRange.currency} ${job.salaryRange.min} - ${job.salaryRange.max}` : 'Not specified'}</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        className="bg-blue-500 text-white px-3 py-1.5 mt-5 rounded-md hover:bg-blue-700 text-sm font-semibold"
                        onClick={() => handleApplyFromSaved(job)}
                      >
                        Apply
                      </button>

                      <button
                        className="bg-yellow-500 text-white px-2 py-1.5 mt-5 rounded-md hover:bg-red-600 text-sm font-semibold"
                        onClick={() => handleUnsaveJob(job)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )) : <p>No saved jobs yet.</p>}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default JobSeekerDashboard;