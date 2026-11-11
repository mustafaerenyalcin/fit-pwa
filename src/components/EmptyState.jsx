import React from 'react';

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="emptyState">
      {Icon && <Icon size={48} strokeWidth={1} />}
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}
