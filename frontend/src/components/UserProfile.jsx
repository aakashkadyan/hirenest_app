import { useState } from 'react';
import { ChevronDown, LogOut, Camera, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const userName = localStorage.getItem('userName');  
  const userEmail = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');
  const [open, setOpen] = useState(false);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  // Get profile picture from localStorage or use default
  const getProfilePicture = () => {
    const savedPicture = localStorage.getItem(`profilePicture_${userId}`);
    return savedPicture || '/images/avatar.png';
  };

  const [profilePicture, setProfilePicture] = useState(getProfilePicture());

  // Default avatar options
  const defaultAvatars = [
    '/images/avatar.png',
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=3b82f6&color=ffffff&size=200',
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=10b981&color=ffffff&size=200',
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=f59e0b&color=ffffff&size=200',
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=ef4444&color=ffffff&size=200',
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=8b5cf6&color=ffffff&size=200',
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=ec4899&color=ffffff&size=200',
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=14b8a6&color=ffffff&size=200',
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=f97316&color=ffffff&size=200',
  ];

  const handleProfilePictureChange = (newPicture) => {
    setProfilePicture(newPicture);
    localStorage.setItem(`profilePicture_${userId}`, newPicture);
    setShowProfilePicker(false);
    
    // Emit custom event to update other ProfilePicture components
    window.dispatchEvent(new Event('profilePictureChanged'));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleProfilePictureChange(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // Keep profile picture for next login (or remove it if you prefer)
    // localStorage.removeItem(`profilePicture_${userId}`);
    navigate('/login');
  };

  const handleHelpClick = () => {
    navigate('/help');
  };

  return (
    <div className="relative inline-block text-left ml-200">
      <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 hover:rounded-lg p-2 transition-all duration-200 ease-in-out hover:shadow-md" onClick={() => setOpen(!open)}>
        <div className="relative">
        <img
            src={profilePicture}
          alt="User Avatar"
            className="w-8 h-8 rounded-full hover:scale-105 transition-transform duration-200 object-cover"
            onError={(e) => {
              e.target.src = '/images/avatar.png';
            }}
        />
        </div>
        <ChevronDown size={18} className="hover:text-blue-600 transition-colors duration-200" />
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg z-50 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-50 transition-colors duration-150">
            <div className="relative">
            <img
                src={profilePicture}
              alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/avatar.png';
                }}
              />
              <button
                onClick={() => setShowProfilePicker(!showProfilePicker)}
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors duration-200"
                title="Change profile picture"
              >
                <Camera size={12} />
              </button>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}</span>
              <span className="text-xs text-gray-500">{userEmail}</span>
            </div>
          </div>

          {/* Profile Picture Picker */}
          {showProfilePicker && (
            <div className="px-4 py-3 border-b bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User size={16} />
                Choose Profile Picture
              </h4>
              
              <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded border border-blue-200">
                💡 Profile pictures are saved locally for UI enhancement only. They won't be stored on servers.
              </p>
              
              {/* Upload Custom Image */}
              <div className="mb-3">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="cursor-pointer bg-blue-500 text-white text-xs px-3 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 text-center">
                    📸 Upload Custom Image
                  </div>
                </label>
              </div>

              {/* Default Avatars */}
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {defaultAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleProfilePictureChange(avatar)}
                    className={`p-1 rounded-lg transition-all duration-200 ${
                      profilePicture === avatar 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/avatar.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-2 text-sm text-gray-700 space-y-2">
            <p className="text-gray-500 text-xs mt-2">Personal</p>
            {userRole !== 'employer' && (
              <DropdownItem label="Edit profile" onClick={() => navigate('/jobseekerform')} />
            )}

            {userRole !== 'jobseeker' && (
              <DropdownItem label="Edit profile" onClick={() => navigate('/employerprofileform')} />
            )}

            <div className="relative group">
              <DropdownItem 
                label="Notifications" 
                disabled={true}
              />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                Notification system is currently in Progress
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-4">Support</p>
            <DropdownItem label="Help" onClick={handleHelpClick} />
            <DropdownItem onClick={handleLogout} label="Log out" icon={<LogOut size={16} />} />
          </div>

          <div className="p-3">
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({ label, icon, onClick, disabled = false }) {
  return (
    <button 
      onClick={disabled ? undefined : onClick} 
      className={`w-full flex items-center gap-2 text-left px-2 py-1 rounded-md transition-all duration-150 ${
        disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'hover:bg-blue-50 hover:text-blue-600 hover:scale-[1.02]'
      }`}
      disabled={disabled}
    >
      {icon && icon}
      {label}
    </button>
  );
}

export default UserProfile;