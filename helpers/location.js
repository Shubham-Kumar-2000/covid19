const geolib = require('geolib');
const fetch = require("node-fetch");
const ChatApi=require('./chatApi')
const Message=require('./messge');
const District=require('../Models/district');
exports.calculate=async(userLoc,user)=>{
    try{
        let distsLoc=await fetch("https://files.indiasmile.xyz/cache/infectedDistricts.json").then(result=>{return result.json()})
        let min=Number.MAX_SAFE_INTEGER,state="",area="";
        for(disName in distsLoc){
            let disLoc={
                latitude: distsLoc[disName].coords.lat,
                longitude: distsLoc[disName].coords.lng,
            }
            let dist =await geolib.getDistance(userLoc,disLoc,300)
            if(dist<min){
                min=dist;
                state=distsLoc[disName].stateName;
                area=disName;
            }
        }
        let district=await District.getDistrictByName(area,state)
        ChatApi.sendmsg({
            phone:user.number,
            body:Message.distanceToMessage(min,state,area,district)
          },user.lang!='ENGLISH')
    }
    catch(e){
        console.log(e);
        ChatApi.sendmsg({
            phone:user.number,
            body:"Some error occured Please contact the admin."
          },user.lang!='ENGLISH')
        ChatApi.sendToAdmins("Some error occured while calculating the location : "+String(e))
    }
}
