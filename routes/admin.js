var express = require('express');
var router = express.Router();
var util=require('../helpers/utils');
const Menu = require('../Models/menu');
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
            ////console.log("menu ",menu)
            menu.save().then(m=>{
                ////console.log("save")
                return res.status(200).json({
                    'status':1,
                    'msg':'Created'
                });
            }).catch(e=>{
                ////console.log("err ",e)
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

module.exports = router;
