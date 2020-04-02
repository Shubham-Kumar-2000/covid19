const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const stateSchema =new Schema({
    'name': {
        type: String,
        required: true,
    },
    'lastRecorded':{
        type:Number,
        require:true,
        default:0
    },
    'lastRecordedDeaths':{
        type:Number,
        require:true,
        default:0
    }
},{timestamps:true});
stateSchema.index({ name: 'text' });
stateSchema.statics.addNew=(name)=>{
    let state=new State({name:name})
    return state.save()
}
stateSchema.statics.getAllStates=()=>{
    return State.find()
}
stateSchema.statics.getStateByName=(name)=>{
    return State.findOne({name: name})
}
stateSchema.statics.updateState=(name,num,dead)=>{
    return State
        .findOneAndUpdate({name: name}, { $set: { lastRecorded: num,lastRecordedDeaths:dead } }, {new: true} )
}
const State = module.exports = mongoose.model('State', stateSchema);
