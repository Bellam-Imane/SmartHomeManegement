import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Cpu } from "lucide-react";

const initialCards = [
  { id: 1, text: "Optimisez vos coûts d’infrastructure grâce au monitoring intelligent." },
  { id: 2, text: "Automatisez les tâches répétitives pour améliorer la productivité." },
  { id: 3, text: "Utilisez l’analyse prédictive pour anticiper le comportement client." },
];

export default function AIRecommendationCard() {
  const [cards, setCards] = useState(initialCards);
  const [direction, setDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setDirection("right");
    setIsAnimating(true);
    setTimeout(() => {
      setCards((prev) => {
        const updated = [...prev];
        const first = updated.shift();
        updated.push(first);
        return updated;
      });
      setDirection(null);
      setIsAnimating(false);
    }, 400);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setDirection("left");
    setIsAnimating(true);
    setTimeout(() => {
      setCards((prev) => {
        const updated = [...prev];
        const last = updated.pop();
        updated.unshift(last);
        return updated;
      });
      setDirection(null);
      setIsAnimating(false);
    }, 400);
  };

  return (
    <div className="w-full flex items-center justify-center bg-transparent py-20 overflow-hidden font-sans">
      <div className="relative w-[420px] h-[260px]">
        
        {/* Buttons */}
        <button onClick={handlePrev} className="absolute -left-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-50 hover:bg-gray-50 active:scale-90 transition-all">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <button onClick={handleNext} className="absolute -right-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-50 hover:bg-gray-50 active:scale-90 transition-all">
          <ChevronRight size={24} className="text-gray-600" />
        </button>

        {cards.map((card, index) => {
          const isFront = index === 0;
          const isSecond = index === 1;

          const contentOpacity = isFront 
            ? (direction ? 0 : 1) 
            : (isSecond ? 0.15 : 0.05);

          return (
            <motion.div
              key={card.id}
              style={{ originY: 1 }}
              animate={{
                x: isFront && direction === "right" ? 240 : isFront && direction === "left" ? -240 : 0,
                scale: isFront ? (direction ? 0.8 : 1) : isSecond ? 0.94 : 0.88,
                y: isFront ? (direction ? 20 : 0) : isSecond ? 10 : 20,
                rotate: isFront && direction === "right" ? 12 : isFront && direction === "left" ? -12 : 0,
                zIndex: isFront && direction ? 0 : (30 - index * 10),
              }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className={`
                absolute inset-0 rounded-[40px] flex flex-col justify-between border border-white/60 shadow-2xl overflow-hidden
                ${isFront ? "bg-white" : isSecond ? "bg-[#ECEEF3]" : "bg-[#DDE1E7]"}
              `}
            >
              <div 
                className="h-full w-full p-8 flex flex-col justify-between transition-all duration-500 ease-in-out"
                style={{ opacity: contentOpacity, filter: isFront ? "none" : "blur(1px)" }}
              >
                {/* Header*/}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-indigo-50 text-indigo-600`}>
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-800 tracking-tight">Recommandation IA</h2>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Suggestion Intelligente</p>
                  </div>
                </div>

                {/* Main Text */}
                <div className="flex-1 flex items-center py-4">
                  <p className="text-[19px] leading-tight font-bold text-gray-800 antialiased">
                    « {card.text} »
                  </p>
                </div>

                {/* Footer Button */}
                <div className="flex justify-end">
                  <button className="px-8 py-3 rounded-full bg-[#111827] text-white font-bold text-sm shadow-lg active:scale-95 transition-transform">
                    Appliquer
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}