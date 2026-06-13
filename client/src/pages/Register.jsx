import React, { useState } from "react";
import axios from "axios";
import AuthLayout from "../layouts/AuthLayout";

function Register() {
  // Initialisation de l'état du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    confirmPassword: "",
    telephone: "",
    role: "admin", 
  });

  // Gestion des changements dans les champs de saisie
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification de la correspondance des mots de passe
    if (formData.motDePasse !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      // تنظيف الإيميل وتحويله لحروف صغيرة لتجنب المشاكل قبل الإرسال
      const cleanEmail = formData.email.toLowerCase().trim();

      const dataToSend = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: cleanEmail,
        motDePasse: formData.motDePasse,
        telephone: formData.telephone,
        role: formData.role
      };

      // 🌟 تحديد الرابط ديناميكياً على حساب واش PC أو هاتف
      const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'http://192.168.0.107:5000';

      const response = await axios.post(`${API_BASE_URL}/api/auth/register-admin`, dataToSend);
      
      if (response.status === 201 || response.status === 200) {
        alert("Compte Administrateur créé avec succès !");
      }
    } catch (err) {
      console.error("Détails de l'erreur API:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Erreur lors de la création du compte.";
      alert("Erreur: " + errorMsg);
    }
  };

  // Styles Tailwind pour l'interface
  const inputClass = "w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder:text-gray-400 text-slate-800";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <AuthLayout 
      title="Inscription" 
      subtitle="Créez votre accès Administrateur SmartHome"
    >
      {/* Indicateur visuel du rôle par défaut */}
      <div className="mb-6 inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">
        Rôle : Administrateur par défaut
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Champs Prénom et Nom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Prénom</label>
            <input type="text" name="prenom" placeholder="Ex: Imane" onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Nom</label>
            <input type="text" name="nom" placeholder="Ex: Bellam" onChange={handleChange} className={inputClass} required />
          </div>
        </div>

        {/* Champ Email */}
        <div>
          <label className={labelClass}>Adresse E-mail</label>
          <input type="email" name="email" placeholder="admin@maison.ma" onChange={handleChange} className={inputClass} required />
        </div>

        {/* Champ Téléphone */}
        <div>
          <label className={labelClass}>Téléphone</label>
          <input type="text" name="telephone" placeholder="06..." onChange={handleChange} className={inputClass} required />
        </div>

        {/* Champs Mots de passe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Mot de passe</label>
            <input type="password" name="motDePasse" onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Confirmation</label>
            <input type="password" name="confirmPassword" onChange={handleChange} className={inputClass} required />
          </div>
        </div>

        {/* Bouton de validation */}
        <button 
          type="submit" 
          className="w-full p-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md mt-6 active:scale-[0.98]"
        >
          S'INSCRIRE EN TANT QU'ADMIN
        </button>

        {/* Lien de redirection vers la connexion */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Déjà membre ? <a href="/login" className="text-blue-600 font-bold hover:underline">Se connecter</a>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;