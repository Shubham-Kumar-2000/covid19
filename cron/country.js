require('dotenv').config({path: '.env'});
require('../Models/index').connect()
let Utills=require('../helpers/utils');

async function countries(){
    console.log("Updating Countries");
    await Utills.updateDB()
  }
countries().then(r=>{
    console.log("done")
    process.exit()
}).catch(e=>{
    console.log(e)
    process.exit(1)
});