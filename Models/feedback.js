const mongoose = require('mongoose')
const Schema=mongoose.Schema;
const feedbackSchema =new Schema({
    number:{
        type:Number,
        require:true
    },
    message:{
        type:String,
        default:""
    }
    
},{timestamps:true});

feedbackSchema.statics.saveOrUpdateFeedback=(num,feedbackMessage)=>{
    let feed = new Feedback({number: num, message: feedbackMessage});
    return feed.save()
}
feedbackSchema.statics.all=()=>{
    return Feedback.find().sort( { updatedAt: -1 } )
}
const Feedback =module.exports = mongoose.model('Feedback', feedbackSchema);