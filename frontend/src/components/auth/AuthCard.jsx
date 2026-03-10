import React from 'react';

const AuthCard = ({ children }) => {
  return (
    <div className="bg-white rounded-3xl p-10 lg:p-12">
      {children}
    </div>
  );
};

export default AuthCard;
