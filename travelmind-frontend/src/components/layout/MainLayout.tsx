import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default MainLayout;
