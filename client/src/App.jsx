import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ShopDetailScreen from './pages/ShopDetailScreen';
import InstallPWA from './components/InstallPWA';

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Router>
      <InstallPWA />
      <Routes>
        <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
        <Route path="/shop/:id" element={isAuthenticated ? <ShopDetailScreen /> : <Navigate to="/auth" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />} />
      </Routes>
    </Router>
  );
}

export default App;
