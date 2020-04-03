const User  = require('../Models/users');
const request=require('request-promise')
const fetch = require("node-fetch");

/*{
    "chatId": "hjvj",
    "phone": 919748669897,
    "body": "shubham"
}*/
exports.sendmsg=async (msg)=>{
    if(process.env.MODE=='DEV'&&msg.phone!='919748669897'){
        return true;
    }
    try{
        if(!(process.env.CHAT_API_INSTANCE&&process.env.CHAT_API_TOKEN))
        throw "Enviroment Variables Not set"
        let sentMessage=await request.post("https://api.chat-api.com/"+process.env.CHAT_API_INSTANCE+"/sendMessage?token="+process.env.CHAT_API_TOKEN,{json: true, body: msg})
        console.log(sentMessage)
        if(!(sentMessage.sent))
        {
            throw "An error from chatApi occured"
        }
        return true
    }
    catch(e){
        console.log(e)
        return false
    }
}
exports.sendToAll=async (message)=>{
    try{
        let users=await User.find(),i=0;
        while(i<users.length){
            let user=users[i],msg={body:message}
            msg.phone=user.number;
            let sent=await this.sendmsg(msg);
            if(!sent)
            console.log("Msg was not sent to : ",user.number)
            i+=1;
        }
        return true
    }
    catch(e){
        console.log(e)
        return false
    }
}