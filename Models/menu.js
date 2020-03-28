const mongoose = require('mongoose')

const menuSchema = mongoose.Schema({
    name:{
        type:String,
        unique:true
    },
    command:{
        type:String,
        unique:true
    },
    options:[{
        slNo:{
            type:Number
        },
        description:{
            type:String,
            default:true
        },
        static:{
            type:Boolean,
            default:true
        },
        action:{
            type:String
        },
        output:{
            type:String,
            default:""
        }

    }]
    
});

/**
 * {
 *      "name": "Select State"
 *      "command": "Latest Info"
 *      "options": {
 *          "slno": 1,
*           "description": "Bihar"
            "static": true,
            "action": getStateData(state),
            "output": ""
 *      }
 * }
 */

module.exports = mongoose.model('Menu', menuSchema);