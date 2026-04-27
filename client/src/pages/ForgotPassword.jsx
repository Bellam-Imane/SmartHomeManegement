import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';
import bgLogin from '../assets/background-login.jpeg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-passwords', { email });
            if (response.status === 200) {
                setMessage("Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
            }
        } catch (err) {
            setError("Erreur : Impossible de trouver un utilisateur avec cet e-mail.");
        }
    };

    return (
        <div className="forgot-main-wrapper">
            <div className="forgot-visual-section" style={{ backgroundImage: `url(${bgLogin})` }}>
                <div className="forgot-visual-overlay">
                    <h1 className="text-6xl font-bold mb-4 tracking-tight">SmartHome</h1>
                    <p className="text-xl opacity-90 max-w-md">Gérez votre maison avec intelligence.</p>
                </div>
            </div>
            <div className="forgot-form-section">
                <div className="forgot-form-container">
                    <h2>Récupération</h2>
                    <form onSubmit={handleFormSubmit}>
                        <div className="forgot-input-group">
                            <label>Adresse E-mail</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" required />
                        </div>
                        <button type="submit" className="forgot-btn-dark">Envoyer</button>
                    </form>
                    {error && <div className="alert-box error">{error}</div>}
                    {message && <div className="alert-box success">{message}</div>}
                    <div style={{marginTop: '20px'}}><a href="/login" style={{color: '#4a51e0', textDecoration: 'none'}}>Retour à la connexion</a></div>
                </div>
            </div>
        </div>
    );
};
export default ForgotPassword;