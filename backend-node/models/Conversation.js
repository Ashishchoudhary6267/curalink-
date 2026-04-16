const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  sources: { type: Array, default: [] } // To store the citations from the LLM
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  diseaseContext: { type: String, required: true }, // e.g., "Parkinson's disease"
  location: { type: String },
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);