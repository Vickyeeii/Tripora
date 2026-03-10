import React from 'react';

const InlineError = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
      {message}
    </div>
  );
};

export default InlineError;
