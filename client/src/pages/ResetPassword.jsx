import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams(); 
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Les mots de passe ne correspondent pas");
        }
        try {
            const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            setMessage("Mot de passe réinitialisé avec succès !");
            setTimeout(() => navigate('/login'), 3000); 
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la réinitialisation");
        }
    };

    return (
        <div className="reset-container">
            <div className="glass-card">
                <h2>Nouveau mot de passe</h2>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="password" 
                        placeholder="Nouveau mot de passe" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Confirmer le mot de passe" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit">Changer le mot de passe</button>
                </form>
                {message && <p className="success-msg">{message}</p>}
                {error && <p className="error-msg">{error}</p>}
            </div>
        </div>
    );
};

export default ResetPassword;