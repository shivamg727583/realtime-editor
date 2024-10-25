const mongoose = require('mongoose');
const { type } = require('os');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:{
    type:String,
    require:true,
    unique:true
  },
  password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
