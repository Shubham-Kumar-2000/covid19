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
districtSchema.statics.search = function(text){
    let txt=text.split(" ")
    var result = [];

    var loop = function (start,depth,prefix)
    {
        for(var i=start; i<txt.length; i++)
        {
            var next;
            if(prefix&&prefix!='')
            next = prefix+' '+txt[i];
            else
            next = prefix+txt[i];
            if (depth > 0)
                loop(i+1,depth-1,next);
            else
                result.push(next);
        }
    }

    for(var i=0; i<txt.length; i++)
    {
        loop(0,i,'');
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

const District = module.exports = mongoose.model('District', districtSchema);
