require('dotenv').config({path: '.env'});
require('../Models/index').connect()
let Utills=require('../helpers/utils');

async function rec(){
    console.log("Updating recoveries");
    await Utills.getRecoveries()
  }
rec().then(r=>{
    console.log("done")
    process.exit()
}).catch(e=>{
    console.log(e)
    process.exit(1)
});