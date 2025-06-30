import { useState, useEffect } from 'react';

const ProfilePicture = ({ 
  size = 'md', 
  className = '', 
  showBorder = false, 
  clickable = false,
  onClick = null 
}) => {
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'User';
  
  const [profilePicture, setProfilePicture] = useState('/images/avatar.png');

  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  useEffect(() => {
    const getProfilePicture = () => {
      const savedPicture = localStorage.getItem(`profilePicture_${userId}`);
      return savedPicture || '/images/avatar.png';
    };

    setProfilePicture(getProfilePicture());

    // Listen for profile picture changes
    const handleStorageChange = () => {
      setProfilePicture(getProfilePicture());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event when profile picture changes within the same tab
    window.addEventListener('profilePictureChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profilePictureChanged', handleStorageChange);
    };
  }, [userId]);

  const handleImageError = (e) => {
    e.target.src = '/images/avatar.png';
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${showBorder ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-100' : ''} 
        ${clickable ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''} 
        ${className}
      `}
      onClick={handleClick}
    >
      <img
        src={profilePicture}
        alt={`${userName}'s profile`}
        className="w-full h-full rounded-full object-cover shadow-sm"
        onError={handleImageError}
        title={userName}
      />
    </div>
  );
};

export default ProfilePicture; 