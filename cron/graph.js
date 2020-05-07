require('dotenv').config({path: '.env'});
require('../Models/index').connect()
let Utills=require('../helpers/utils');

async function send(){
    console.log("Send Graph");
    await Utills.sendUpdate()
  }
send().then(r=>{
    console.log("done")
    process.exit()
}).catch(e=>{
    console.log(e)
    process.exit(1)
});