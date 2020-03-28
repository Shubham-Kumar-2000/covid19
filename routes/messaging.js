var express = require('express');
var router = express.Router();
const State = require('../Models/state');
const User = require('../Models/users');
const Menu = require('../Models/menu');
const Message = require('../helpers/messge');
var util=require('../helpers/utils');
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);

/* GET home page. */
let sendOne = (toNum, msg) => {
  let def = new Promise((resolve,reject)=>{
  twilio.messages.create({
    from: 'whatsapp:+14155238886',
    body: msg,
    to: 'whatsapp:+'+toNum
  }).then(message => {
    resolve(message);
  }).catch(err => {
    reject(err);
  });
});
return def;
}

router.post('/reply', (req, res) => {

  let fromNum = parseInt(req.body.From.split('+')[1]);
  let recvMsg = req.body.Body;
  getOrSetUser(fromNum).then(user=>{
    let replyMsg = "";
    //// //console.log("User ",user);
    let command = recvMsg.split(':');
      if(user.isAdmin && command[0].toLocaleLowerCase() == 'command' && command.length>1){
          command.splice(0,1);
          replyMsg = command.join(":");
          //// //console.log("Reply msg",command)
          util.sendMessageToAll(replyMsg).then(u=>{
            //console.log("Success",u);
              return res.status(200).json({
                status: true,
                message: 'Success'
              });
          }).catch(e=>{
            //console.log("Errorrrr",e);
            return res.status(500).json({
              status: false,
              message: 'Error',
              error: e
            });
          });
      }
      else {
        if(parseInt(recvMsg)) {
          //Integer reply... check last menu
          getLastServedMenuName(fromNum).then(menuName => {
            replyMsg += "MENU:\n\n";
            if(menuName == "")
            {
              // no menu found, get base menu
              getMenu("baseMenu").then(menu => {
                menu.options.forEach(option => {
                  replyMsg += option.slNo + ": *"+option.description+"*\n\n";
                });
                replyMsg += "Send Reply witn any option number...."
                // send the menu
                sendOne(fromNum,replyMsg).then(result => {
                  // update the last send menu
                  setLastServedMenuName(fromNum,"baseMenu").then(value => {
                    return res.status(200).json({
                      status: true,
                      message: 'Success'
                    }) 
                  }).catch(e=>{
                    // //console.log("Menu Not Set",e);
                    return res.status(500).json({
                      status: false,
                      message: 'Menu Not Set',
                      error: e
                    })
                  });
                }).catch(e=>{
                    // //console.log("Message Not Sent",e);
                    return res.status(500).json({
                      status: false,
                      message: 'Message Not Sent',
                      error: e
                    })
                  });
              }).catch(e=>{
                // //console.log("Menu Not Found",e);
                return res.status(500).json({
                  status: false,
                  message: 'Menu Not Found',
                  error: e
                })
              });
            }
            else if(menuName == "baseMenu")
            {
              let choice = parseInt(recvMsg);
              if(choice == 1)
              {
              // base menu supplied previously, get the state menu as choice is 1
              getMenu("stateMenu").then(menu => {
                menu.options.forEach(option => {
                  replyMsg += option.slNo + ": *"+option.description+"*\n\n";
                });
                replyMsg += "Send Reply witn any option number...."
                // send the menu
                sendOne(fromNum,replyMsg).then(result => {
                  setLastServedMenuName(fromNum,"stateMenu").then(value => {
                    return res.status(200).json({
                      status: true,
                      message: 'Success'
                    }) 
                  }).catch(e=>{
                    // //console.log("Menu Not Set",e);
                    return res.status(500).json({
                      status: false,
                      message: 'Menu Not Set',
                      error: e
                    })
                  });
                }).catch(e=>{
                    // //console.log("Message Not Sent",e);
                    return res.status(500).json({
                      status: false,
                      message: 'Message Not Sent',
                      error: e
                    })
                  });
              }).catch(e=>{
                // //console.log("Menu Not Found",e);
                return res.status(500).json({
                  status: false,
                  message: 'Menu Not Found',
                  error: e
                })
              });
              }
              else if(choice == 2 || choice == 3)
              {
                getMenu("baseMenu").then(menu => {
                    sendOne(fromNum,menu.options[choice-1].output.replace(/;/g,"\n")).then(result => {
                      setLastServedMenuName(fromNum,"").then(value => {
                        return res.status(200).json({
                          status: true,
                          message: 'Success'
                        }) 
                      }).catch(e=>{
                        // //console.log("Menu Not Set",e);
                        return res.status(500).json({
                          status: false,
                          message: 'Menu Not Set',
                          error: e
                        })
                      });
                    }).catch(e=>{
                        // //console.log("Message Not Sent",e);
                        return res.status(500).json({
                          status: false,
                          message: 'Message Not Sent',
                          error: e
                        })
                      });
                  }).catch(e=>{
                    // //console.log("Menu Not Found",e);
                    return res.status(500).json({
                      status: false,
                      message: 'Menu Not Found',
                      error: e
                    })
                  });
              }
              else {
                // invalid choice, return the same menu again
              getMenu("baseMenu").then(menu => {
                menu.options.forEach(option => {
                  replyMsg += option.slNo + ": *"+option.description+"*\n\n";
                });
                replyMsg += "Send Reply witn any option number...."
                // send the menu
                sendOne(fromNum,replyMsg).then(result => {
                    return res.status(200).json({
                      status: true,
                      message: 'Success'
                    })
                }).catch(e=>{
                    // //console.log("Message Not Sent",e);
                    return res.status(500).json({
                      status: false,
                      message: 'Message Not Sent',
                      error: e
                    })
                  });
              }).catch(e=>{
                // //console.log("Menu Not Found",e);
                return res.status(500).json({
                  status: false,
                  message: 'Menu Not Found',
                  error: e
                })
              });
              }
            }
            else if(menuName == "stateMenu") {
              let choice = parseInt(recvMsg);
              if(choice >= 1 && choice <= 33)
              {
              getMenu("stateMenu").then(menu => {
                util.getStateDataNew(menu.options[choice-1].description).then(data => {
                  sendOne(fromNum,Message.stateToMessage(menu.options[choice-1].description,data)).then(result => {
                    setLastServedMenuName(fromNum,"").then(value => {
                      return res.status(200).json({
                        status: true,
                        message: 'Success'
                      }) 
                    }).catch(e=>{
                      // //console.log("Menu Not Set",e);
                      return res.status(500).json({
                        status: false,
                        message: 'Menu Not Set',
                        error: e
                      })
                    });
                  }).catch(e=>{
                      // //console.log("Message Not Sent",e);
                      return res.status(500).json({
                        status: false,
                        message: 'Message Not Sent',
                        error: e
                      })
                    });
                }).catch(e=>{
                  // //console.log("Menu Not Found",e);
                  return res.status(500).json({
                    status: false,
                    message: 'State Data Not Found',
                    error: e
                  })
                });
              }).catch(e=>{
                // //console.log("Menu Not Found",e);
                return res.status(500).json({
                  status: false,
                  message: 'Menu Not Found',
                  error: e
                })
              });
            }
            else {
              // invalid choice, return the same menu again
            getMenu("stateMenu").then(menu => {
              menu.options.forEach(option => {
                replyMsg += option.slNo + ": *"+option.description+"*\n\n";
              });
              replyMsg += "Send Reply witn any option number...."
              // send the menu
              sendOne(fromNum,replyMsg).then(result => {
                  return res.status(200).json({
                    status: true,
                    message: 'Success'
                  })
              }).catch(e=>{
                  // //console.log("Message Not Sent",e);
                  return res.status(500).json({
                    status: false,
                    message: 'Message Not Sent',
                    error: e
                  })
                });
            }).catch(e=>{
              // //console.log("Menu Not Found",e);
              return res.status(500).json({
                status: false,
                message: 'Menu Not Found',
                error: e
              })
            });
            }
            }
          }).catch(e=>{
            // //console.log("Menu Name Not Found",e);
            return res.status(500).json({
              status: false,
              message: 'Menu Name Not Found',
              error: e
            })
          });
        }
        else {
          getLastServedMenuName(fromNum).then(menuName => {
            replyMsg += "MENU:\n\n";
            //No integer reply... get the last menu served
            getMenu(menuName == "" ? "baseMenu" : menuName).then(menu => {
              menu.options.forEach(option => {
                replyMsg += option.slNo + ": *"+option.description+"*\n\n";
              });
              replyMsg += "Send Reply witn any option number...."
              // send the menu
              sendOne(fromNum,replyMsg).then(result => {
                //update the last served menu
                setLastServedMenuName(fromNum,menuName == "" ? "baseMenu" : menuName).then(value => {
                  return res.status(200).json({
                    status: true,
                    message: 'Success'
                  }) 
                }).catch(e=>{
                  // //console.log("Menu Not Set",e);
                  return res.status(500).json({
                    status: false,
                    message: 'Menu Not Set',
                    error: e
                  })
                });
              }).catch(e=>{
                  // //console.log("Message Not Sent",e);
                  return res.status(500).json({
                    status: false,
                    message: 'Message Not Sent',
                    error: e
                  })
                });
            }).catch(e=>{
              // //console.log("Menu Not Found",e);
              return res.status(500).json({
                status: false,
                message: 'Menu Not Found',
                error: e
              })
            });
          }).catch(e=>{
            // //console.log("Last Menu Not Found",e);
            return res.status(500).json({
              status: false,
              message: 'Last Menu Not Found',
              error: e
            })
          });
        }
      }
  }).catch(err=>{
    // //console.log("Get Set problem",e);
    return res.status(500).json({
      status: false,
      message: 'Get Set problem',
      error: err
    })
  })
  
});
const getMenu = (name)=>{
  let def = new Promise((resolve,reject)=>{
    Menu.findOne({name},(err,userT)=>{
      if(err) reject(err);
      resolve(userT);
    })
  });
  return def;
}

const getOrSetUser = (number)=>{
  let def = new Promise((resolve,reject)=>{
    //// //console.log(number);
    User.findOne({number:number},(err,userT)=>{
      if(err) reject(err);
      if(userT){
        //// //console.log("find");
        resolve(userT);
      }else{
        try {
          let user = new User({number:number});
          //// //console.log("Save ",user);
          user.save().then(u=>{
            //// //console.log("save")
              resolve(u);
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
      user = userT;
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
