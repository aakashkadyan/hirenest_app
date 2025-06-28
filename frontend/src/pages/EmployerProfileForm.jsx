import React, { useState, useEffect } from 'react';
import GoBackButton from '../components/GoBackButton';

const EmployerProfileForm = () => {
  const userId = localStorage.getItem('userId');
  const [profileId, setProfileId] = useState(null); // track existing profile
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    description: '',
    location: '',
    companySize: '',
    user: userId,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_EMPLOYER_PROFILE_ENDPOINT || '/api/employerprofile'}/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            companyName: data.companyName || '',
            industry: data.industry || '',
            website: data.website || '',
            description: data.description || '',
            location: data.location || '',
            companySize: data.companySize || '',
            user: data.user,
          });
          setProfileId(data._id); // store _id for PUT
        }
      } catch (error) {
        console.error('Error fetching employer profile:', error);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = profileId
      ? `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_EMPLOYER_PROFILE_ENDPOINT || '/api/employerprofile'}/${profileId}`
      : `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_EMPLOYER_PROFILE_ENDPOINT || '/api/employerprofile'}`;

    const method = profileId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to submit form');

      const result = await res.json();
      alert(`Profile ${profileId ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form.');
    }
  };

  return (
     
    <div className="p-4">
      <GoBackButton />   
    
    <form
      onSubmit={handleSubmit}
      className="space-y-6 mt-10 mb-10 p-6 max-w-2xl mx-auto bg-blue-50 border border-blue-400 rounded-lg shadow-md"
    >
      
      <h2 className="text-xl font-semibold text-center text-blue-600">Company Profile</h2>

      <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} />
      <SelectField label="Industry" name="industry" value={formData.industry} onChange={handleInputChange}
        options={["Technology", "Finance", "Healthcare", "Education", "Manufacturing"]} />
      <InputField label="Website URL" name="website" value={formData.website} onChange={handleInputChange} type="url" />
      <TextAreaField label="Company Description" name="description" value={formData.description} onChange={handleInputChange} />
      <InputField label="Location" name="location" value={formData.location} onChange={handleInputChange} />
      <SelectField label="Company Size" name="companySize" value={formData.companySize} onChange={handleInputChange}
        options={["1-10", "11-50", "51-200", "201-500", "501-1000", "1001+"]} />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {profileId ? 'Update' : 'Submit'}
      </button>
    </form>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      className="mt-1 w-full p-2 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
  </div>
  
);


export default EmployerProfileForm;
