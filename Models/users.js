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
    },
    active:{
        type:Boolean,
        default:true
    }
    
},{timestamps:true});

userSchema.statics.setLang=(num,lang)=>{
    return User.findOneAndUpdate({number:num},{ $set: { lang: lang } },{new:true})
}
userSchema.statics.setLastServedMenuName=(num,menuName)=>{
    return User.findOneAndUpdate({number:num},{ $set: { lastServedMenuName: menuName } })
}
userSchema.statics.all=()=>{
    return User.find()
}
userSchema.statics.allSorted=()=>{
    return User.find().sort( { createdAt: -1 } )
}
const User=module.exports = mongoose.model('User', userSchema);