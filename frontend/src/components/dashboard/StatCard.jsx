import React from 'react';

const StatCard = ({ label, value, variant = 'default' }) => {
  const variants = {
    default: 'bg-white',
    primary: 'bg-primary-50',
    accent: 'bg-accent-50',
  };

  return (
    <div className={`${variants[variant]} rounded-2xl p-8 transition-all hover:shadow-lg hover:scale-[1.02]`}>
      <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
        {label}
      </p>
      <p className="text-4xl lg:text-5xl font-semibold text-neutral-900">
        {value ?? '—'}
      </p>
    </div>
  );
};

export default StatCard;
