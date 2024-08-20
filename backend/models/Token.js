const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userAddress: String,
  tokens: [{ address: String, symbol: String }]
});

module.exports = mongoose.model('Token', tokenSchema);
