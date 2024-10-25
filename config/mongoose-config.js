const mongoose = require('mongoose')

const db =  mongoose.connect("mongodb://localhost/realtime-editor").then(()=>{
    console.log("Connected to database")
}).catch((err)=>console.log(err));



module.exports = db;