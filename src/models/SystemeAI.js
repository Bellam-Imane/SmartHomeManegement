const systemeAISchema = new mongoose.Schema({
  modeleAI: { type: String, default: "Random Forest / LSTM" }, 
  niveauConfiance: { type: Number, default: 0.0 }, 
  baseConnaissance: { type: String }, 
  estEnApprentissage: { type: Boolean, default: true },
  
 
  recommandations: [{
    appareilId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appareil' },
    suggestion: String,
    dateSuggestion: { type: Date, default: Date.now }
  }]
});