const mongoose = require('mongoose')

const newsSchema = mongoose.Schema({
    message:{
        type: String,
        required: true
    }
}, {timestamps:true});

newsSchema.statics.addNew = (news) => {
    return new News(news).save()
}
newsSchema.statics.getAllNews = () => {
    return News.find().sort({updatedAt: -1});
}

newsSchema.statics.deleteAll = () => {
    return News.deleteMany({})
}

const News = module.exports = mongoose.model('News', newsSchema);