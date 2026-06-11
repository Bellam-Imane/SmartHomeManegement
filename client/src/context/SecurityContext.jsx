import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
    // 1. الداتا الافتراضية
    const [locks, setLocks] = useState({ entree: true, garage: true, fenetre: false, allee: true });
    const [alarmActive, setAlarmActive] = useState(true);
    const [sensors, setSensors] = useState({ mouvement: true, fumee: true });
    const [airQuality, setAirQuality] = useState(null);

    // 2. دالة جلب الداتا من الباكاند
    const fetchSecurityStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get('http://localhost:5000/api/security', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data) {
                // تحديث الـ Context بالداتا ديال الداتابيز
                if (res.data.locks) setLocks(res.data.locks);
                if (res.data.alarmActive !== undefined) setAlarmActive(res.data.alarmActive);
                if (res.data.sensors) setSensors(res.data.sensors);
                if (res.data.airQuality !== undefined) setAirQuality(res.data.airQuality);
            }
        } catch (err) {
            console.error("Erreur lors de la récupération du statut (Context):", err);
        }
    };

    // كيتنفذ فاش كيتحل الموقع
    useEffect(() => { 
        fetchSecurityStatus(); 
    }, []);

    return (
        <SecurityContext.Provider value={{ 
            locks, setLocks, 
            alarmActive, setAlarmActive, 
            sensors, setSensors,
            airQuality, setAirQuality,
            fetchSecurityStatus 
        }}>
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => useContext(SecurityContext);