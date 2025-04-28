// src/components/Layout.jsx
import React from 'react';

function Layout({ children }) {
  return (
    <div className="page-layout">
      <div className="container">
        {children}
      </div>
    </div>
  );
}

export default Layout;