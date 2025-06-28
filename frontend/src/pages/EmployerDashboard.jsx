import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CitySelect from '../components/CitySelect';
import JobTitleSelect from '../components/JobTitleSelect';
import AutoSuggestInput from '../components/AutoSuggestInput';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReadMore from '../components/ReadMore';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import UserProfile from '../components/UserProfile';


const EmployerDashboard = () => {
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('post-jobs');
  const [postedJobs, setPostedJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [applicationSearchQuery, setApplicationSearchQuery] = useState('');
  const [applications, setApplications] = useState([]);
  const [applicationsPage, setApplicationsPage] = useState(0);
  const [selectedJobSeeker, setSelectedJobSeeker] = useState(null);
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false);
  const jobsPerPage = 5;
  
  const applicationsPerPage = 5;
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    jobTitle: '',
    applicant: '',
    location: '',
    status: '',
  });
  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Reset to first page when filters change
    setApplicationsPage(0);
  };

  const filteredApplications = applications.filter((app) => {
    // Applicant name can be in app.applicant.user.name or app.applicant.name
    const applicantName =
      app.applicant?.user?.name ||
      app.applicant?.name ||
      '';
  
    const jobTitle = app.job?.title || '';
    const jobLocation = app.job?.location || '';
    const status = app.status || 'pending'; // Default to pending if no status
  
    const matchesJobTitle =
      !filters.jobTitle ||
      jobTitle.toLowerCase().includes(filters.jobTitle.toLowerCase());
  
    const matchesApplicant =
      !filters.applicant ||
      applicantName.toLowerCase().includes(filters.applicant.toLowerCase());
  
    const matchesLocation =
      !filters.location ||
      jobLocation.toLowerCase().includes(filters.location.toLowerCase());
  
    const matchesStatus =
      !filters.status || status === filters.status;
  
    return (
      matchesJobTitle &&
      matchesApplicant &&
      matchesLocation &&
      matchesStatus
    );
  });  
  useEffect(() => {
    setApplicationsPage(0);
  }, [filters]);
  
  const indexOfFirstApplication = applicationsPage * applicationsPerPage;
  const indexOfLastApplication = indexOfFirstApplication + applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApplication, indexOfLastApplication);

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
    postedBy: '',
  });

  const handleCityChange = (selectedOption) => {
    if (selectedOption) {
      setJobForm((prev) => ({
        ...prev,
        location: selectedOption.value,
      }));
    }
  };

  const handleJobTitleChange = (selectedOption) => {
    setJobForm((prev) => ({
      ...prev,
      title: selectedOption ? selectedOption.value : '',
    }));
  };

  

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setJobForm((prev) => ({
        ...prev,
        postedBy: userId,
      }));

      // Check if employer has a company profile
      checkCompanyProfile(userId);
    } else {
      toast.error('User ID not found. Please log in again.');
      navigate('/login');
    }
  }, []);

  const checkCompanyProfile = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_EMPLOYER_PROFILE_ENDPOINT || '/api/employerprofile'}/${userId}`);
      if (response.ok) {
        setHasCompanyProfile(true);
      } else {
        setHasCompanyProfile(false);
      }
    } catch (error) {
      console.log('No company profile found');
      setHasCompanyProfile(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'posted-jobs') {
      fetchPostedJobs();
      setCurrentPage(0); // Reset to first page when tab changes
    }
    if (activeTab === 'applications') {
      fetchApplications(); // Fetch applications when tab changes to 'applications'
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (['min', 'max', 'currency'].includes(name)) {
      setJobForm((prev) => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          [name]: value,
        },
      }));
    } else {
      setJobForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const sendEmail = async (to, subject, text) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_EMAIL_ENDPOINT || '/api/send-email'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, text }),
      });
  
      const result = await res.json();
      if (res.ok) {
        toast.success(`Email sent to ${to}`);
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    } catch (err) {
      console.error('Email send error:', err);
      toast.error('Something went wrong while sending the email.');
    }
  };
  

  const handleJobSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBS_ENDPOINT || '/api/jobs'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Job posted successfully!');
        setTimeout(() => {
          setMessage('');
        }, 5000);
        setJobForm({
          title: '',
          description: '',
          location: '',
          requirements: '',
          salaryRange: { min: '', max: '', currency: 'INR' },
          type: 'full-time',
          postedBy: localStorage.getItem('userId'),
        });
      } else {
        toast.error(data.message || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('An error occurred while posting the job');
    }
  };

  const fetchPostedJobs = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBS_ENDPOINT || '/api/jobs'}?postedBy=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setPostedJobs(data.jobs);
      } else {
        toast.error(data.message || 'Failed to fetch posted jobs');
      }
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
      toast.error('An error occurred while fetching jobs');
    }
  };

  const fetchApplications = async () => {
    try {
      const employerId = localStorage.getItem('userId');
      console.log('Employer ID:', employerId);
    
      if (!employerId) {
        toast.error('Employer ID not found. Please log in again.');
        return;
      }
  
      // Fetch applications based on employer's posted jobs
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_ENDPOINT || '/api/applications'}?postedBy=${employerId}`);

      const data = await response.json();

      console.log('Applications Data:', data);
  
      if (response.ok) {
        // Only store relevant data in the state
        setApplications(data?.applications || []);
      } else {
        toast.error(data?.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('An error occurred while fetching applications');
    }
  };

    const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_ENDPOINT || '/api/applications'}/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        toast.error(data.message || 'Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('An error occurred while updating application status');
    }
  };
  
  

  const handleViewResume = async (application) => {
    try {
      // First check if there's an uploaded resume file
      if (application.resume && application.resume.webViewLink) {
        console.log('Opening uploaded resume:', application.resume.webViewLink);
        window.open(application.resume.webViewLink, '_blank');
        return;
      }

      // If no uploaded resume, check if it's a quick apply (no full profile)
      if (application.applicationMethod === 'quick-apply' && !application.applicant) {
        toast.info('This is a quick application. Only the uploaded resume is available.');
        return;
      }

      // Generate PDF from profile details for full-profile applications without uploaded resume
      if (!application.applicant || !application.applicant.user) {
        toast.error('Unable to fetch applicant profile details');
        return;
      }

      const userId = application.applicant.user._id;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBSEEKERS_ENDPOINT || '/api/jobseekers'}/${userId}`);
      const data = await res.json();
  
      if (!res.ok) {
        toast.error('Failed to fetch jobseeker profile');
        return;
      }
  
      const seeker = data;
      const educationDetails = [];
      const experienceDetails = [];

      seeker.education.forEach((edu, index) => {
        educationDetails.push(`Degree : ${edu.degree}, \nInstitution : ${edu.institution}, \nField of Study : ${edu.fieldOfStudy}, \nStart Year : ${edu.startYear}, \nEnd Year : ${edu.endYear}`);
        
      });
      seeker.experience.forEach((exp, index) => {
        const startDate = new Date(exp.startDate).toLocaleDateString('en-GB');
        const endDate = exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-GB') : 'Present';

        experienceDetails.push(`Company : ${exp.company}, \nPosition : ${exp.role}, \nStart Date : ${startDate}, \nEnd Date : ${endDate}, \nDescription : ${exp.description}`);
      });
      //console.log('Job Seeker Data:', data);
      //console.log('Education Details:', educationDetails);
  
      const doc = new jsPDF();
  
      // Title
      doc.setFontSize(16);
      doc.text('Resume (Generated from Profile)', 105, 20, null, null, 'center');
  
      // Basic Info
      doc.setFontSize(14);
      doc.text(`Name: ${seeker.user.name}`, 20, 40);
      doc.text(`Email: ${seeker.user.email}`, 20, 50);
      doc.text(`Location: ${seeker.user.location || 'N/A'}`, 20, 60);
      doc.text(`Phone: ${seeker.phone || 'N/A'}`, 20, 70);
  
      // Optional: Table for structured info
      autoTable(doc, {
        startY: 80,
        head: [['Field', 'Details']],
        body: [
          ['Experience Details', experienceDetails || 'N/A'],
          ['Education Details', educationDetails || 'N/A'],
          ['Bio', seeker.bio || 'N/A'],
          ['Skills', seeker.skills?.join(', ') || 'N/A'],   
          ['Preferred Job Type', seeker.jobPreferences.preferredJobType|| 'N/A'],
          ['Preferred Location', seeker.jobPreferences.preferredLocation || 'N/A'],          
        ],
      });
  
      // Create blob and open in new tab
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('Error viewing resume');
    }
  };
  

  const handleJobDelete = async (jobId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBS_ENDPOINT || '/api/jobs'}/${jobId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setPostedJobs((prev) => prev.filter((job) => job._id !== jobId));
        toast.success('Job deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('An error occurred while deleting the job');
    }
  };

  const indexOfLastJob = (currentPage + 1) * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const filteredJobs = postedJobs.filter((job) =>
    job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(jobSearchQuery.toLowerCase())
  );
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  
  const tabs = [
    { 
      id: 'post-jobs', 
      label: 'Post Jobs', 
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    { 
      id: 'posted-jobs', 
      label: 'Posted Jobs', 
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )
    },
    { 
      id: 'applications', 
      label: 'Applications', 
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
            <img
          src="/images/hirenest-logo-new.png" // Path to your logo image
          alt="HireNest Logo"
          className="h-auto max-h-10 w-auto object-contain" // Adjust the height as needed
        />
              <div className="flex items-end ml-50"><UserProfile /></div>
            </header>

      <main className="grid grid-cols-12 gap-4 m-4">
        <aside className="col-span-3 bg-white p-4 rounded shadow h-fit">
          {/* Company Profile Status */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Company Profile</h3>
            {hasCompanyProfile ? (
              <div className="text-xs text-green-700">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Profile Complete
                </div>
                <p className="mb-2">Your company profile helps job seekers learn more about your organization.</p>
                <button
                  onClick={() => navigate('/employerprofileform')}
                  className="w-full bg-blue-500 text-white text-xs px-3 py-2 rounded hover:bg-blue-600 transition"
                >
                  Update Profile
                </button>
              </div>
            ) : (
              <div className="text-xs text-orange-700">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Profile Incomplete
                </div>
                <p className="mb-2">Create your company profile to help applicants learn more about your organization and increase application rates!</p>
                <button
                  onClick={() => navigate('/employerprofileform')}
                  className="w-full bg-orange-500 text-white text-xs px-3 py-2 rounded hover:bg-orange-600 transition"
                >
                  Create Profile
                </button>
              </div>
            )}
          </div>

          <nav className="flex flex-col space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center text-left px-3 py-2 rounded ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>



        <section className="col-span-9 bg-white p-6 rounded shadow">
                {activeTab === 'post-jobs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-600">Post a New Job</h2>
              {message && (
                <div className="text-green-600 font-semibold ml-1">
                  {message}
                </div>
              )}
            </div>

            {/* Information Note */}
            {!hasCompanyProfile && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">You can post jobs without a company profile!</p>
                    <p className="text-yellow-700 mt-1">However, having a complete company profile increases application rates by up to 40% as job seekers can learn more about your organization.</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleJobSubmit} className="space-y-4 p-4 border border-blue-400 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Job Title</label>
                <JobTitleSelect
                  onChange={handleJobTitleChange}
                  defaultValue={jobForm.title}
                  className="w-full p-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Job Description</label>
                <textarea
                  name="description"
                  value={jobForm.description}
                  onChange={handleFormChange}
                  required
                  className="w-full p-3 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Describe the job role and responsibilities"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Requirements</label>
                <textarea
                  name="requirements"
                  value={jobForm.requirements}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="List key skills or qualifications"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Min Salary (INR)</label>
                  <input
                    type="number"
                    name="min"
                    value={jobForm.salaryRange.min}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Max Salary (INR)</label>
                  <input
                    type="number"
                    name="max"
                    value={jobForm.salaryRange.max}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={jobForm.salaryRange.currency}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                <CitySelect
                  onChange={handleCityChange}
                  defaultValue={
                    jobForm.location
                      ? { label: jobForm.location, value: jobForm.location }
                      : null
                  }
                  className="w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Job Type</label>
                <select
                  name="type"
                  value={jobForm.type}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Post Job
              </button>
            </form>
          </div>
        )}
{activeTab === 'posted-jobs' && (
  <div>

    <h2 className="text-xl text-blue-600 font-bold mb-4">Your Posted Jobs</h2>
    

    {postedJobs.length === 0 ? (
      <p className="text-gray-600">No posted jobs available.</p>
    ) : (
      <>
      
        <p className="text-sm text-gray-500 mb-4">
          Showing {indexOfFirstJob + 1}–{Math.min(indexOfLastJob, postedJobs.length)} of {postedJobs.length} jobs
        </p>

        <div className="space-y-6">
                {/* <input
          type="text"
          placeholder="Search by job title or location..."
          value={jobSearchQuery}
          onChange={(e) => setJobSearchQuery(e.target.value)}
          className="mb-4 w-full p-2 border border-blue-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          /> */}

          

          {currentJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-6 rounded-lg border-2 border-blue-400 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-3">
                <h3 className="text-xl font-bold text-blue-700">{job.title}</h3>
                <p className="text-sm text-gray-500 mt-1">📍 {job.location}</p>
              </div>

            <ReadMore text={job.description} />

              <div className="flex flex-wrap gap-4 mt-2">
                <button
                  onClick={() => navigate(`/job/edit/${job._id}`)}
                  className="bg-blue-500 text-white px-5 py-1.5 rounded-md hover:bg-blue-600 text-sm font-semibold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleJobDelete(job._id)}
                  className="bg-red-500 text-white px-5 py-1.5 rounded-md hover:bg-red-600 text-sm font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8">
          <Pagination
            pageCount={Math.ceil(postedJobs.length / jobsPerPage)}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            currentPage={currentPage}
          />
        </div>
      </>
    )}
  </div>
)}

{activeTab === 'applications' && (
  <div>
    <h2 className="text-xl font-bold text-blue-600 mb-4">Job Applications</h2>

    {applications.length === 0 ? (
      <p>No applications found.</p>
    ) : (
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Showing {indexOfFirstApplication + 1}–{Math.min(indexOfLastApplication, filteredApplications.length)} of {filteredApplications.length} applications
        </p>
        
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-4">
          <AutoSuggestInput
            placeholder="Filter by Job Title"
            fetchUrl={`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_SUGGESTIONS_ENDPOINT || '/api/applications/suggestions'}/jobs?employerId=${localStorage.getItem('userId')}`}
            onSelect={(val) => handleFilter('jobTitle', val)}
            value={filters.jobTitle}
          />
          <AutoSuggestInput
            placeholder="Filter by Applicant"
            fetchUrl={`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_SUGGESTIONS_ENDPOINT || '/api/applications/suggestions'}/applicants?employerId=${localStorage.getItem('userId')}`}
            onSelect={(val) => handleFilter('applicant', val)}
            value={filters.applicant}
          />
          <AutoSuggestInput
            placeholder="Filter by Location"
            fetchUrl={`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_SUGGESTIONS_ENDPOINT || '/api/applications/suggestions'}/locations?employerId=${localStorage.getItem('userId')}`}
            onSelect={(val) => handleFilter('location', val)}
            value={filters.location}
          />
          <select 
            className="border border-gray-300 rounded-md p-2 w-48"
            value={filters.status}
            onChange={(e) => handleFilter('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="reviewed">Reviewed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => setFilters({ jobTitle: '', applicant: '', location: '', status: '' })}
            className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm"
          >
            Clear Filters
          </button>
        </div>

        <div className="space-y-4">
          {currentApplications.map((app) => (
            <div
              key={app._id}
              className="bg-white p-4 rounded-lg border border-gray-300 shadow"
            >
              {/* Application Method Badge */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-blue-700">
                    Applicant: {app?.applicant?.user?.name || app?.applicantInfo?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Email: {app?.applicant?.user?.email || app?.applicantInfo?.email}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  app.applicationMethod === 'quick-apply' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {app.applicationMethod === 'quick-apply' ? 'Quick Apply' : 'Full Profile'}
                </span>
              </div>

              {/* Resume Status */}
              <div className="mb-2">
                {app.resume && app.resume.webViewLink ? (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-green-700 font-medium">
                      Resume uploaded: {app.resume.fileName || 'Resume.pdf'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">
                      {app.applicationMethod === 'quick-apply' 
                        ? 'No resume file available' 
                        : 'Resume will be generated from profile'
                      }
                    </span>
                  </div>
                )}
              </div>

              {app.coverLetter && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700"><strong>Cover Letter:</strong></p>
                  <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">{app.coverLetter}</p>
                </div>
              )}

              {app.job && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700"><strong>Job Title:</strong> {app.job.title}</p>
                  <p className="text-sm text-gray-600"><strong>Description:</strong> {app.job.description.slice(0, 100)}</p>
                  <p className="text-sm text-gray-600"><strong>Location:</strong> {app.job.location}</p>
                </div>
              )}

              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                  app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Status: {app.status || 'pending'}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {app.status === 'reviewed' ? (
                  <span className="bg-yellow-700 text-white px-3 py-1 rounded text-sm cursor-default">Reviewed</span>
                ) : (
                  <button
                    onClick={() => {
                      const applicantEmail = app?.applicant?.user?.email || app?.applicantInfo?.email;
                      const applicantName = app?.applicant?.user?.name || app?.applicantInfo?.name;
                      
                      sendEmail(
                        applicantEmail,
                        `Application Status - ${app.job.title}`,
                        `Hi ${applicantName},\n\nYour application has been reviewed for the position of ${app.job.title}. We will get back to you shortly.\n\nBest regards,\nRecruitment Team`
                      );
                      updateApplicationStatus(app._id, 'reviewed');
                    }}
                    className={`px-3 py-1 rounded text-sm text-white ${app.status === 'rejected' ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                    disabled={app.status !== 'pending'}
                  >
                    Mark as Reviewed
                  </button>
                )}

                <button
                  onClick={() => handleViewResume(app)}
                  className={`px-3 py-1 rounded text-sm text-white ${
                    (app.applicationMethod === 'quick-apply' && (!app.resume || !app.resume.webViewLink))
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  disabled={app.applicationMethod === 'quick-apply' && (!app.resume || !app.resume.webViewLink)}
                  title={
                    (app.applicationMethod === 'quick-apply' && (!app.resume || !app.resume.webViewLink))
                      ? 'No resume file available for this quick application'
                      : app.resume && app.resume.webViewLink
                        ? 'View uploaded resume file'
                        : 'Generate resume from profile details'
                  }
                >
                  View Resume
                </button>

                {app.status === 'shortlisted' ? (
                  <span className="bg-green-600 text-white px-3 py-1 rounded text-sm cursor-default">Shortlisted</span>
                ) : (
                  <button
                    onClick={() => {
                      const applicantEmail = app?.applicant?.user?.email || app?.applicantInfo?.email;
                      const applicantName = app?.applicant?.user?.name || app?.applicantInfo?.name;
                      
                      sendEmail(
                        applicantEmail,
                        `Application Status - ${app.job.title}`,
                        `Hi ${applicantName},\n\nThank you for your application for the position of ${app.job.title}. Congratulations! You've been shortlisted for this position. We will contact you soon with the next steps.\n\nBest regards,\nRecruitment Team`
                      );
                      updateApplicationStatus(app._id, 'shortlisted');
                    }}
                    className={`px-3 py-1 rounded text-sm text-white ${app.status === 'rejected' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-800 hover:bg-green-600'}`}
                    disabled={app.status !== 'pending'}
                  >
                    Shortlist
                  </button>
                )}

                {app.status === 'rejected' ? (
                  <span className="bg-red-300 text-white px-3 py-1 rounded text-sm cursor-default">Rejected</span>
                ) : (
                  <button
                    onClick={() => {
                      const applicantEmail = app?.applicant?.user?.email || app?.applicantInfo?.email;
                      const applicantName = app?.applicant?.user?.name || app?.applicantInfo?.name;
                      
                      sendEmail(
                        applicantEmail,
                        `Application Status - ${app.job.title}`,
                        `Hi ${applicantName},\n\nThank you for your application for the position of ${app.job.title}. Unfortunately at this time, we are unable to move forward with your application. We encourage you to stay connected with us for future opportunities.\n\nBest regards,\nRecruitment Team`
                      );
                      updateApplicationStatus(app._id, 'rejected');
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    disabled={app.status !== 'pending'}
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Pagination
            pageCount={Math.ceil(filteredApplications.length / applicationsPerPage)}
            onPageChange={({ selected }) => setApplicationsPage(selected)}
            currentPage={applicationsPage}
          />
        </div>
      </div>
    )}
  </div>
)}

        </section>
      </main>
    </div>
  );
};

export default EmployerDashboard;
