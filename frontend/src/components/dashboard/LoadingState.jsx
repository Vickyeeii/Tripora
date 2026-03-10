import React from 'react';

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-neutral-500">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingState;
