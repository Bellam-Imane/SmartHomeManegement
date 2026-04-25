import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
/**
 * Main Application Component
 * Handles global routing and backend connectivity check
 */
function App() {
  const [status, setStatus] = useState("Connecting...");

  // Verify backend connectivity on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/status')
      .then(res => {
        setStatus(res.data.message);
      })
      .catch(err => {
        console.error("Backend Error:", err);
        setStatus("Error: Backend is not responding");
      });
  }, []);

  return (
    <Router>
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
        <h1>Smart Home Web Application 🏠</h1>
        
        {/* Connection Status Banner */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          borderRadius: '5px',
          backgroundColor: status.includes('successfully') ? '#e6fffa' : '#fff5f5',
          border: '1px solid #ccc'
        }}>
          Backend Status: <strong>{status}</strong>
        </div>

        {/* Application Routing Configuration */}
        <Routes>
          {/* Riham's Task: Forgot Password Route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Default Route */}
          <Route path="/" element={
            <div>
              <h2>Welcome to the Dashboard</h2>
              <p>Go to <a href="/forgot-password">Forgot Password</a> to test your page.</p>
            </div>
          } />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;