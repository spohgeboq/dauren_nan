import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Products from './components/Products';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const token = localStorage.getItem('token');

  if (token) {
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
