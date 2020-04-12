const mongoose = require('mongoose')
const Schema=mongoose.Schema;
const indiaSchema =new Schema({
    con:{
        type:Number,
        require:true
    },
    rec:{
        type:Number,
        require:true
    },
    dead:{
        type:Number,
        require:true
    },
},{timestamps:true});

indiaSchema.statics.add=(con,rec,dead)=>{
    let data = new India({con: con, rec: rec,dead:dead});
    return data.save()
}
indiaSchema.statics.all=()=>{
    return India.find().sort( { updatedAt: -1 } ).limit(15)
}
indiaSchema.statics.recent=()=>{
    return India.find().sort( { updatedAt: -1 } ).limit(1)
}
const India =module.exports = mongoose.model('india', indiaSchema);