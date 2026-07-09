import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Products from './components/Products';
import AdminDashboard from './components/AdminDashboard';
import BakerWorkspace from './components/BakerWorkspace/BakerWorkspace';
import CashierWorkspace from './components/CashierWorkspace/CashierWorkspace';
import CourierWorkspace from './components/CourierWorkspace/CourierWorkspace';

function App() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let userRole = '';

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userRole = user.role;
    } catch (e) {
      console.error('Failed to parse user from localStorage');
    }
  }

  if (token) {
    if (userRole === 'BAKER') {
      return <BakerWorkspace />;
    }
    if (userRole === 'CASHIER') {
      return <CashierWorkspace />;
    }
    if (userRole === 'DRIVER') {
      return <CourierWorkspace />;
    }
    // Для ADMIN, MANAGER и других пока показываем AdminDashboard
    return <AdminDashboard />;
  }

  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Products />
    </>
  );
}

export default App;
