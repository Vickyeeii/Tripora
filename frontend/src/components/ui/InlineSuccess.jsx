import React from 'react';

const InlineSuccess = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
      {message}
    </div>
  );
};

export default InlineSuccess;
