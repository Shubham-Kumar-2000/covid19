var express = require('express');
var router = express.Router();
const User  = require('../Models/users');
const Feedback  = require('../Models/feedback');
const Menu = require('../Models/menu');
const cmd = require('node-cmd');
const ChatApi= require('../helpers/chatApi')
/* GET users listing. */
router.post('/addMenu', function(req, res, next) {
    Menu.findOne({$or:[{name: req.body.menu.name},{command:req.body.menu.command}]},(err,menu)=>{
        if(err) return res.status(500).json({
            'err':err
        })
        if(menu){
            return res.status(200).json({
                'status':0,
                'msg':'Already exist',
                'data':menu
            });
        }
        try {
            let menu = new Menu(req.body.menu);
            //console.log("menu ",menu)
            menu.save().then(m=>{
                //console.log("save")
                return res.status(200).json({
                    'status':1,
                    'msg':'Created'
                });
            }).catch(e=>{
                //console.log("err ",e)
                return res.status(500).json({
                    'err':e
                });
            })
        } catch (error) {
             return res.status(500).json({
                'err':error,
                'msg':'problem in req.body.menu'
            });
        }
    })
});

router.get('/getMenu/:menuName', function(req, res, next) {
    Menu.findOne({"name":req.params.menuName},(err,menu)=>{
        if(err) return res.status(500).json({
            'err':err
        })
        if(menu){
            return res.status(200).json({
                'status':0,
                'msg':'Already exist',
                'data':menu
            });
        }
    })
});

router.post('/sendMessage',(req, res) => {
    if(!(req.body.typ && req.body.message))
        return res.status(500).send('Request body problem...');
    if(req.body.typ == 'admin-only') {
        ChatApi.sendToAdmins(req.body.message);
        res.status(200).send('Message sent to admins only');
    }
    else if(req.body.typ == 'everyone') {
        ChatApi.sendToAll(req.body.message);
        res.status(200).send('Message sent to all subscribers');
    }
    else
        res.status(500).send('Message not sent to anyone, "typ" is not matching with "admin-only" or "everyone"');
});

router.get('/total',async (req, res) => {
    try{
    let users=await User.allSorted();
    res.status(200).json({err:false,users:users})
    }
    catch(e){
      console.log(e)
      res.status(200).json({err:true,msg:e})
    }
});

router.get('/feedback',async (req, res) => {
    try{
    let feedback = await Feedback.all();
    res.status(200).json({err:false,feedback:feedback})
    }
    catch(e){
      console.log(e)
      res.status(200).json({err:true,msg:e})
    }
});

router.get('/userActive',async (req, res) => {
    try{
        let users = await User.find({});
        if(users){
            users.forEach(async (user)=>{
                if(!user.hasOwnProperty('active')){
                    user['active']=true;
                    let newUser = await user.save();
                }
            });
        }
        res.status(200).json({
            'status':1,
            'msg':'updated',
        })
    }
    catch(e){
      console.log(e)
      res.status(200).json({err:true,msg:e})
    }
});
router.get('/npm-install',(req,res,next)=>{
  let command = 'npm install';
  cmd.get(
    command,
    function(err, data, stderr){
        if(err){
            return res.status(200).json({
                status:0,
                error:err
            })
        }
        return res.status(200).json({
            status:1,
            result:data,
            stderr:stderr,
            msg:'end'
        })
    }
  );
})

router.get('/git-pull',(req,res,next)=>{
  let command = 'git pull https://github.com/Shubham-Kumar-2000/covid19.git master';
  cmd.get(
    command,
    function(err, data, stderr){
        if(err){
            return res.status(200).json({
                status:0,
                error:err
            })
        }
        return res.status(200).json({
            status:1,
            result:data,
            stderr:stderr,
            msg:'end'
        })
    }
  );
})

router.post('/updateInstance',(req,res,next)=>{
  let chat_inst = req.body.instance?req.body.instance:null;
  let chat_token = req.body.token?req.body.token:null;
  if(chat_inst&&chat_token){ //sed -i 's/.*CHAT_API_INSTANCE.*/CHAT_API_INSTANCE=chat_inst/g' ../.env | sed -i 's/.*CHAT_API_TOKEN.*/CHAT_API_TOKEN=chat_token/g' ../.env
    let command = `sed -i 's/.*CHAT_API_INSTANCE.*/CHAT_API_INSTANCE=${chat_inst}/g' .env | sed -i 's/.*CHAT_API_TOKEN.*/CHAT_API_TOKEN=${chat_token}/g' .env`
    cmd.get(
      command,
      function(err, data, stderr){
          if(err){
              return res.status(200).json({
                  status:0,
                  error:err
              })
          }
          return res.status(200).json({
              status:1,
              result:data,
              stderr:stderr,
              msg:'end'
          })
      }
  );
  }else{
    res.status(500).json({
      'msg':'instance and token required'
    })
  }
})

router.post('/cmd',(req,res,next)=>{
  if(req.body.type=='get'){
      console.log(req.body.cmd);
      cmd.get(
          req.body.cmd,
          function(err, data, stderr){
              if(err){
                  return res.status(200).json({
                      status:0,
                      error:err
                  })
              }
              return res.status(200).json({
                  status:1,
                  result:data,
                  stderr:stderr,
                  msg:'end'
              })
          }
      );
  }else{
      cmd.run(req.body.cmd);
      return res.status(200).json({
          status:1,
          msg:'running'
      })
  }
});

module.exports = router;
