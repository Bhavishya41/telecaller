import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import InstallPWA from './components/InstallPWA';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <InstallPWA />
      <Routes>
        <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />} />
      </Routes>
    </Router>
  );
}

export default App;
