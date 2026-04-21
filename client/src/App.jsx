import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState("جاري الاتصال...");

  useEffect(() => {
    
    axios.get('http://localhost:5000/test-db') 
      .then(res => {
        setStatus(res.data.message); 
      })
      .catch(err => {
        console.error(err);
        setStatus("Error: Backend is not responding");
      });
  }, []);

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Smart Home Web Application 🏠</h1>
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        border: '1px solid #ccc',
        borderRadius: '8px',
        display: 'inline-block',
        backgroundColor: status.includes('successfully') ? '#e6fffa' : '#fff5f5'
      }}>
        <p>Backend Status: <strong>{status}</strong></p>
      </div>
    </div>
  );
}

export default App;