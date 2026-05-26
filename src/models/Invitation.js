const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({

   emailInvite: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
   },

   maison: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Maison',
      required: true
   },

   rolePropose: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
   },

   permissions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission'
   }],

   codeInvitation: {
      type: String,
      required: true,
      unique: true
   },

   creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },

   dateExpiration: {
      type: Date,
      required: true
   },

   status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED'],
      default: 'PENDING'
   }

}, { timestamps: true });

module.exports = mongoose.model(
   'Invitation',
   invitationSchema
);