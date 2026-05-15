const roleSchema = new mongoose.Schema({

   nomRole: {
      type: String,
      required: true,
      enum: ['ADMIN', 'MEMBRE', 'INVITE'],
      unique: true
   },

   permissions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission'
   }]

});