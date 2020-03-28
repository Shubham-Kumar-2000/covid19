const mongoose = require('mongoose')
const Schema=mongoose.Schema;
const userSchema =new Schema({
    lang: {
        type: String,
        default:'ENGLISH'
    },
    number:{
        type:Number,
        require:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    lastServedMenuName:{
        type:String,
        default:'baseMenu'
    }
    
},{timestamps:true});

userSchema.statics.setLastServedMenuName=(num,menuName)=>{
    return User.findOneAndUpdate({number:num},{ $set: { lastServedMenuName: menuName } })
}
const User=module.exports = mongoose.model('User', userSchema);