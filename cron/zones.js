require('dotenv').config({path: '.env'});
require('../Models/index').connect()
let Utills=require('../helpers/utils');

async function zone(){
    console.log("Updating Zones");
    await Utills.updateZones()
  }
zone().then(r=>{
    console.log("done")
    process.exit()
}).catch(e=>{
    console.log(e)
    process.exit(1)
});