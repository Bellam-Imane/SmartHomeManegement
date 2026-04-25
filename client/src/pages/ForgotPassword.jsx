import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

/**
 * Composant ForgotPassword
 * Permet à l'utilisateur de demander la réinitialisation de son mot de passe
 */
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // Appel à l'API backend 
            const response = await axios.post('http://localhost:5000/api/auth/forgot-passwords', { email });
            
            if (response.status === 200) {
                setMessage("Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
            }
        } catch (err) {
            setError("Erreur : Impossible de trouver un utilisateur avec cet e-mail.");
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Récupération de compte</h2>
                <p>Veuillez saisir votre e-mail pour réinitialiser votre mot de passe Smart Home.</p>
                
                <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                        <label>Adresse E-mail</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemple@domaine.com"
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-submit">
                        Envoyer les instructions
                    </button>
                </form>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="footer-links">
                    <a href="/login">Retour à la page de connexion</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;