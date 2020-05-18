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
        if(text[i]!=""&&text[i]!=" "){
            text[i]=text[i].split('*').join('');
            text[i]=await translate(text[i],{to:"hi",from:'en'});
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
            console.log(sentMessage)
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
        let users=await User.find({'active':true});

        let hindimsg=message;
        try{
            let bb=await trans(message);
            hindimsg=bb;
        }
        catch(e){
            console.log(e)
            hindimsg+='\n\nSorry our translator is not working.We will fix it soon.';
        }
        let i=0,l=users.length,low=0,u=0;
        while(true){
            i=i+75
            u=i<l?i:l;
            subUsers=users.slice(low,u)
            await Promise.all(
                subUsers.map(async(user)=>{
                    try{
                        let msg={body:message}
                        if(user.lang!='ENGLISH')
                        msg.body=hindimsg;
                        msg.phone=user.number;
                        let sent=await this.sendmsg(msg,false)
                        if(!sent)
                        console.log("Msg was not sent to : ",user.number)
                    }catch(e){
                        console.log(e)
                    }
                })
            )
            console.log("sent to batch :",low,u)
            low=u
            if(u==l || i>=l)
            break;
        }
        return true
    }
    catch(e){
        console.log(e)
        return false
    }
}
exports.sendToAdmins=async (message)=>{
    try{
        let users=await User.find({isAdmin:true}),i=0;

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
            let user=users[i],msg={body:"DEV MODE ON, ONLY ADMINS\n\n"+message}
            if(user.lang!='ENGLISH')
            msg.body=hindimsg;
            msg.phone=user.number;
            let sent=await this.sendmsg(msg,false)
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

/*{
    "phone": 919748669897,
    "body": "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg",
    "filename": "chart.png",
    "caption": "text"
  }*/
exports.sendFile=async (msg,change)=>{
    if(process.env.MODE=='DEV'&&msg.phone!='919748669897'){
        return true;
    }
    try{
        if(!(process.env.CHAT_API_INSTANCE&&process.env.CHAT_API_TOKEN))
        throw "Enviroment Variables Not set"
        if(change){
            try{
                let bb=await trans(msg.caption);
                msg.caption=bb;
            }
            catch(e){
                console.log(e)
                msg.caption+='\n\nSorry our translator is not working.We will fix it soon.';
            }
        }
        let sentMessage=await request.post("https://api.chat-api.com/"+process.env.CHAT_API_INSTANCE+"/sendFile?token="+process.env.CHAT_API_TOKEN,{json: true, body: msg})
        //console.log(sentMessage)
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
exports.sendFileToAll=async (link,filename,caption)=>{
    try{
        let users=await User.find({'active':true}),i=0;

        let hindimsg=caption;
        try{
            let bb=await trans(caption);
            hindimsg=bb;
        }
        catch(e){
            console.log(e)
            hindimsg+='\n\nSorry our translator is not working.We will fix it soon.';
        }
        while(i<users.length){
            let user=users[i],msg={caption:caption,filename:filename,body:link}
            if(user.lang!='ENGLISH')
            msg.caption=hindimsg;
            msg.phone=user.number;
            let sent = await this.sendFile(msg,false)
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
exports.sendFileToAdmin=async (link,filename,caption)=>{
    try{
        console.log("called")
        let users=await User.find({isAdmin:true}),i=0;

        let hindimsg=caption;
        try{
            let bb=await trans(caption);
            hindimsg=bb;
        }
        catch(e){
            console.log(e)
            hindimsg+='\n\nSorry our translator is not working.We will fix it soon.';
        }
        while(i<users.length){
            let user=users[i],msg={caption:caption,filename:filename,body:link}
            if(user.lang!='ENGLISH')
            msg.caption=hindimsg;
            msg.phone=user.number;
            let sent = await this.sendFile(msg,false)
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