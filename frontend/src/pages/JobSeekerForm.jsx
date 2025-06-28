import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GoBackButton from '../components/GoBackButton';
import UserProfile from '../components/UserProfile';

const JobSeekerForm = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isProfileExists, setIsProfileExists] = useState(false);
  const [pendingJob, setPendingJob] = useState(null);

  const [formData, setFormData] = useState({
    user: userId,
    bio: '',
    skills: [],
    experience: [{ company: '', role: '', startDate: '', endDate: '', description: '' }],
    education: [{ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }],
    resume: null,
    resumeFileName: null,
    existingResumeUrl: null,
    jobPreferences: {
      preferredJobType: 'full-time',
      preferredLocation: '',
      expectedSalary: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBSEEKERS_ENDPOINT || '/api/jobseekers'}/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            bio: data.bio || '',
            skills: data.skills || [],
            experience: data.experience?.length ? data.experience : prev.experience,
            education: data.education?.length ? data.education : prev.education,
            jobPreferences: {
              preferredJobType: data.jobPreferences?.preferredJobType || 'full-time',
              preferredLocation: data.jobPreferences?.preferredLocation || '',
              expectedSalary: data.jobPreferences?.expectedSalary || ''
            },
            resume: null,
            resumeFileName: null,
            existingResumeUrl: data.resume || null,
            updatedAt: data.updatedAt
          }));
          setIsProfileExists(true); // 👈 mark profile as existing
        }
      } catch (err) {
        console.error('Error fetching job seeker data:', err);
      }
    };
  
    if (userId) {
      fetchProfile();
    }

    // Check for pending job application
    const pendingJobData = localStorage.getItem('pendingJobApplication');
    if (pendingJobData) {
      try {
        const job = JSON.parse(pendingJobData);
        setPendingJob(job);
        toast.info(`After creating your profile, you'll automatically apply for: ${job.title}`);
      } catch (error) {
        console.error('Error parsing pending job application:', error);
        localStorage.removeItem('pendingJobApplication');
      }
    }
  }, [userId, navigate]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      resume: file || null,
      resumeFileName: file ? file.name : null
    }));
  };

  const updateNestedArray = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setMessage(''); // Clear any previous messages
  
    try {
      // Validation checks
      if (!formData.user) {
        setError('User ID is missing. Please log in again.');
        return;
      }

      // Ensure skills is always an array
      let skillsArray = [];
      if (Array.isArray(formData.skills)) {
        skillsArray = formData.skills.filter(skill => skill.trim() !== '');
      } else if (typeof formData.skills === 'string') {
        skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
      }

      // Validate experience data
      const validExperience = formData.experience.filter(exp => 
        exp.company.trim() !== '' || exp.role.trim() !== '' || exp.description.trim() !== ''
      );

      // Validate education data  
      const validEducation = formData.education.filter(edu => 
        edu.institution.trim() !== '' || edu.degree.trim() !== '' || edu.fieldOfStudy.trim() !== ''
      );

      const data = new FormData();
      data.append('user', formData.user);
      data.append('bio', formData.bio || '');
      data.append('skills', JSON.stringify(skillsArray));
      data.append('experience', JSON.stringify(validExperience));
      data.append('education', JSON.stringify(validEducation));
      data.append('jobPreferences', JSON.stringify({
        preferredJobType: formData.jobPreferences.preferredJobType,
        preferredLocation: formData.jobPreferences.preferredLocation,
        expectedSalary: formData.jobPreferences.expectedSalary
      }));

      if (formData.resume && formData.resume instanceof File) {
        data.append('resume', formData.resume);
        data.append('resumeFileName', formData.resumeFileName || formData.resume.name);
      } else {
        data.append('resumeFileName', '');
      }

      const url = formData._id 
        ? `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBSEEKERS_ENDPOINT || '/api/jobseekers'}/${formData.user}`
        : `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBSEEKERS_ENDPOINT || '/api/jobseekers'}`;
      
      const method = formData._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save profile');
      }

      console.log('Profile saved successfully:', result);
      setMessage(formData._id ? 'Profile updated successfully!' : 'Profile created successfully!');
      
      // Handle pending job application
      if (pendingJob && !formData._id) {
        try {
          // Get the newly created profile
          const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_JOBSEEKERS_ENDPOINT || '/api/jobseekers'}/${formData.user}`);
          const profileData = await profileRes.json();
          
          if (profileRes.ok && profileData._id) {
            // Submit the pending job application
            const applicationResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APPLICATIONS_ENDPOINT || '/api/applications'}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                job: pendingJob._id,
                applicant: profileData._id,
                resume: profileData._id,
                coverLetter: `I am genuinely excited about the opportunity to contribute to the ${pendingJob.title} role, and I am confident that my skills and experience align well with your expectations.`,
              }),
            });

            const applicationData = await applicationResponse.json();
            
            if (applicationResponse.ok) {
              // Update applied jobs in localStorage
              const userId = localStorage.getItem('userId');
              const appliedKey = `appliedJobs_${userId}`;
              const appliedJobs = JSON.parse(localStorage.getItem(appliedKey)) || [];
              const updatedApplied = [...appliedJobs, { ...pendingJob, status: 'pending' }];
              localStorage.setItem(appliedKey, JSON.stringify(updatedApplied));
              
              // Clear pending application
              localStorage.removeItem('pendingJobApplication');
              setPendingJob(null);
              
              toast.success(`Profile created and application submitted for ${pendingJob.title}!`);
              
              setTimeout(() => {
                navigate('/jobseekerdashboard');
              }, 2000);
              return;
            } else {
              console.error('Failed to submit application:', applicationData);
              toast.error('Profile created but failed to submit job application. You can apply manually from your dashboard.');
            }
          }
        } catch (appError) {
          console.error('Error submitting pending application:', appError);
          toast.error('Profile created but failed to submit job application. You can apply manually from your dashboard.');
        }
      }

      setTimeout(() => {
        navigate('/jobseekerdashboard');
      }, 2000);

    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile. Please try again.');
    }
  };
    
  


  return (
    <div className='p-10'>
      {/* Simple Header with Logo and UserProfile */}
      <header className="bg-white shadow p-4 flex justify-between items-center mb-6">
        <img
          src="/images/hirenest-logo-new.png"
          alt="HireNest Logo"
          className="h-auto max-h-10 w-auto object-contain"
        />
        <div className="flex items-end ml-50">
          <UserProfile />
        </div>
      </header>

      <GoBackButton />
      
      {/* Pending Job Application Banner */}
      {pendingJob && (
        <div className="mt-4 mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Job Application Pending
              </h3>
              <p className="text-sm text-blue-700">
                After creating your profile, you'll automatically apply for: <strong>{pendingJob.title}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 mt-10 mb-10 p-6 max-w-2xl mx-auto bg-blue-50 border border-blue-400 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center text-blue-600">Job Seeker Profile</h2>
        {formData.updatedAt && (
              <p className="text-sm text-gray-500 text-right mb-1">
                Last updated: {new Date(formData.updatedAt).toLocaleDateString()}
              </p>
            )}
              {message && (
                  <div className="text-blue-600 text-right font-semibold ml-1">
                    {message}
                  </div>
                )}
              {error && (
                  <div className="text-red-600 text-right font-semibold ml-1">
                    {error}
                  </div>
                )}
        
        {/* Bio */}
        <div>
        
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
          <input
            type="text"
            name="skills"
            value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
            onChange={(e) => {
              const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
              setFormData({ ...formData, skills: skillsArray });
            }}
            className="mt-1 w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
          {formData.experience.map((exp, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Company" value={exp.company}
                onChange={(e) => updateNestedArray("experience", idx, "company", e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="text" placeholder="Role" value={exp.role}
                onChange={(e) => updateNestedArray("experience", idx, "role", e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="date" placeholder="Start Date" value={exp.startDate}
                onChange={(e) => updateNestedArray("experience", idx, "startDate", e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="date" placeholder="End Date" value={exp.endDate}
                onChange={(e) => updateNestedArray("experience", idx, "endDate", e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <textarea placeholder="Description" value={exp.description}
                onChange={(e) => updateNestedArray("experience", idx, "description", e.target.value)}
                className="col-span-2 p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          ))}
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
          {formData.education.map((edu, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Institution" value={edu.institution}
                onChange={(e) => updateNestedArray("education", idx, "institution", e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="text" placeholder="Degree" value={edu.degree}
                onChange={(e) => updateNestedArray("education", idx, "degree", e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="text" placeholder="Field of Study" value={edu.fieldOfStudy}
                onChange={(e) => updateNestedArray("education", idx, "fieldOfStudy", e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="number" placeholder="Start Year" value={edu.startYear}
                onChange={(e) => updateNestedArray("education", idx, "startYear", e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="number" placeholder="End Year" value={edu.endYear}
                onChange={(e) => updateNestedArray("education", idx, "endYear", e.target.value)}
                className="p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          ))}
        </div>

        {/* Resume */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Attach Resume</label>
          
          {/* Show existing resume if it exists */}
          {formData.existingResumeUrl && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">Current Resume</span>
                </div>
                <a 
                  href={formData.existingResumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                >
                  View Resume
                </a>
              </div>
              <p className="text-xs text-green-600 mt-1">Upload a new file below to replace your current resume</p>
            </div>
          )}
          
          <div className="relative mt-1 w-full">
            <input
              id="resume-upload"
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleResumeUpload}
              className="hidden"
            />
            <label htmlFor="resume-upload" className="flex items-center px-4 py-2 bg-gray-100 border border-blue-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
              <span>{formData.resumeFileName || 'Upload or drag and drop'}</span>
            </label>
            <span className="block text-xs text-gray-500 mt-1">Use a PDF, doc, or docx file – make sure it's 2MB or less</span>
          </div>
        </div>

        {/* Job Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Job Type</label>
          <select
            name="preferredJobType"
            value={formData.jobPreferences.preferredJobType}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                jobPreferences: { ...prev.jobPreferences, preferredJobType: e.target.value }
              }))
            }
            className="mt-1 w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="remote">Remote</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Location</label>
          <input
            type="text"
            name="preferredLocation"
            value={formData.jobPreferences.preferredLocation}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                jobPreferences: { ...prev.jobPreferences, preferredLocation: e.target.value }
              }))
            }
            className="mt-1 w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Submit
        </button>
      </form>
    </div>
  );
};

export default JobSeekerForm;
