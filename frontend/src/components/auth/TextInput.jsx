import React from 'react';

const TextInput = ({ label, type = 'text', value, onChange, error, ...props }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-xl border ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-neutral-200 focus:ring-primary-500'
        } focus:outline-none focus:ring-2 transition-all text-neutral-900 placeholder:text-neutral-400`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TextInput;
