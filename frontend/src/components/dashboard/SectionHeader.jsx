import React from 'react';

const SectionHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-12">
      <h1 className="text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight mb-3">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-neutral-500 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
