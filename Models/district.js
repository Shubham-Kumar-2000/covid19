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
    },
    'zone':{
        type:String,
        default:""
    }
},{timestamps:true});
districtSchema.index({ name: 'text' });
districtSchema.statics.addOrUpdate= async (data)=>{
    try{
    let district=null;
    district = await District.findOne({'name':data.name,'stateName':data.stateName});
    if(!district){
        district=new District(data)
    }
    else{
        if(district.confirmedCases==data.confirmedCases)
        return null
    }
    district.confirmedCases=data.confirmedCases;
    let newDistrict = await district.save();
    if(newDistrict){
        let menu = await Menu.findOne({'name':'districtMenu@'+data.stateName});
        if(!menu){
            menu = new Menu({'name':'districtMenu@'+data.stateName,'command':'getDistrictMenu@'+data.stateName,'options':[]});
            menu = await menu.save()
        }
        let oldDistrict = menu.options.find(x=>{
            return x.description==district.name;

        });
        if(oldDistrict){
            return newDistrict;
        }else{
            let maxSlNo = 0;
            menu.options.forEach(x => {
                if(x.slNo>maxSlNo)
                    maxSlNo=x.slNo;
            });
            menu.options.push({
                'slNo':maxSlNo+1,
                'description':newDistrict.name,
                'static':false,
                'action':'getDistrictData'
            });
            let newMenu = await menu.save();
            if(newMenu){
                return newDistrict;
            }
        }
    }
    return null;
    }catch(e){
        console.log(e)
        return null
    }
}
districtSchema.statics.getAllDistrict=()=>{
    return District.find()
}
districtSchema.statics.getDistrictByName=(name,stateName)=>{
    return District.findOne({name: name,stateName:stateName});
}
districtSchema.statics.getDistrictsByState=(stateName)=>{
    return District.find({stateName:stateName});
}
districtSchema.statics.search = function(text){
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
    return District.find({
        name:{
            $regex:new RegExp(text),
            $options: "sim"
        }
    
    })
}
districtSchema.statics.setZone = async (districtName,state,zone)=>{
    let district=null;
    district = await District.findOne({'name':districtName,'stateName':state});
    if(!district){
        district=new District({
            'name':districtName,'stateName':state
        })
    }
    district.zone=zone.toLowerCase()
    return district.save()
}

const District = module.exports = mongoose.model('District', districtSchema);
