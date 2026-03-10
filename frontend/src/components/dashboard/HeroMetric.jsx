import React from 'react';

const HeroMetric = ({ label, value, subtitle }) => {
  return (
    <div className="mb-16">
      <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-3">
        {label}
      </p>
      <div className="text-7xl lg:text-8xl font-semibold text-neutral-900 tracking-tight mb-4">
        {value ?? '\u2014'}
      </div>
      {subtitle && (
        <p className="text-lg text-neutral-600">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HeroMetric;
