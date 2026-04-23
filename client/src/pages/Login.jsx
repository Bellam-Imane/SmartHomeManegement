import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // هاد السطر هو اللي كيعيط للفونكسيون اللي صاوبات إيمان
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token); // حفظ الساروت
      alert('مزيان! دخلتي');
      navigate('/home'); // صيفطيه للدار
    } catch (error) {
      alert('Email ou Mot de passe incorrect!');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;