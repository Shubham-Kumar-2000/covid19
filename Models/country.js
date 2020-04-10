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
countrySchema.statics.search = function(text){
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
    return Country.find({
        name:{
            $regex:new RegExp(text),
            $options: "sim"
        }
    
    })
}
const Country =module.exports = mongoose.model('Country', countrySchema);