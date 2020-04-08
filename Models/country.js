const mongoose = require('mongoose')
const Schema=mongoose.Schema;
const countrySchema =new Schema({
    name: {
        type:String,
        unique:true,
        require:true
    },
    confirmed: {
        type:String,
        require:true
    },
    recovered: {
        type:String,
        require:true
    },
    deaths: {
        type:String,
        require:true
    },
    active: {
        type:String,
        require:true
    }
    
},{timestamps:true});

countrySchema.statics.saveOrUpdateCountry = async (data)=>{
    let countryF = await Country.findOne({name: data.name})
    if(!countryF) {
        let country = new Country(data);
        return country.save()
    } else {
        countryF.name = data.name
        countryF.confirmed = data.confirmed
        countryF.recovered = data.recovered
        countryF.deaths = data.deaths
        countryF.active = data.active
        return countryF.save()
    }
}
countrySchema.statics.all= async ()=>{
    return Country.find().sort( { name: 1 } )
}
countrySchema.statics.getCountry= async (name)=>{
    return Country.findOne({name})
}
countrySchema.statics.getCount= async ()=>{
    return Country.find().count()
}
const Country =module.exports = mongoose.model('Country', countrySchema);