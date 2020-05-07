require('dotenv').config({path: '.env'});
require('../Models/index').connect()
let Utills=require('../helpers/utils');

async function state(){
    console.log("Updating states");
    await Utills.getUpdates()
  }
state().then(r=>{
    console.log("done")
    process.exit()
}).catch(e=>{
    console.log(e)
    process.exit(1)
});