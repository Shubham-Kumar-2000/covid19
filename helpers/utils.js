var express = require('express');
const fetch = require("node-fetch");
const Message = require('./messge');
const User = require('../Models/users');
const State = require('../Models/state');
const request=require('request-promise')
const StateMethods = require('../Models/stateMethods');
const ChatApi=require('./chatApi')
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);

function check(arr,nn) {
    let i=0;
    while(i<arr.length){
        if(arr[i].loc==nn){
            return {found:true,id:i}
        }
        i+=1;
    }
    return {found:false}
}
function getDataByState(arr,state){
    let data=[];
    arr.forEach(patient => {
        if(patient.state==state)
        data.push(patient)
    });
    return data
}
function stateCasesCounter(data){
    let states={};
    data.forEach(patient => {
        if(states[patient.state])
        states[patient.state]+=1;
        else
        states[patient.state]=1;
    });
    return states;
}
exports.getStateData  =async (state)=>{
    try{
        let liveData=await fetch("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(result=>{return result.json()})
        let liveOfficialData=await fetch("https://api.rootnet.in/covid19-in/stats/latest").then(result=>{return result.json()})
        if((!(liveData.success))||(!(liveOfficialData.success)))
        throw "Api not responding"
        liveData=liveData.data;
        liveOfficialData=liveOfficialData.data;
        let totalCases=liveData.summary.total;
        let patients=liveData.rawPatientData;
        let stateData={
            total:0,
            lastreported:"None till now",
            rocovered:0,
            deaths:0
        };
        let chk=check(liveOfficialData.regional,state)
        if(chk.found)
        {
            stateData.rocovered=liveOfficialData.regional[chk.id]['discharged'];
            stateData.deaths=liveOfficialData.regional[chk.id]['deaths'];
        }
        patients=await getDataByState(patients,state)
        if(patients.length>0)
        {
            patients.sort((a,b)=>{
                b.date=new Date(b.reportedOn);
                a.date=new Date(a.reportedOn);
                return b.date-a.date
            })
            stateData.lastreported=patients[patients.length-1];
            stateData.total=patients.length;

        }
        return {err:false,data:{
            total:totalCases,
            stateData:stateData
        }}
    }catch(e){
        ////console.log(e);
        return {err:true,msg:e}
    }
}

let updateAllStates = (stateNames,states)=>{

    let promises = [];
    stateNames.forEach(stateName=>{
        let def = new Promise((resolve,reject)=>{
            StateMethods.getStateByName(stateName).then(res1 => {
                if(!res1.status)
                    reject(res1);
                currState = res1.data;
                if(!currState)
                {
                    StateMethods.addNew(stateName).then(res2 => {
                        if(!res2.status)
                            reject(res2);
                        currState = res2.data;
                        if(currState.lastRecorded!=states[stateName]){
                            this.getStateDataNew(stateName).then(res3 => {
                                StateMethods.updateState(stateName,states[stateName]).then(res4 => {
                                    if(res4.status)
                                        resolve({
                                            status: true,
                                            message: Message.stateToMessage(stateName,res3,true,states[stateName]-state.lastRecorded),
                                            updated: true,
                                            block: 'A1'
                                        });
                                    else
                                        reject({
                                            status: false,
                                            message: "",
                                            updated: false,
                                            block: 'A2'
                                        });
                                    }).catch(err4=>{
                                        reject({
                                            status: false,
                                            message: JSON.stringify(err4),
                                            updated: false,
                                            block: 'A3'
                                        });
                                    });
                                    
                                }).catch(err3=>{
                                    reject({
                                        status: false,
                                        message: JSON.stringify(err3),
                                        updated: false,
                                        block: 'A4'
                                    });
                                });
                        }
                    }).catch(err2=>{
                        reject({
                            status: false,
                            message: JSON.stringify(err2),
                            updated: false,
                            block: 'A5'
                        });
                });
            }
            else {
                if(currState.lastRecorded!=states[stateName]){
                    this.getStateDataNew(stateName).then(res3 => {
                        StateMethods.updateState(stateName,states[stateName]).then(res4 => {
                            if(res4.status)
                                resolve({
                                    status: true,
                                    message: Message.stateToMessage(stateName,res3,true,states[stateName]-state.lastRecorded),
                                    updated: true,
                                    block: 'B1'
                                });
                            else
                                reject({
                                    status: false,
                                    message: "",
                                    updated: false,
                                    block: 'B2'
                                });
                            }).catch(err4=>{
                                reject({
                                    status: false,
                                    message: JSON.stringify(err4),
                                    updated: false,
                                    block: 'B3'
                                });
                            });
                            
                        }).catch(err3=>{
                            reject({
                                status: false,
                                message: JSON.stringify(err3),
                                updated: false,
                                block: 'B4'
                            });
                        });
                }
            }
            }).catch(err1=>{
                reject({
                    status: false,
                    message: JSON.stringify(err1),
                    updated: false,
                    block: 'B5'
                });
            });
        });
        promises.push(def);
    });
    return promises;
}

exports.getUpdates=async()=>{
    try{
        ////console.log('Hello');
        let message='';
        let liveData=await fetch("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(result=>{return result.json()})
        if((!(liveData.success)))
        throw "Api not responding"
        liveData=liveData.data;
        let states=stateCasesCounter(liveData.rawPatientData);
        let stateNames=Object.keys(states),i=0;
        while(i<stateNames.length){
            let name=stateNames[i];
            if(name=='')
            {i+=1;continue;}
            let state=await State.getStateByName(name);
            if(!(state))
            state=await State.addNew(name)
            if(state.lastRecorded!=states[name]){
                let live= await this.getStateData(name);
                message+=Message.stateToMessage(name,live)
                state=await State.updateState(name,states[name])
            }
            i+=1;
        };
        //console.log("from 1")
        if(message.length>0)
        {
            //console.log("from here")
            message+=Message.ending(liveData.summary.total)
            try{
                ChatApi.sendToAll(message);
                return true
            }
            catch(e){
                //console.log(e)
                return false
            }
        }
    }
    catch(e){
        //console.log(e)
    }
    
}


exports.sendMessageToAll = (messageToSend)=>{

    let mainPromise = new Promise((resolve1,reject1)=>{
        User.find({},(err,users)=>{
            ////console.log("Users ",users);
            if(err) reject1(err);
            let promises = [];
            users.forEach(user=>{
                let interval;
                let number = user.number;
                ////console.log("Number ",number);
                let def = new Promise((resolve,reject)=>{
                    let to = 'whatsapp:+'+number;
                    let skip = Math.floor(Math.random()*10)
                    ////console.log(skip,to);
                    interval = setInterval(() => {
                        skip--;
                        if(skip == 0)
                        {
                        twilio.messages.create({
                            from: 'whatsapp:+14155238886',
                            body: messageToSend,
                            to: to
                            }).then(message => {
                                ////console.log("Number ",to);
                                clearInterval(interval);
                                resolve(message);
                            }).catch(err => {
                                ////console.log("Number ",to,err);
                                clearInterval(interval);
                                reject(err);
                            });
                        }
                    },500);
                });
                promises.push(def);
            });
            Promise.all(promises).then(u=>{
                    resolve1(u);
            }).catch(e=>{
                reject1(e);
            })
        });
    });
    return mainPromise;
}
exports.sendMsg = (num,message)=>{
    let def = new Promise((resolve,reject)=>{
        let to = 'whatsapp:+'+num;
        if(!(process.env.CHAT_API_INSTANCE&&process.env.CHAT_API_TOKEN))
            reject("Env error");
        let msg ={
            'body':message,
            'phone':to
        }
        request.post("https://api.chat-api.com/"+process.env.CHAT_API_INSTANCE+"/sendMessage?token="+process.env.CHAT_API_TOKEN,{json: true, body: msg}).then(r=>{
        if(r.sent){
            resolve(r);
        }else{
            reject("Not sent"+ to);
        }
        }).catch(e=>{
            reject(e);
        })
    });
    promises.push(def);
}
exports.sendMessageToAll2 = (messageToSend)=>{
    let mainPromise = new Promise((resolve1,reject1)=>{
        User.find({},(err,users)=>{
            //console.log("Users ",users);
            if(err) reject1(err);
            let promises = [];
            users.forEach(user=>{
                let number = user.number;
                //console.log("Number ",number);
                promises.push(this.sendMsg(number,messageToSend)); 
            });
            Promise.all(promises).then(u=>{
                    resolve1(u);
            }).catch(e=>{
                reject1(e);
            })
        });
    });
    return mainPromise;
}
   