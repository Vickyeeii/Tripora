import React from 'react';

const StatRow = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
      {stats.map((stat, index) => (
        <div key={index} className="space-y-2">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className="text-3xl font-semibold text-neutral-900">
            {stat.value ?? '\u2014'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatRow;
