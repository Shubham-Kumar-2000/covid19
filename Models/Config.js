const mongoose=require("mongoose");

const configSchema =new mongoose.Schema({
    active: { type: Boolean, default: true },
    con: { type: Number, default: 0 },
    rec: { type: Number, default: 0 },
    dead: { type: Number, default: 0 },
    message:{type:String,default:""},
    predicted:{type:Object,default:{}}
});





const Config = module.exports = mongoose.model("config", configSchema);
