// src/utils/nameFormatter.js
// Utility function to format names for privacy in reviews

export const formatReviewerName = (fullName) => {
    if (!fullName || fullName === 'Anonymous User') {
      return 'Anonymous';
    }
    
    // Remove extra spaces and trim
    const cleanName = fullName.trim().replace(/\s+/g, ' ');
    
    // Split the name into parts
    const nameParts = cleanName.split(' ');
    
    if (nameParts.length === 0 || !nameParts[0]) {
      return 'Anonymous';
    }
    
    // Get first name
    const firstName = nameParts[0];
    
    // If there's a last name, get just the first letter
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
      const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();
      return `${firstName} ${lastInitial}.`;
    }
    
    // If only one name, return just that
    return firstName;
  };
  
  // Examples of how this works:
  // "John Smith" -> "John S."
  // "Mary Jane Watson" -> "Mary W."
  // "John" -> "John"
  // "Anonymous User" -> "Anonymous"
  // "" -> "Anonymous"
  // "  John   Doe  " -> "John D."