const User  = require('../Models/users');
const request=require('request-promise')
const fetch = require("node-fetch");
var { translate } = require("google-translate-api-browser");

/*{
    "chatId": "hjvj",
    "phone": 919748669897,
    "body": "shubham"
}*/
exports.sendmsg=async (msg,change)=>{
    if(process.env.MODE=='DEV'&&msg.phone!='919748669897'){
        return true;
    }
    try{
        if(!(process.env.CHAT_API_INSTANCE&&process.env.CHAT_API_TOKEN))
        throw "Enviroment Variables Not set"
        if(change){
            let text=msg.body.split('\n');
            let i=0;
            console.log(text)
            while(i<text.length){
                if(text[i]!=""||text[i]!=" "){
                    text[i]=text[i].split('*');
                    let j=0;
                    while(j<text[i].length){
                        if(text[i][j]!=""||text[i][j]!=" "){
                            text[i][j]=await translate(text[i][j], { to: "hi" });
                            text[i][j]=text[i][j].text;
                            if(j%2==0)
                            text[i][j]+=' ';
                        }
                        j+=1;
                    }
                    text[i]=text[i].join('*');
                }
                i+=1;
            }
            msg.body=text.join('\n');
        }
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
        let hindimsg=await translate(message.body, { to: "hi" });
        while(i<users.length){
            let user=users[i],msg={body:message}
            if(user.lang!='ENGLISH')
            msg.body=hindimsg;
            msg.phone=user.number;
            let sent=await this.sendmsg(msg,false);
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