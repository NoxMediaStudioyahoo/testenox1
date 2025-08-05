import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#0F101A] text-white">
    <main className="flex-1 w-full">
      {children}
    </main>
  </div>
);

export default Layout;
