// src/config/adminConfig.js
// Simple super admin configuration

// Add your Firebase user UID here
// You can find this in Firebase Console > Authentication > Users
export const SUPER_ADMIN_UIDS = [
    'EZTtNncUcHYc5TikzewnB0tYmz03', // Your super admin UID
    // You can add more trusted admin UIDs here later if needed
  ];
  
  // Helper function to check if current user is super admin
  export const isSuperAdmin = (user) => {
    if (!user) return false;
    return SUPER_ADMIN_UIDS.includes(user.uid);
  };
  
  // You can also use email-based check if you prefer:
  export const SUPER_ADMIN_EMAILS = [
    'your-email@example.com', // Replace with your actual email
  ];
  
  export const isSuperAdminByEmail = (user) => {
    if (!user?.email) return false;
    return SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
  };