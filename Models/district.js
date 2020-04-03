const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Menu = require('./menu');
const districtSchema =new Schema({
    'name': {
        type: String,
        required: true,
    },
    'confirmedCases':{
        type:Number,
        require:true,
        default:0
    },
    'stateName':{
        type:String,
        default:"Unknown"
    }
},{timestamps:true});
districtSchema.index({ name: 'text' });

districtSchema.statics.getAllDistrict=()=>{
    return District.find()
}
districtSchema.statics.getDistrictByName=(name,stateName)=>{
    return District.findOne({name: name,stateName:stateName});
}

const District = module.exports = mongoose.model('District', districtSchema);
