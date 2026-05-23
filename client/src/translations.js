// src/translations.js

const translations = {
  "Français": {
    // Navigation / Sidebar
    dashboard: "Tableau de bord",
    rooms: "Pièces",
    devices: "Appareils",
    energy: "Énergie",
    security: "Sécurité",
    automation: "Automatisation",
    rapports: "Rapports",
    notifications: "Notifications",
    users: "Utilisateurs",
    settings: "Paramètres",
    logout: "Déconnexion",
    
    // Dashboard & Energy
    welcome: "Bienvenue",
    userDefault: "Utilisateur",
    subHeader: "Gérer votre maison intelligente facilement.",
    tempInt: "Temp. intérieure",
    tempExt: "Temp. extérieure",
    energyCons: "Énergie consommée",
    humidity: "Humidité",
    solarEnergy: "Énergie solaire",
    live: "LIVE",
    energyOverview: "Aperçu de la situation énergétique",
    acModeAuto: "mode auto",
    acRefroid: "refroid.",
    climatiseur: "climatiseur",
    lumiereEs: "Lumière ES",
    serrure: "serrure de porte",
    aspirateur: "Aspirateur",
    batterie: "Batterie",
    tabs: { Jour: "Jour", Mois: "Mois", Années: "Années" },
    labelsJour: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    labelsMois: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    labelsAnnees: ['2021', '2022', '2023', '2024', '2025', '2026'],

    // Users (Membres)
    usersHeader: "Membres et famille",
    activeMembers: "Membres Actifs",
    manageAccess: "Gérerez les personnes qui ont accès au foyer",
    addMember: "Ajouter un membre",
    online: "Online",
    offline: "Offline",
    deviceCount: "appareils",
    matrixTitle: "Matrice des Permissions",
    matrixDesc: "Définissez un accès granulaire pour chaque rôle.",
    resourceHeader: "Appareil / Ressource",
    annuler: "Annuler",
    
    // Users Modals & Roles
    roleTitle: "Sélection du Rôle",
    roleDesc: "Choisissez le niveau d'accès pour le nouveau membre",
    generateQR: "Générer le QR Code",
    scanTitle: "Scannez ce code pour rejoindre la maison",
    scanDesc: "Demandez au nouveau membre de pointer son appareil photo vers ce code pour s'ajouter automatiquement.",
    regenerateCode: "Régénérer le code",
    expireMsg: "Expire dans 5 min",
    roles: {
      admin: { label: "Admin", desc: "Accès complet aux paramètres" },
      membre: { label: "Membre", desc: "Contrôle des appareils" },
      invite: { label: "Invité", desc: "Accès temporaire sélectionné" }
    },
    deviceNames: {
      serrure: "Serrure porte entrée",
      lumieres: "Lumières du salon",
      thermostat: "Thermostat intelligent",
      camera: "Caméra de l'allée"
    },
    roomsNames: {
      entree: "Entrée",
      salon: "Salon",
      couloir: "Couloir",
      exterieur: "Extérieur"
    },

    // Notifications
    notifHeader: "Notifications",
    notifSubHeader: "Restez informé de l'état de votre maison.",
    notifData: {
      mouvement: { title: "Mouvement Détecté", desc: "Un mouvement a été détecté dans le Salon à 02:30 AM." },
      optimisation: { title: "Optimisation Énergie", desc: "Voulez-vous fermer les rideaux pour réduire la clim de 15% ?" },
      porte: { title: "Porte Ouverte", desc: "La porte principale est restée ouverte plus de 5 minutes." },
      eco: { title: "Économie Hebdomadaire", desc: "Votre consommation a baissé de 10% par rapport à la semaine dernière." },
      systeme: { title: "Système à jour", desc: "Le système ESP32 a été mis à jour avec succès." }
    },

    // Settings
    settingsTitle: "Paramètres",
    profile: "Profile",
    profileDesc: "Gérez votre identity personnelle et vos identifiants d'accès.",
    nom: "Nom",
    prenom: "Prénom",
    email: "Email",
    phone: "Téléphone",
    save: "Enregistrer",
    saved: "Enregistré",
    twoFactor: "Double authentification",
    twoFactorDesc: "Protéger votre compte.",
    emergencyContact: "Contact d'urgence",
    notifType: "Type",
    notifMobile: "Mobile",
    notifEmail: "Email",
    display: "Affichage",
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    securityAlerts: "Alertes de Sécurité",
    securityDesc: "Intrusions, détection de fumée ou fuite de gaz.",
    systemUpdates: "Mises à jour Système",
    systemDesc: "Nouvelles fonctionnalités et correctifs de sécurité.",
    energyReports: "Rapports d'Énergie",
    energyDesc: "Rapports hebdomadaires de votre consommation.",
    deviceStatus: "État des Appareils",
    deviceDesc: "Statuts liés au fonctionnement d'un appareil.",

    // Security
    securityPanelTitle: "Tableau de bord de sécurité",
    securityPanelDesc: "Gérez la sécurité de votre maison intelligente facilement.",
    systemStatusTitle: "État du Système",
    alarmSystemLabel: "Système d'alarme",
    alarmActiveStatus: "ACTIF",
    alarmInactiveStatus: "DÉSACTIVÉ",
    alarmActiveDesc: "• Tous les périmètres sont surveillés.",
    alarmInactiveDesc: "• Le système est au repos.",
    btnActive: "Activer",
    btnInactive: "Désactiver",
    cameraFeedTitle: "Flux Caméras",
    closeFullScreen: "✖ Fermer",
    viewLive: "View Live",
    connectedSensorsTitle: "Capteurs Connectés",
    sensorSecured: "SÉCURISÉ",
    sensorUnsecured: "NON SÉCURISÉ",
    accessLockTitle: "Accès & Verrouillage",
    lockLocked: "VERROUILLÉ",
    lockUnlocked: "DÉVERROUILLÉ",
    
    // Noms des Caméras & Capteurs & Serrures
    securityData: {
      cams: {
        salon: { name: "Salon Principal", desc: "Angle de vue : 120° • 4K HDR" },
        salon2: { name: "Salon 2", desc: "Vue panoramique" },
        parent: { name: "Chambre Parents", desc: "HD Night Vision" },
        kids: { name: "Chambre Enfants", desc: "Secure view" },
        cuizin: { name: "Cuisine", desc: "Wide angle" },
        escalier: { name: "Escalier", desc: "Motion detection" }
      },
      sensors: {
        mouvement: { title: "Mouvement", subtitle: "Cuisine & Entrée" },
        fumee: { title: "Fumée", subtitle: "Étages 1 & 2" },
        air: { title: "Qualité de l'Air", subtitle: "CO2 & Particules", value: "Excellent", score: "98 AQI" }
      },
      locks: {
        entree: "Porte d'Entrée",
        garage: "Porte de Garage",
        fenetre: "Porte Fenêtre",
        allee: "Portail Allée"
      }
    }
  },
  "English": {
    // Navigation / Sidebar
    dashboard: "Dashboard",
    rooms: "Rooms",
    devices: "Devices",
    energy: "Energy",
    security: "Security",
    automation: "Automation",
    rapports: "Reports",
    notifications: "Notifications",
    users: "Users",
    settings: "Settings",
    logout: "Logout",

    // Dashboard & Energy
    welcome: "Welcome",
    userDefault: "User",
    subHeader: "Manage your smart home easily.",
    tempInt: "Indoor Temp.",
    tempExt: "Outdoor Temp.",
    energyCons: "Energy Consumed",
    humidity: "Humidity",
    solarEnergy: "Solar Energy",
    live: "LIVE",
    energyOverview: "Energy Situation Overview",
    acModeAuto: "auto mode",
    acRefroid: "cooling",
    climatiseur: "Air Conditioner",
    lumiereEs: "ES Light",
    serrure: "Door Lock",
    aspirateur: "Vacuum Cleaner",
    batterie: "Battery",
    tabs: { Jour: "Day", Mois: "Month", Années: "Years" },
    labelsJour: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    labelsMois: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    labelsAnnees: ['2021', '2022', '2023', '2024', '2025', '2026'],

    // Users (Membres)
    usersHeader: "Members & Family",
    activeMembers: "Active Members",
    manageAccess: "Manage people who have access to the home",
    addMember: "Add member",
    online: "Online",
    offline: "Offline",
    deviceCount: "devices",
    matrixTitle: "Permissions Matrix",
    matrixDesc: "Define granular access for each role.",
    resourceHeader: "Device / Resource",
    annuler: "Cancel",

    // Users Modals & Roles
    roleTitle: "Role Selection",
    roleDesc: "Choose the access level for the new member",
    generateQR: "Generate QR Code",
    scanTitle: "Scan this code to join the house",
    scanDesc: "Ask the new member to point their camera at this code to be added automatically.",
    regenerateCode: "Regenerate code",
    expireMsg: "Expires in 5 min",
    roles: {
      admin: { label: "Admin", desc: "Full access to settings" },
      membre: { label: "Member", desc: "Device control access" },
      invite: { label: "Guest", desc: "Selected temporary access" }
    },
    deviceNames: {
      serrure: "Front door lock",
      lumieres: "Living room lights",
      thermostat: "Smart thermostat",
      camera: "Driveway camera"
    },
    roomsNames: {
      entree: "Entrance",
      salon: "Living Room",
      couloir: "Hallway",
      exterieur: "Outdoor"
    },

    // Notifications
    notifHeader: "Notifications",
    notifSubHeader: "Stay informed about your home's status.",
    notifData: {
      mouvement: { title: "Motion Detected", desc: "Motion was detected in the Living Room at 02:30 AM." },
      optimisation: { title: "Energy Optimization", desc: "Would you like to close the blinds to reduce AC by 15%?" },
      porte: { title: "Door Left Open", desc: "The main door has been left open for more than 5 minutes." },
      eco: { title: "Weekly Savings", desc: "Your power consumption dropped by 10% compared to last week." },
      systeme: { title: "System Updated", desc: "The ESP32 system has been successfully updated." }
    },

    // Settings
    settingsTitle: "Settings",
    profile: "Profile",
    profileDesc: "Manage your personal identity and access credentials.",
    nom: "Last Name",
    prenom: "First Name",
    email: "Email",
    phone: "Phone",
    save: "Save",
    saved: "Saved",
    twoFactor: "Two-Factor Authentication",
    twoFactorDesc: "Protect your account.",
    emergencyContact: "Emergency Contact",
    notifType: "Type",
    notifMobile: "Mobile",
    notifEmail: "Email",
    display: "Display",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    securityAlerts: "Security Alerts",
    securityDesc: "Intrusions, smoke detection or gas leaks.",
    systemUpdates: "System Updates",
    systemDesc: "New features and security patches.",
    energyReports: "Energy Reports",
    energyDesc: "Weekly reports of your consumption.",
    deviceStatus: "Device Status",
    deviceDesc: "Status related to device operation.",

    // Security
    securityPanelTitle: "Security Dashboard",
    securityPanelDesc: "Manage your smart home security easily.",
    systemStatusTitle: "System Status",
    alarmSystemLabel: "Alarm System",
    alarmActiveStatus: "ACTIVE",
    alarmInactiveStatus: "DISARMED",
    alarmActiveDesc: "• All perimeters are being monitored.",
    alarmInactiveDesc: "• The system is disarmed.",
    btnActive: "Activate",
    btnInactive: "Deactivate",
    cameraFeedTitle: "Camera Feeds",
    closeFullScreen: "✖ Close",
    viewLive: "View Live",
    connectedSensorsTitle: "Connected Sensors",
    sensorSecured: "SECURED",
    sensorUnsecured: "NOT SECURED",
    accessLockTitle: "Access & Locking",
    lockLocked: "LOCKED",
    lockUnlocked: "UNLOCKED",

    securityData: {
      cams: {
        salon: { name: "Main Living Room", desc: "View angle: 120° • 4K HDR" },
        salon2: { name: "Living Room 2", desc: "Panoramic view" },
        parent: { name: "Master Bedroom", desc: "HD Night Vision" },
        kids: { name: "Kids Room", desc: "Secure view" },
        cuizin: { name: "Kitchen", desc: "Wide angle" },
        escalier: { name: "Stairs", desc: "Motion detection" }
      },
      sensors: {
        mouvement: { title: "Motion", subtitle: "Kitchen & Entrance" },
        fumee: { title: "Smoke", subtitle: "Floors 1 & 2" },
        air: { title: "Air Quality", subtitle: "CO2 & Particles", value: "Excellent", score: "98 AQI" }
      },
      locks: {
        entree: "Front Door",
        garage: "Garage Door",
        fenetre: "Window Door",
        allee: "Driveway Gate"
      }
    }
  },
  "العربية": {
    // Navigation / Sidebar
    dashboard: "لوحة التحكم",
    rooms: "الغرف",
    devices: "الأجهزة",
    energy: "الطاقة",
    security: "الأمن",
    automation: "الأتمتة",
    rapports: "التقارير",
    notifications: "الإشعارات",
    users: "المستخدمين",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",

    // كلمات الـ Dashboard & Energy
    welcome: "مرحباً",
    userDefault: "مستخدم",
    subHeader: "إدارة منزلك الذكي بكل سهولة.",
    tempInt: "الحرارة الداخلية",
    tempExt: "الحرارة الخارجية",
    energyCons: "الطاقة المستهلكة",
    humidity: "الرطوبة",
    solarEnergy: "الطاقة الشمسية",
    live: "بث مباشر",
    energyOverview: "نظرة عامة على استهلاك الطاقة",
    acModeAuto: "وضع تلقائي",
    acRefroid: "تبريد",
    climatiseur: "المكيف",
    lumiereEs: "الإضاءة",
    serrure: "قفل الباب",
    aspirateur: "المكنسة",
    batterie: "البطارية",
    tabs: { Jour: "يوم", Mois: "شهر", Années: "سنوات" },
    labelsJour: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
    labelsMois: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    labelsAnnees: ['2021', '2022', '2023', '2024', '2025', '2026'],

    // كلمات الـ Users
    usersHeader: "الأعضاء والعائلة",
    activeMembers: "الأعضاء النشطون",
    manageAccess: "إدارة الأشخاص الذين لديهم صلاحية الوصول إلى المنزل",
    addMember: "إضافة عضو",
    online: "متصل",
    offline: "غير متصل",
    deviceCount: "أجهزة",
    matrixTitle: "مصفوفة الصلاحيات",
    matrixDesc: "تحديد صلاحيات دقيقة لكل دور مستخدم.",
    resourceHeader: "الجهاز / المورد",
    annuler: "إلغاء",

    // أدوار ومودال الـ Users
    roleTitle: "اختيار الدور",
    roleDesc: "اختر مستوى صلاحية الوصول للعضو الجديد",
    generateQR: "توليد رمز QR",
    scanTitle: "امسح هذا الرمز للانضمام إلى المنزل",
    scanDesc: "اطلب من العضو الجديد توجيه الكاميرا نحو هذا الرمز ليتم إضافته تلقائيًا.",
    regenerateCode: "إعادة توليد الرمز",
    expireMsg: "تنتهي الصلاحية خلال 5 دقائق",
    roles: {
      admin: { label: "مسؤول", desc: "وصول كامل لكافة الإعدادات" },
      membre: { label: "عضو", desc: "صلاحية التحكم في الأجهزة" },
      invite: { label: "ضيف", desc: "وصول مؤقت ومحدد للأجهزة" }
    },
    deviceNames: {
      serrure: "قفل الباب الرئيسي",
      lumieres: "إضاءة غرفة المعيشة",
      thermostat: "منظم الحرارة الذكي",
      camera: "كاميرا الممر الخارجي"
    },
    roomsNames: {
      entree: "المدخل",
      salon: "غرفة المعيشة",
      couloir: "الممر",
      exterieur: "الخارج"
    },

    // Notifications
    notifHeader: "الإشعارات",
    notifSubHeader: "ابقَ على اطلاع دائم بحالة منزلك.",
    notifData: {
      mouvement: { title: "تم رصد حركة", desc: "تم رصد حركة في غرفة المعيشة عند الساعة 02:30 صباحاً." },
      optimisation: { title: "تحسين استهلاك الطاقة", desc: "هل تريد إغلاق الستائر لتقليل استهلاك المكيف بنسبة 15%؟" },
      porte: { title: "الباب مفتوح", desc: "بقي الباب الرئيسي مفتوحاً لأكثر من 5 دقائق." },
      eco: { title: "توفير أسبوعي", desc: "انخفض استهلاكك للطاقة بنسبة 10% مقارنة بالأسبوع الماضي." },
      systeme: { title: "تحديث النظام", desc: "تم تحديث نظام ESP32 بنجاح." }
    },

    // كلمات الـ Settings
    settingsTitle: "الإعدادات",
    profile: "الملف الشخصي",
    profileDesc: "إدارة هويتك الشخصية وبيانات الاعتماد الخاصة بك.",
    nom: "الاسم العائلي",
    prenom: "الاسم الشخصي",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    save: "حفظ",
    saved: "تم الحفظ",
    twoFactor: "التحقق بخطوتين",
    twoFactorDesc: "حماية حسابك الشخصي.",
    emergencyContact: "جهة اتصال الطوارئ",
    notifType: "النوع",
    notifMobile: "الهاتف",
    notifEmail: "البريد",
    display: "العرض واللغة",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع الفاتح",
    securityAlerts: "تنبيهات الأمن",
    securityDesc: "الاقتحامات، كشف الدخان أو تسرب الغاز.",
    systemUpdates: "تحديثات النظام",
    systemDesc: "الميزات الجديدة وإصلاحات الأمان.",
    energyReports: "تقارير الطاقة",
    energyDesc: "تقارير أسبوعية عن استهلاكك للطاقة.",
    deviceStatus: "حالة الأجهزة",
    deviceDesc: "الحالات المتعلقة بتشغيل وأداء الأجهزة.",

    // Security
    securityPanelTitle: "لوحة تحكم الأمن",
    securityPanelDesc: "إدارة أمن منزلك الذكي بكل سهولة وسلاسة.",
    systemStatusTitle: "حالة النظام",
    alarmSystemLabel: "نظام الإنذار",
    alarmActiveStatus: "مفعل",
    alarmInactiveStatus: "معطل",
    alarmActiveDesc: "• كافة النطاقات تحت المراقبة حالياً.",
    alarmInactiveDesc: "• النظام في وضع السكون وغير مفعل.",
    btnActive: "تفعيل",
    btnInactive: "تعطيل",
    cameraFeedTitle: "بث الكاميرات",
    closeFullScreen: "✖ إغلاق",
    viewLive: "عرض مباشر",
    connectedSensorsTitle: "المستشعرات المتصلة",
    sensorSecured: "آمن",
    sensorUnsecured: "غير آمن",
    accessLockTitle: "الأبواب والأقفال",
    lockLocked: "مقفل",
    lockUnlocked: "مفتوح",

    securityData: {
      cams: {
        salon: { name: "غرفة المعيشة الرئيسية", desc: "زاوية الرؤية : 120° • 4K HDR" },
        salon2: { name: "غرفة المعيشة 2", desc: "رؤية بانورامية كاملة" },
        parent: { name: "غرفة الوالدين", desc: "رؤية ليلية عالية الدقة HD" },
        kids: { name: "غرفة الأطفال", desc: "عرض أمن وحماية متواصلة" },
        cuizin: { name: "المطبخ", desc: "زاوية رؤية عريضة" },
        escalier: { name: "السلالم", desc: "مستشعر رصد الحركة نشط" }
      },
      sensors: {
        mouvement: { title: "الحركة", subtitle: "المطبخ والمدخل" },
        fumee: { title: "الدخان", subtitle: "الطابق 1 و 2" },
        air: { title: "جودة الهواء", subtitle: "ثاني أكسيد الكربون والجزيئات", value: "ممتاز", score: "98 AQI" }
      },
      locks: {
        entree: "الباب الرئيسي",
        garage: "باب المرآب",
        fenetre: "النافذة الكبيرة",
        allee: "بوابة الممر"
      }
    }
  }
};

module.exports = { translations };