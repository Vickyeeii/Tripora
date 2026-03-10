import React from 'react';

const InlineError = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
};

export default InlineError;
