import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mic, Loader2 } from 'lucide-react';

// حطي الـ API Key ديالك هنا
const genAI = new GoogleGenerativeAI("AIzaSyD6krDCT6nTPovbWpakSOiM-vPTkOPpn2k");

const VoiceControlButton = ({ onCommand, allData }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const speak = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'fr-FR'; 
    window.speechSynthesis.speak(msg);
  };

  const handleAIResponse = async (userText) => {
    setIsProcessing(true);
    try {
      console.log("🛠️ Testing Gemini with API Key:", "YOUR_API_KEY".substring(0, 5) + "...");
      // تأكدي أن الموديل مكتوب بهاد الطريقة البسيطة
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Tu es "Riri", l'assistant vocal intelligent d'une application SmartHome.
        Voici les données actuelles de la maison :
        - Statistiques : ${JSON.stringify(allData?.stats || {})}
        - État des appareils : ${JSON.stringify(allData?.devices || {})}
        
        L'utilisateur te dit : "${userText}"
        
        Réponds UNIQUEMENT sous ce format JSON strict :
        {
          "type": "DEVICE_CONTROL" ou "NAVIGATE" ou "READ_INFO",
          "action": "light", "ac", "lock", "vac" (si appareil) OU "rapport", "notification", "paramètre", "accueil" (si page) OU "info",
          "targetState": true (pour allumer/verrouiller), false (pour éteindre/déverrouiller), ou null,
          "reply": "Ta réponse vocale en Français (ex: 'D'accord, j'allume la lumière' ou 'Votre consommation est de 13kwh')"
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const response = JSON.parse(jsonString);

      console.log("🤖 القرار ديال الذكاء الاصطناعي :", response);

      // صيفطي الأمر للـ Dashboard
      if (onCommand && response.type && response.action) {
        onCommand({ 
            type: response.type, 
            action: response.action, 
            targetState: response.targetState 
        });
      }

      // الجواب الصوتي
      if (response.reply) {
          speak(response.reply);
      }

    } catch (error) {
      console.error("مشكل فـ الذكاء الاصطناعي:", error);
      speak("Désolé, j'ai eu un problème de connexion.");
    }
    setIsProcessing(false);
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("المتصفح ديالك ما كيدعمش الصوت.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-MA'; 
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🗣️ قلتي :", transcript);
      await handleAIResponse(transcript);
    };

    recognition.start();
  };

  return (
    <button
      onClick={startRecognition}
      disabled={isProcessing}
      className={`group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-lg active:scale-95
        ${isListening   
            ? 'bg-[#ef4444] shadow-red-400 scale-110'
            : 'bg-[#1e293b] hover:bg-[#0f172a] shadow-slate-200'
          }`}
    >
      <span className={`absolute inset-0 rounded-full bg-current opacity-20 animate-ping ${isListening ? 'block' : 'hidden group-hover:block'}`}></span>
      {isProcessing ? <Loader2 size={24} className="text-white animate-spin" /> : <Mic size={24} className="text-white" />}
    </button>
  );
}

export default VoiceControlButton;