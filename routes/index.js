var express = require('express');
var router = express.Router();
var util=require('../helpers/utils');
const Menu =  require('../Models/menu');
const User  = require('../Models/users');
const ChatApi= require('../helpers/chatApi')
const Message=require('../helpers/messge')
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);


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
router.post('/messages',async (req, res) => {
  
  try{
    let msgs=req.body.messages,i=0;
    console.log(msgs)
    if(!(msgs))
    return 
    while(i<msgs.length){
      let message=msgs[i];
      if(message.fromMe)
      {i+=1;continue;}
      let fromNum=message.chatId.split("@")[0];
      let recvMsg=message.body;
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
          await ChatApi.sendmsg({
            phone:user.number,
            body:"Your have been unsubscribed. Reply Hi to subscribe again"
          });
        }catch(err){
          await ChatApi.sendmsg({
            phone:user.number,
            body:"Internal server error! Try again or contact administrator"
          });
        }
        i+=1;continue;
      }
      if(parseInt(recvMsg)) {
        let menuName=user.lastServedMenuName;
        replyMsg += "MENU:\n\n";
        if(menuName==""){
          let menu= await Menu.findOne({name:"baseMenu"})
          menu.options.forEach(option => {
            replyMsg += option.slNo + ": *"+option.description+"*\n\n";
          });
          await ChatApi.sendmsg({
            phone:user.number,
            body:replyMsg
          })
          let updateUser=await User.setLastServedMenuName(user.number,"baseMenu");
        }
        else if(menuName == "baseMenu"){
          let choice = parseInt(recvMsg);
          if(choice==1){
            let menu= await Menu.findOne({name:"stateMenu"});
            menu.options.forEach(option => {
              replyMsg += option.slNo + ": *"+option.description+"*\n\n";
            });
            replyMsg += "Send Reply witn any option number....";
            await ChatApi.sendmsg({
              phone:user.number,
              body:replyMsg
            })
            let updateUser=await User.setLastServedMenuName(user.number,"stateMenu");
          }
          else if(choice == 2 || choice == 3){
            let menu= await Menu.findOne({name:"baseMenu"})
            await ChatApi.sendmsg({
              phone:user.number,
              body:menu.options[choice-1].output
            })
            let updateUser=await User.setLastServedMenuName(user.number,"");
          }
          else{
            let menu= await Menu.findOne({name:"baseMenu"})
            menu.options.forEach(option => {
              replyMsg += option.slNo + ": *"+option.description+"*\n\n";
            });
            await ChatApi.sendmsg({
              phone:user.number,
              body:replyMsg
            })
            let updateUser=await User.setLastServedMenuName(user.number,"baseMenu");
          }
        }
        else if(menuName == "stateMenu") {
          console.log("state menu",recvMsg)
          let menu= await Menu.findOne({name:"stateMenu"})
          let choice = parseInt(recvMsg);
          if(choice >= 1 && choice <= 34){
            let stateData=await util.getStateData(menu.options[choice-1].description)
            if(stateData.data.stateData.total==0)
            await ChatApi.sendmsg({
              phone:user.number,
              body:"Not a single case in this state.\n\nStill be Safe and be at Home"
            })
            else
            await ChatApi.sendmsg({
              phone:user.number,
              body:Message.stateToMessage(menu.options[choice-1].description,stateData)
            })
            let updateUser=await User.setLastServedMenuName(user.number,"");
          }
          else{
            menu.options.forEach(option => {
              replyMsg += option.slNo + ": *"+option.description+"*\n\n";
            });
            replyMsg += "Send Reply witn any option number....";
            await ChatApi.sendmsg({
              phone:user.number,
              body:replyMsg
            })
          }
        }else{
          let menu= await Menu.findOne({name:(menuName == "" ? "baseMenu" : menuName)})
          menu.options.forEach(option => {
            replyMsg += option.slNo + ": *"+option.description+"*\n\n";
          });
          await ChatApi.sendmsg({
            phone:user.number,
            body:replyMsg
          })
          let updateUser=await User.setLastServedMenuName(user.number,(menuName == "" ? "baseMenu" : menuName));
        
        }
      }
      else{
        console.log("here",recvMsg);
        if(recvMsg.toLocaleLowerCase()=='stop'&&!user.isAdmin){
          try{
            let delStatus = await User.findOneAndDelete({'number':user.number});
            await ChatApi.sendmsg({
              phone:user.number,
              body:"Your have been unsubscribed. Reply Hi to subscribe again"
            });
          }catch(err){
            await ChatApi.sendmsg({
              phone:user.number,
              body:"Internal server error! Try again or contact administrator"
            });
          }
          
        }else{
        let menuName=user.lastServedMenuName;
          let menu= await Menu.findOne({name:(menuName == "" ? "baseMenu" : menuName)})
          menu.options.forEach(option => {
            replyMsg += option.slNo + ": *"+option.description+"*\n\n";
          });
          console.log("Last sent");
          await ChatApi.sendmsg({
            phone:user.number,
            body:replyMsg
          })
          let updateUser=await User.setLastServedMenuName(user.number,(menuName == "" ? "baseMenu" : menuName));
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
