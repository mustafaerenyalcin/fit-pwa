import React from 'react';

export default function Panel({ title, sub, children, action }) {
  return (
    <section className="panel">
      <div className="panelHeading">
        <div>
          <h3>{title}</h3>
          {sub && <p>{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
