import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';
import bgLogin from '../assets/background-login.jpeg';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return setError("Les mots de passe ne sont pas identiques");
        try {
            await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            setMessage("Succès ! Votre mot de passe a été changé.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) { 
            setError("Le lien a expiré ou est invalide."); 
        }
    };

    return (
        <div className="reset-main-wrapper">
            {/* Côté gauche (photo)*/}
            <div className="reset-visual-section" style={{ backgroundImage: `url(${bgLogin})` }}>
                <div className="reset-visual-overlay">
                    <h1>SmartHome</h1>
                    <p>Sécurisez votre compte avec un nouveau mot de passe.</p>
                </div>
            </div>

            {/* Côté droit (formulaire)*/}
            <div className="reset-form-section">
                <div className="reset-form-container">
                    <h2>Nouveau mot de passe</h2>
                    <p style={{color: '#718096', marginBottom: '20px'}}>Veuillez saisir votre nouveau mot de passe ci-dessous.</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="reset-input-group">
                            <label>Nouveau mot de passe</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="reset-input-group">
                            <label>Confirmer le mot de passe</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <button type="submit" className="reset-btn-dark">Réinitialiser</button>
                    </form>

                    {message && <div className="msg-s">{message}</div>}
                    {error && <div className="msg-e">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;