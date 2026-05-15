import React from 'react';
import { Users, Edit2, Trash2, Plus } from 'lucide-react';

/**
 * COMPOSANT ROOMUSERSCARD : Gestion des utilisateurs d'une pièce
 * Aligné sur le modèle Mongoose 'User' et ses discriminateurs.
 */
const RoomUsersCard = ({ utilisateurs, onAddUser, onEditUser, onDeleteUser }) => {
  
  // Sécurisation des données : initialisation à vide si la prop est indéfinie
  const activeUsers = utilisateurs || [];

  return (
    <div className="w-full max-w-[380px] bg-white rounded-[40px] p-6 shadow-xl border border-gray-100 flex flex-col justify-between min-h-[420px] select-none font-sans">
      
      {/* ================= SECTION HEADER ================= */}
      <div className="flex items-start gap-4 px-1 mb-6">
        {/* Icône du groupe d'utilisateurs */}
        <div className="mt-1 text-gray-700">
          <Users size={24} />
        </div>
        <div className="flex flex-col text-left">
          <h3 className="text-xl font-bold text-gray-800 tracking-wide">
            Utilisateurs de la pièce
          </h3>
          {/* Affichage dynamique du nombre d'utilisateurs avec gestion du pluriel */}
          <span className="text-sm text-gray-400 font-medium mt-0.5">
            {activeUsers.length} utilisateur{activeUsers.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ================= SECTION LISTE DES UTILISATEURS ================= */}
      <div className="flex-1 flex flex-col gap-5 overflow-y-auto max-h-[240px] mb-6 px-1 pr-2 scrollbar-thin">
        {activeUsers.map((user, index) => {
          
          // Extraction des données basée sur l'objet intégré 'profile' du schéma Mongoose
          const nomComplet = user.profile ? `${user.profile.prenom} ${user.profile.nom}` : 'Utilisateur';
          const photoAvatar = user.profile?.photo || 'https://via.placeholder.com/150';
          
          // Utilisation de la clé 'userType' définie comme discriminatorKey dans le backend
          const typeRole = user.userType || 'Membre'; 

          return (
            <div key={user._id || index} className="flex items-center justify-between group">
              
              {/* Côté Gauche : Avatar, Nom complet et Type de compte (Discriminateur) */}
              <div className="flex items-center gap-4">
                {/* Image de profil tirée de profile.photo */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm bg-gray-100 border border-gray-200/60 shrink-0">
                  <img 
                    src={photoAvatar} 
                    alt={nomComplet} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Nom et libellé du rôle avec coloration conditionnelle selon le type */}
                <div className="flex flex-col text-left">
                  <span className="text-base font-bold text-gray-800 leading-snug">
                    {nomComplet}
                  </span>
                  <span className={`text-xs font-semibold tracking-wide mt-0.5 ${
                    typeRole === 'Administrateur' ? 'text-amber-600' : 
                    typeRole === 'Invite' ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {/* Traduction visuelle : L'administrateur de la maison est affiché comme Propriétaire */}
                    {typeRole === 'Administrateur' ? 'Propriétaire' : typeRole}
                  </span>
                </div>
              </div>

              {/* Côté Droit : Actions de modification et suppression */}
              <div className="flex items-center gap-3">
                {/* Sécurité : Masquer les boutons d'édition si l'utilisateur est l'Administrateur principal */}
                {typeRole !== 'Administrateur' && (
                  <>
                    {/* Bouton de modification des permissions */}
                    <button 
                      onClick={() => onEditUser && onEditUser(user)}
                      className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-50 active:scale-90 transition-all"
                      title="Modifier les permissions"
                    >
                      <Edit2 size={16} />
                    </button>
                    {/* Bouton de révocation d'accès (Suppression) */}
                    <button 
                      onClick={() => onDeleteUser && onDeleteUser(user)}
                      className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 active:scale-90 transition-all"
                      title="Révoquer l'accès"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ================= SECTION FOOTER : BOUTON AJOUTER ================= */}
      <div className="w-full px-1">
        {/* Bouton principal pour associer un nouvel utilisateur à la pièce */}
        <button
          onClick={onAddUser}
          className="w-full bg-[#20242c] hover:bg-[#2c323d] active:scale-[0.98] text-white font-bold text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus size={18} />
          <span>Ajouter un utilisateur</span>
        </button>
      </div>
      
    </div>
  );
};

export default RoomUsersCard;