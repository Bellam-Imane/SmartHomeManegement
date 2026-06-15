import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react"; 

export default function FilterDropdown({ 
    isOpen, 
    onClose, 
    selectedType, 
    onSelectType, 
    selectedEtage, 
    onSelectEtage 
}) {
    const categories = ["Tous", "Salon", "Chambre à coucher", "Cuisine", "Bureau", "Autre"];
    const etages = ["Tous", 0, 1, 2, 3];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-[40px] shadow-2xl z-50 p-7"
                >
                    {/* Section: Type de pièce */}
                    <div className="mb-6">
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[1.5px] ml-2 mb-4">
                            Type de pièce
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => onSelectType(cat)} 
                                    className={`px-4 py-2.5 text-sm font-semibold rounded-[18px] transition-all duration-300 shadow-sm ${
                                        selectedType === cat 
                                        ? "bg-indigo-600 text-white" 
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[1.5px] bg-gray-100 my-6 w-full opacity-50" />

                    {/* Section: Étage */}
                    <div className="mb-8">
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[1.5px] ml-2 mb-4">
                            Étage
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {etages.map((e) => (
                                <button
                                    key={e}
                                    onClick={() => onSelectEtage(e)} // هنا ماكاينش onClose()
                                    className={`w-12 h-12 flex items-center justify-center text-sm font-bold rounded-2xl transition-all duration-300 shadow-sm border ${
                                        selectedEtage === e 
                                        ? "bg-indigo-600 text-white border-transparent" 
                                        : "bg-gray-50 text-gray-600 border-transparent hover:border-orange-200"
                                    }`}
                                >
                                    {e === "Tous" ? "All" : e}
                                </button>
                            ))}
                        </div>
                    </div>

                    
                    <button 
                        onClick={onClose}
                        className="w-full bg-gray-900 text-white py-4 rounded-[22px] font-bold text-sm hover:bg-black transition-colors shadow-lg"
                    >
                        Appliquer les filtres
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}