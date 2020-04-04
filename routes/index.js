var express = require('express');
var router = express.Router();
var util=require('../helpers/utils');
const Menu =  require('../Models/menu');
const User  = require('../Models/users');
const ChatApi= require('../helpers/chatApi')
const Message=require('../helpers/messge')
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);
const District  = require('../Models/district');
const State  = require('../Models/state');
const Feedback  = require('../Models/feedback');
var { translate } = require("google-translate-api-browser");

router.post('/createmenu', (req, res) => {
  new Menu(req.body).save().then(menu => {
    return res.status(200).json({
      status: true,
      message: 'Menu added',
      data: menu
    });
  }).catch(err => {
    return res.status(500).json({
      status: false,
      message: 'Menu not added',
      error: err
    });
  })
});
/*{
  "messages": [
    {
      "id": "false_17472822486@c.us_DF38E6A25B42CC8CCE57EC40F",
      "body": "Ok!",
      "type": "chat",
      "senderName": "Ilya",
      "fromMe": true,
      "author": "17472822486@c.us",
      "time": 1504208593,
      "chatId": "17472822486@c.us",
      "messageNumber": 100
    }
  ]
}*/
router.get('/date',async (req, res) => {

res.status(200).json({date:require('../helpers/messge').starting()})
}
)
router.get('/sendMessages',async (req, res) => {
  res.status(200).json({s:'s'})
  util.getUpdates()
}
)
router.get('/total',async (req, res) => {
  try{
  let users=await User.all();
  res.status(200).json({err:false,users:users.length})
  }
  catch(e){
    console.log(e)
    res.status(200).json({err:true,msg:e})
  }
}
)
router.post('/search',async (req, res) => {
  try{
  let states=await State.search(req.body.text);
  let districts=await District.search(req.body.text);
  
  res.status(200).json({err:false,state:states,district:districts})
  }
  catch(e){
    console.log(e)
    res.status(200).json({err:true,msg:e})
  }
}
)
router.post('/messages',async (req, res) => {
  try{
    let msgs=req.body.messages,i=0;
    if(!(msgs))
    {throw "undefined" }
    while(i<msgs.length){
      let message=msgs[i];
      if(message.fromMe)
      {i+=1;continue;}
      let fromNum=message.chatId.split("@")[0];
      let recvMsg=await translate(message.body, { to: "en" });
      recvMsg=recvMsg.text;
      let hindiZero='०';
      if(recvMsg.length==1){
        hindiZero=recvMsg.charCodeAt(0)-hindiZero.charCodeAt(0);
        if(hindiZero>=0&&hindiZero<=9)
        recvMsg=String(hindiZero);
      }
      if(recvMsg.length==2){
        let temporary,temporary1;
        temporary=recvMsg.charCodeAt(0)-hindiZero.charCodeAt(0);
        temporary1=recvMsg.charCodeAt(1)-hindiZero.charCodeAt(0);
        if((temporary>=0&&temporary<=9)&&(temporary1>=0&&temporary1<=9))
        recvMsg=String(temporary)+String(temporary1);
      }
      let replyMsg="";
      let user=await User.findOne({number:fromNum})
      if(!(user))
      {
        user=new User({number:fromNum});
        await user.save()
      }
      if(user.isAdmin){
        let command = recvMsg.split(':');
        if(command[0].toLocaleLowerCase()=='command'&&command.length>1){
          command.splice(0,1);
          replyMsg = command.join(":");
          let sentMessages=ChatApi.sendToAll(replyMsg);
          
          i+=1;continue;
        }

      }
      if(recvMsg.toLocaleLowerCase()=='stop'&&!user.isAdmin){
        try{
          let delStatus = await User.findOneAndDelete({'number':user.number});
           ChatApi.sendmsg({
            phone:user.number,
            body:"Your have been unsubscribed. Reply Hi to subscribe again"
          },user.lang!='ENGLISH');
        }catch(err){
           ChatApi.sendmsg({
            phone:user.number,
            body:"Internal server error! Try again or contact administrator"
          },user.lang!='ENGLISH');
        }
        i+=1;continue;
      }
      if(recvMsg.toLocaleLowerCase()=='hi'){
        user.lastServedMenuName="";
      }
      if(parseInt(recvMsg)) {
        let menuName=user.lastServedMenuName;
        replyMsg += "MENU:\n\n";
        if(menuName==""){
          let menu= await Menu.findOne({name:"baseMenu"})
          menu.options.forEach(option => {
            replyMsg += option.slNo + " : *"+option.description+"*\n\n";
          });
           ChatApi.sendmsg({
            phone:user.number,
            body:replyMsg
          },user.lang!='ENGLISH')
          let updateUser=await User.setLastServedMenuName(user.number,"baseMenu");
        }
        else if(menuName == "baseMenu"){
          let choice = parseInt(recvMsg);
          if(choice==1){
            let menu= await Menu.findOne({name:"stateMenu"});
            menu.options.forEach(option => {
              replyMsg += option.slNo + " : *"+option.description+"*\n\n";
            });
            replyMsg += "Send Reply witn any option number....";
             ChatApi.sendmsg({
              phone:user.number,
              body:replyMsg
            },user.lang!='ENGLISH')
            let updateUser=await User.setLastServedMenuName(user.number,"stateMenu");
          }
          else if(choice >= 2 && choice <= 5){
            let menu= await Menu.findOne({name:"baseMenu"})
            if(choice == 4) {
              replyMsg = "*Language Options* :\n\n1. *English* \n2. *Hindi*";
               ChatApi.sendmsg({
                phone:user.number,
                body:replyMsg
              },user.lang!='ENGLISH')
              let updateUser=await User.setLastServedMenuName(user.number,"langMenu");
              
            }
            else{
             ChatApi.sendmsg({
              phone:user.number,
              body:menu.options[choice-1].output.split(';').join('\n')
            },user.lang!='ENGLISH')
            let updateUser=await User.setLastServedMenuName(user.number,choice == 5 ? "feedback" : "");}
          }
          else{
            let menu= await Menu.findOne({name:"baseMenu"})
            menu.options.forEach(option => {
              replyMsg += option.slNo + " : *"+option.description+"*\n\n";
            });
             ChatApi.sendmsg({
              phone:user.number,
              body:replyMsg
            },user.lang!='ENGLISH')
          }
        }
        else if(menuName == "stateMenu") {
          let menu= await Menu.findOne({name:"stateMenu"})
          let choice = parseInt(recvMsg);
          if(choice >= 1 && choice <= 35){
            let stateData=await util.getStateData(menu.options[choice-1].description);
            let stateName = menu.options[choice-1].description;
            if(stateData.data.stateData.total==0)
             ChatApi.sendmsg({
              phone:user.number,
              body:"Not a single case in this state.\n\nStill be Safe and be at Home"
            },user.lang!='ENGLISH')
            else
             ChatApi.sendmsg({
              phone:user.number,
              body:Message.stateToMessage(menu.options[choice-1].description,stateData)
            },user.lang!='ENGLISH');

            let menu2= await Menu.findOne({name:"districtMenu@"+stateName});
            if(menu2){
              replyMsg = `We are having information about these districts under the *${stateName}* state\n\n`;
              menu2.options.forEach(option => {
                replyMsg += option.slNo + " : *"+option.description+"*\n\n";
              });
              replyMsg += "Send Reply witn any option number....";
               ChatApi.sendmsg({
                phone:user.number,
                body:replyMsg
              },user.lang!='ENGLISH')
              let updateUser=await User.setLastServedMenuName(user.number,"districtMenu@"+stateName);
            }else{
              let updateUser=await User.setLastServedMenuName(user.number,"");
            }
            
          }
          else{
            menu.options.forEach(option => {
              replyMsg += option.slNo + " : *"+option.description+"*\n\n";
            });
            replyMsg += "Send Reply witn any option number....";
             ChatApi.sendmsg({
              phone:user.number,
              body:replyMsg
            },user.lang!='ENGLISH')
          }
        }else if(menuName.indexOf('districtMenu@') !=-1) {
          let districtMenu =await Menu.findOne({'name':menuName});
          if(districtMenu){
              let stateName = menuName.split('@')[1];
              let choice = parseInt(recvMsg);
              if(choice >= 1 && choice <= districtMenu.options.length){
                let districtName = districtMenu.options[choice-1].description;
                let districtData =await District.getDistrictByName(districtName,stateName);
                if(!districtData|| districtData.confirmedCases==0)
                 ChatApi.sendmsg({
                  phone:user.number,
                  body:"Not a single case in this District.\n\nStill be Safe and be at Home"
                },user.lang!='ENGLISH')
                else
                 ChatApi.sendmsg({
                  phone:user.number,
                  body:Message.DistrictToMessage(districtData)
                },user.lang!='ENGLISH');
                let updateUser=await User.setLastServedMenuName(user.number,"");
              }
              else{
                let menu2= await Menu.findOne({name:"districtMenu@"+stateName});
                replyMsg = `Selecet valid choice\nDistricts under the *${stateName}* state\n`;
                menu2.options.forEach(option => {
                  replyMsg += option.slNo + " : *"+option.description+"*\n\n";
                });
                replyMsg += "Send Reply witn any option number....";
                 ChatApi.sendmsg({
                  phone:user.number,
                  body:replyMsg
                },user.lang!='ENGLISH')
              }

          }else{
            let replyMsg = "No data available";
            ChatApi.sendmsg({
              phone:user.number,
              body:replyMsg
            },user.lang!='ENGLISH');
            let updateUser=await User.setLastServedMenuName(user.number,"");
          }
          
        }else if(menuName=='langMenu'){
          if(recvMsg==1){
            user=await User.setLang(user.number,"ENGLISH");
            replyMsg = "Language changed to ENGLISH";
               ChatApi.sendmsg({
                phone:user.number,
                body:replyMsg
              },user.lang!='ENGLISH')
          }
          else if(recvMsg==2){
            user=await User.setLang(user.number,"HINDI");
            replyMsg = "Language changed to HINDI";
               ChatApi.sendmsg({
                phone:user.number,
                body:replyMsg
              },user.lang!='ENGLISH')
          }
          else{
            replyMsg = "*Language Options* :\n\n1. *English* \n2. *Hindi*";
               ChatApi.sendmsg({
                phone:user.number,
                body:replyMsg
              },user.lang!='ENGLISH')
          }
        }
        else{
          let menu= await Menu.findOne({name:(menuName == "" ? "baseMenu" : menuName)})
          menu.options.forEach(option => {
            replyMsg += option.slNo + " : *"+option.description+"*\n\n";
          });
           ChatApi.sendmsg({
            phone:user.number,
            body:replyMsg
          },user.lang!='ENGLISH')
          let updateUser=await User.setLastServedMenuName(user.number,(menuName == "" ? "baseMenu" : menuName));
        
        }
      }
      else{
        if(user.lastServedMenuName == "feedback") {
          let savefb = await Feedback.saveOrUpdateFeedback(user.number,recvMsg);
           ChatApi.sendmsg({
            phone:user.number,
            body:"Your Feedback: "+recvMsg+"\n\n*Thanks for your valuable feedback :)*"
          },user.lang!='ENGLISH')
          let updateUser=await User.setLastServedMenuName(user.number,"");
        }
        else {
          let states=await State.search(recvMsg);
          let districts=await District.search(recvMsg);
          if(states.length!=0||districts.length!=0){
            replyMsg="Some Data based on our understanding of your msg....\n\n";
            if(states.length!=0){
              replyMsg+="*State Data* :\n\n";
              let ind=0;
              while(ind<states.length){
                let state=states[ind];
                replyMsg+=Message.searchState(state);
                ind+=1;
              }
            }
            if(districts.length!=0){
              replyMsg+="*Districts Data* :\n\n";
              let ind=0;
              while(ind<districts.length){
                let district=districts[ind];
                replyMsg+=(Message.DistrictToMessage(district)+"\n\n");
                ind+=1;
              }
            }
            replyMsg+="*For more information follow the menu.*"
             ChatApi.sendmsg({
              phone:user.number,
              body:replyMsg
            },user.lang!='ENGLISH');
        }else{
        let menuName=user.lastServedMenuName;
          let menu= await Menu.findOne({name:(menuName == "" ? "baseMenu" : menuName)})
          menu.options.forEach(option => {
            replyMsg += option.slNo + " : *"+option.description+"*\n\n";
          });
           ChatApi.sendmsg({
            phone:user.number,
            body:replyMsg
          },user.lang!='ENGLISH')
          let updateUser=await User.setLastServedMenuName(user.number,(menuName == "" ? "baseMenu" : menuName));
        }
      }
      }
      i+=1
    }
    res.status(200).json({err:false})
  }
  catch(e){
    console.log(e);
    res.status(200).json({err:false})
  }
});
const registerNewUser = (number)=>{
  let def = new Promise((resolve,reject)=>{
    User.findOne({number:number},(err,userT)=>{
      if(err) reject(err);
      if(userT){
          resolve(userT);
      }
      try {
          let user = new User({number:number});
          user.save().then(u=>{
              resolve(null);
          }).catch(e=>{
              reject(e);
          })
      } catch (error) {
          reject(error);
      }
    })
  });
  return def;
}

const isAdmin = (number)=>{
  let def = new Promise((resolve,reject)=>{
    User.findOne({number:number},(err,userT)=>{
      if(err) reject(err);
      if(userT){
        resolve(userT.isAdmin);
      }else{
        try {
          let user = new User({number:number});
          user.save().then(u=>{
              resolve(false);
          }).catch(e=>{
              reject(e);
          })
        } catch (error) {
            reject(error);
        }
      }
    });
  });
  return def;
}

const getLastServedMenuName = (number)=>{
  let def = new Promise((resolve,reject)=>{
    User.findOne({number:number},(err,userT)=>{
      if(err) reject(err);
      if(userT){
        resolve(userT.lastServedMenuName);
      }else{
        try {
          let user = new User({number:number});
          user.save().then(u=>{
              resolve(u.lastServedMenuName);
          }).catch(e=>{
              reject(e);
          })
        } catch (error) {
            reject(error);
        }
      }
    });
  });
  return def;
}

const setLastServedMenuName = (number,menuName)=>{
  let def = new Promise((resolve,reject)=>{
    User.findOne({number:number},(err,userT)=>{
      if(err) reject(err);
      let user = new User({number:number});
      if(userT){
        user = userT;
      }
      user.lastServedMenuName = menuName;
      user.save().then(u=>{
          resolve(u);
      }).catch(e=>{
          reject(e);
      })
    });
  });
  return def;
}

module.exports = router;
