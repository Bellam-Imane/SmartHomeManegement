import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import backgroundLogin from '../assets/background-login.jpeg';



const Login = () => {
    const [email, setEmail] = useState('');
    const [motDePasse, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();

    console.log("FORM SUBMITTED"); 

    try {
        console.log("DATA:", { email, motDePasse });

        const response = await axios.post(
            'http://localhost:5000/api/auth/login',
            { email, motDePasse }
        );

        console.log("RESPONSE:", response.data);

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert('Connexion réussie !');

        navigate('/home/Dashboard');

    } catch (error) {
        console.log("ERROR:", error.response?.data || error.message);
        alert('Email ou Mot de passe incorrect!');
    }
};

    return (
        <div style={styles.container}>
            {/* Left Side: Welcome and Branding */}
            <div style={styles.leftSide}>
                <div style={styles.overlay}>
                    <h1 style={styles.logoText}>SmartHome</h1>
                    <p style={styles.slogan}>Gérez votre maison avec intelligence.</p>
                </div>
            </div>

            {/* Right Side: Authentication Form */}
            <div style={styles.rightSide}>
                <div style={styles.formCard}>
                    <h2 style={styles.title}>Connexion</h2>
                    <p style={styles.subtitle}>Entrez vos informations ci-dessous.</p>

                    <form onSubmit={handleLogin} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Adresse Email</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Mot de passe</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={motDePasse}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.forgotPassContainer}>
                            <Link to="/forgot-password" style={styles.link}>Mot de passe oublié?</Link>
                        </div>

                        <button type="submit" style={styles.button}>Se connecter</button>
                    </form>

                    <p style={styles.footerText}>
                        Vous n'avez pas de compte? <Link to="/register" style={styles.linkBold}>S'inscrire</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Component Styles
const styles = {
    container: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
    leftSide: { flex: 1, backgroundColor: '#1a1a1a', backgroundImage: `url(${backgroundLogin})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: 'white' },
    logoText: { fontSize: '3rem', fontWeight: '800', marginBottom: '10px' },
    slogan: { fontSize: '1.2rem', opacity: 0.9 },
    rightSide: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
    formCard: { width: '100%', maxWidth: '400px', padding: '20px' },
    title: { fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '8px' },
    subtitle: { color: '#6b7280', marginBottom: '32px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#374151' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' },
    forgotPassContainer: { textAlign: 'right', marginBottom: '24px' },
    link: { color: '#4f46e5', textDecoration: 'none', fontSize: '0.875rem' },
    linkBold: { color: '#4f46e5', textDecoration: 'none', fontWeight: '700' },
    button: { width: '100%', padding: '14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.3s' },
    footerText: { marginTop: '24px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }
};

export default Login;