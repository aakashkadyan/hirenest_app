import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const  UserProfile = ()=> {
  const userName = localStorage.getItem('userName');  
  const userEmail = localStorage.getItem('userEmail');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleHelpClick = () => {
    navigate('/help');
  };


  return (
    <div className="relative inline-block text-left ml-200">
      <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 hover:rounded-lg p-2 transition-all duration-200 ease-in-out hover:shadow-md" onClick={() => setOpen(!open)}>
    
        <img
          src="/images/avatar.png" // Replace with actual avatar
          alt="User Avatar"
          className="w-8 h-8 rounded-full hover:scale-105 transition-transform duration-200"
        />
        <ChevronDown size={18} className="hover:text-blue-600 transition-colors duration-200" />
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg z-50 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-50 transition-colors duration-150">
            <img
              src="/images/avatar.png"
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}</span>
              <span className="text-xs text-gray-500">{userEmail}</span>
            </div>
          </div>

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
            <DropdownItem onClick ={handleLogout} label="Log out" icon={<LogOut size={16} />} />
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