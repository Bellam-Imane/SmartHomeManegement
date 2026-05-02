import React from 'react';
import { UserPlus, Edit2, Trash2, Shield, Smartphone, Lightbulb, Thermometer, Video, Mic, User } from 'lucide-react';

const Users = () => {
  // بيانات تجريبية للأعضاء (Data)
  const members = [
    { id: 1, name: "Alisha H.", role: "Admin", status: "Online", devices: "8 appareils", initial: "A" },
    { id: 2, name: "Miguel", role: "Membre", status: "Online", devices: "3 appareils", initial: "M" },
    { id: 3, name: "Sarah", role: "Invité", status: "Online", devices: "1 appareil", initial: "S" },
    { id: 4, name: "Miguel", role: "Membre", status: "Offline", devices: "1 appareil", initial: "M" },
  ];

  // بيانات جدول الصلاحيات
  const permissions = [
    { id: 1, name: "Serrure porte entrée", location: "Entrée", icon: <Smartphone size={20}/>, admin: true, member: true, guest: true },
    { id: 2, name: "Lumières du salon", location: "Salon", icon: <Lightbulb size={20}/>, admin: true, member: true, guest: false },
    { id: 3, name: "Thermostat intelligent", location: "Couloir", icon: <Thermometer size={20}/>, admin: true, member: false, guest: false },
    { id: 4, name: "Caméra de l'allée", location: "Extérieur", icon: <Video size={20}/>, admin: true, member: true, guest: false },
  ];

  return (
    // استعملت نفس الـ div الكبيرة اللي كانت عند إيمان باش يجي السايز مقاد
    <div className="bg-white p-8 rounded-[40px] shadow-sm w-full min-h-[calc(100vh-2.5rem)] flex flex-col font-sans overflow-y-auto">
      
      {/* Header - دمجت فيه ستيل إيمان مع الأزرار الجديدة */}
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Membres et famille</h1>
          <p className="text-gray-500 mt-1">Gérez les membres de la famille et leurs accès au tableau de bord.</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                <Mic size={16} className="text-gray-500"/>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">contrôle vocal</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             </div>
             <button className="bg-[#2D3748] text-white px-5 py-2.5 rounded-2xl hover:bg-black transition-all shadow-md flex items-center gap-2 text-sm font-medium">
                <UserPlus size={18}/> Ajouter un membre
             </button>
        </div>
      </div>

      {/* القسم الأول: Membres Actifs */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Membres Actifs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {members.map((member) => (
            <div key={member.id} className="p-4 rounded-[2rem] border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#edf2f7] text-[#2d3748] rounded-full flex items-center justify-center font-bold text-lg">
                  {member.initial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 text-gray-500 rounded-full font-bold uppercase tracking-widest">{member.role}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{member.status}  •  {member.devices}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all mr-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all"><Edit2 size={16}/></button>
                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* القسم الثاني: Matrice des Permissions */}
      <div className="flex-1">
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Matrice des Permissions</h2>
            <p className="text-sm text-gray-400 italic">Définissez un accès granulaire pour chaque rôle.</p>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                <th className="pb-4">Appareil / Ressource</th>
                <th className="pb-4 text-center">Admin</th>
                <th className="pb-4 text-center">Membre</th>
                <th className="pb-4 text-center">Invité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {permissions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#f8fafc] rounded-2xl text-gray-500">{item.icon}</div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{item.location}</div>
                      </div>
                    </div>
                  </td>
                  {/* Toggle Switches */}
                  {[item.admin, item.member, item.guest].map((checked, index) => (
                    <td key={index} className="py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={checked} className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2D3748]"></div>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Users;