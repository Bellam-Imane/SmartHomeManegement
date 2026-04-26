import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

function App() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/status')
      .then(res => setStatus(res.data.message))
      .catch(err => setStatus("Error: Backend is not responding"));
  }, []);

  return (
    <Router>

      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
        <div style={{ 
          marginBottom: '20px', padding: '10px', borderRadius: '5px',
          backgroundColor: status.includes('successfully') ? '#e6fffa' : '#fff5f5',
          border: '1px solid #ccc'
        }}>
          Backend Status: <strong>{status}</strong>
        </div>

        <Routes>
         
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />

          
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </div>

    </Router>

    
  );
}

export default App;