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
    Feedback.findOne({number: num},(err, feed) => {
        if(feed)
            feed.message = feedbackMessage;
        else
            feed = new Feedback({number: num, message: feedbackMessage});
        return feed.save()
    });
}
feedbackSchema.statics.all=()=>{
    return Feedback.find()
}
const User=module.exports = mongoose.model('Feedback', feedbackSchema);