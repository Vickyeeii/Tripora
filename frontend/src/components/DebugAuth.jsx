import React, { useState, useEffect } from 'react';

const DebugAuth = () => {
  const [authData, setAuthData] = useState({});

  useEffect(() => {
    const checkAuth = () => {
      setAuthData({
        access_token: localStorage.getItem('access_token') ? 'Stored ✓' : 'Not found ✗',
        user_role: localStorage.getItem('user_role') || 'Not found ✗',
        token_preview: localStorage.getItem('access_token')?.substring(0, 20) + '...' || 'N/A'
      });
    };
    
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-neutral-900 text-white p-4 rounded-lg text-xs font-mono shadow-lg max-w-xs">
      <div className="font-bold mb-2">🔐 Auth Debug</div>
      <div className="space-y-1">
        <div>Token: {authData.access_token}</div>
        <div>Role: {authData.user_role}</div>
        <div className="text-neutral-400 text-[10px] break-all">
          {authData.token_preview}
        </div>
      </div>
      <button 
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        className="mt-2 text-red-400 hover:text-red-300 text-[10px]"
      >
        Clear & Reload
      </button>
    </div>
  );
};

export default DebugAuth;
