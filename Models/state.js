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
stateSchema.statics.search = function(text){
    let txt=text.split(" ")
    var result = [];

    var loop = function (start)
    {
        let prefix='';
        for(var i=start; i<txt.length; i++)
        {
            var next;
            if(prefix&&prefix!='')
            {next = prefix+' '+txt[i];prefix+=(" "+txt[i]);}
            else
            {next =txt[i];prefix=txt[i];
            }
            result.push(next);
        }
    }
    
    for(var i=0; i<txt.length; i++)
    {
        loop(i);
    }
    let temp;
    txt=result;
    txt.forEach((element,index) => {
        element=('^'+element+'$')
        if(temp){
			temp+=('|'+element)
        }
        else{
            temp=element
        }
    });
    text=temp;
    return State.find({
        name:{
            $regex:new RegExp(text),
            $options: "sim"
        }
    
    })
}
const State = module.exports = mongoose.model('State', stateSchema);
