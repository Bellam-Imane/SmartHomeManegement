const PanneauSoleil = SourceEnergetique.discriminator('PanneauSoleil', 
  new mongoose.Schema({
    enSoleillement: Number, 
    surfaceTotale: Number,  
    rendement: Number,      
    inclinaison: Number  
  })
);