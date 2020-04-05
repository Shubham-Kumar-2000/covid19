const User  = require('../Models/users');
const request=require('request-promise')
const fetch = require("node-fetch");
var  translate  = require("translate");
translate.engine = 'yandex';
translate.key = 'trnsl.1.1.20200404T172911Z.8807c71a358478e0.5b8c7874935ed24a13d01d4686738afe4c60be3a';
translate.from = 'en';
/*{
    "chatId": "hjvj",
    "phone": 919748669897,
    "body": "shubham"
}*/
async function trans(text){
    text=text.split('\n');
    let i=0;
    while(i<text.length){
        if(text[i]!=""||text[i]!=" "){
            text[i]=text[i].split('*');
            let j=0;
            while(j<text[i].length){
                if((text[i][j])&&(text[i][j]!=""&&text[i][j]!=" ")){
                    text[i][j]=await translate(text[i][j],"hi");
                    console.log(text[i][j])
                    //text[i][j]=text[i][j].text;
                    if(j%2==0)
                    text[i][j]=' '+text[i][j]+' ';
                }
                j+=1;
            }
            text[i]=text[i].join('*');
        }
        i+=1;
    }
    return text.join('\n');
}
exports.sendmsg=async (msg,change)=>{
    if(process.env.MODE=='DEV'&&msg.phone!='919748669897'){
        return true;
    }
    try{
        if(!(process.env.CHAT_API_INSTANCE&&process.env.CHAT_API_TOKEN))
        throw "Enviroment Variables Not set"
        if(change){
            try{
                let bb=await trans(msg.body);
                msg.body=bb;
            }
            catch(e){
                console.log(e)
                msg.body+='\n\nSorry our translator is not working.We will fix it soon.';
            }
        }
        let sentMessage=await request.post("https://api.chat-api.com/"+process.env.CHAT_API_INSTANCE+"/sendMessage?token="+process.env.CHAT_API_TOKEN,{json: true, body: msg})
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

        let hindimsg=message;
        try{
            let bb=await trans(message);
            hindimsg=bb;
        }
        catch(e){
            console.log(e)
            hindimsg+='\n\nSorry our translator is not working.We will fix it soon.';
        }
        while(i<users.length){
            let user=users[i],msg={body:message}
            if(user.lang!='ENGLISH')
            msg.body=hindimsg;
            msg.phone=user.number;
            this.sendmsg(msg,false).then(sent=>{
                if(!sent)
                console.log("Msg was not sent to : ",user.number)
            }).catch(e=>{
                console.log(e)
            });
            i+=1;
        }
        return true
    }
    catch(e){
        console.log(e)
        return false
    }
}
