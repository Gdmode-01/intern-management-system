import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import InternDashboard from './components/InternDashboard';
import HrDashboard from './components/HrDashboard';
import RmDashboard from './components/RmDashboard';
import OperationsDashboard from './components/OperationsDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Dashboards */}
        <Route path="/operations/dashboard" element={<OperationsDashboard />} />
        <Route path="/hr/dashboard" element={<HrDashboard />} />
        <Route path="/rm/dashboard" element={<RmDashboard />} />
        <Route path="/intern/dashboard" element={<InternDashboard />} />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;