var express = require('express');
const fetch = require("node-fetch");
const Message = require('./messge');
const User = require('../Models/users');
const State = require('../Models/state');
const request=require('request-promise')
const StateMethods = require('../Models/stateMethods');
const ChatApi=require('./chatApi')
const District=require('../Models/district')
const Menu=require('../Models/menu')
const News=require('../Models/news')
const Country=require('../Models/country')
const NewsAPI = require('newsapi');
const India=require('../Models/india')
const NewsFetch = new NewsAPI(process.env.NEWS_API_KEY);
const puppeteer = require('puppeteer');
const Config=require('../Models/Config')
const path = require('path')
let  shell = require('shelljs');
exports.updateIndia=async()=>{
    try{
    let liveOfficialData=await fetch("https://api.covid19india.org/data.json").then(result=>{return result.json()})
    liveOfficialData.data={}
    liveOfficialData.data.total=liveOfficialData.statewise[0];
    let lastIndiaData=await Config.findOne({active:true});
    let last=await India.add(liveOfficialData.data.total.confirmed-lastIndiaData.con,liveOfficialData.data.total.recovered-lastIndiaData.rec,liveOfficialData.data.total.deaths-lastIndiaData.dead)
    lastIndiaData.con=liveOfficialData.data.total.confirmed;
    lastIndiaData.rec=liveOfficialData.data.total.recovered;
    lastIndiaData.dead=liveOfficialData.data.total.deaths;
    let py=await shell.exec('python3 ./helpers/predictor.py '+last.con+" "+last.dead+" "+last.rec)
    if(py.stderr)
        throw py.stderr
    py.stdout=py.stdout.split('\n').reverse()
    let predicted={
        con:parseInt(py.stdout[3].trim()),
        dead:parseInt(py.stdout[2].trim()),
        rec:parseInt(py.stdout[1].trim())
    }
    lastIndiaData.message=Message.chartCaption(predicted,last)
    lastIndiaData.predicted=predicted;
    await lastIndiaData.save()
    const urlToCapture = process.env.BASEURL+'/graph'; 
    const outputFilePath = path.join(__dirname,"../public/chart.png");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 786,
        height: 543,
        deviceScaleFactor: 1,
    });
    await page.goto(urlToCapture);
    await page.waitForSelector('#shu')
    await page.waitFor(1000);
    await page.screenshot({path: outputFilePath});
    console.log("ss taken")
    await browser.close();
    }
    catch(e){
        console.log(e)
        await ChatApi.sendToAdmins("Some error has occured : "+String(e))
    }
}
exports.sendUpdate=async()=>{
    try{
        lastIndiaData=await Config.findOne({active:true});
        await ChatApi.sendFileToAll(process.env.BASEURL+'/chart.png',JSON.stringify(new Date()),lastIndiaData.message)
    }catch(e){
        console.log(e)
    }
}
exports.sendUpdateAdmin=async()=>{
    try{
        let lastIndiaData=await Config.findOne({active:true});
        await ChatApi.sendFileToAdmin(process.env.BASEURL+'/chart.png',JSON.stringify(new Date()),lastIndiaData.message)
    }catch(e){
        console.log(e)
    }
}

function check(arr,nn) {
    let i=0;
    while(i<arr.length){
        if(arr[i].state==nn){
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
        let liveOfficialData=await fetch("https://api.covid19india.org/data.json").then(result=>{return result.json()})
        if((!(liveData.success)))
        throw "Api not responding"
        liveData=liveData.data;
        liveOfficialData.total=liveOfficialData.statewise[0];
        let l=liveOfficialData.statewise.length
        liveOfficialData.statewise=await liveOfficialData.statewise.slice(1,l);
        let totalCases=liveOfficialData.total.confirmed;
        let patients=liveData.rawPatientData;
        let stateData={
            total:0,
            lastreported:"None till now",
            rocovered:0,
            deaths:0
        };
        let chk=check(liveOfficialData.statewise,state)
        if(chk.found)
        {
            stateData.rocovered=liveOfficialData.statewise[chk.id]['recovered'];
            stateData.deaths=liveOfficialData.statewise[chk.id]['deaths'];
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
            stateData.total=liveOfficialData.statewise[chk.id]['confirmed'];
        }
        return {err:false,data:{
            total:totalCases,
            stateData:stateData
        }}
    }catch(e){
        console.log(e);
        return {err:true,msg:e}
    }
}

exports.updateDB = async() => {
    try {
        let getCountryWiseData = await fetch("https://corona-virus-world-and-india-data.p.rapidapi.com/api",{
            method: "GET",
            headers: {
                "x-rapidapi-host": "corona-virus-world-and-india-data.p.rapidapi.com",
                "x-rapidapi-key": "dfbd4c6c8emsh44fb005c1383413p149de7jsn24b4c0a1e948"
            }
        }).then(result=>{return result.json()});
        for(i=0;i<getCountryWiseData.countries_stat.length;i++) {
            await Country.saveOrUpdateCountry({
                name: getCountryWiseData.countries_stat[i].country_name,
                confirmed: getCountryWiseData.countries_stat[i].cases,
                recovered: getCountryWiseData.countries_stat[i].total_recovered,
                deaths: getCountryWiseData.countries_stat[i].deaths,
                active: getCountryWiseData.countries_stat[i].active_cases
            })
        }
    } catch (err) {
        console.log(err);
        
    }
}
exports.getStateDataFromUpdates  =async (state,liveData,liveOfficialDat)=>{
    try{
        let liveOfficialData={...liveOfficialDat}
        //let liveData=await fetch("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(result=>{return result.json()})
        //let liveOfficialData=await fetch("https://api.rootnet.in/covid19-in/unofficial/covid19india.org/statewise").then(result=>{return result.json()})
        if((!(liveData.success)))
        throw "Api not responding"
        liveOfficialData.total=liveOfficialData.statewise[0];
        let l=liveOfficialData.statewise.length
        liveOfficialData.statewise=await liveOfficialData.statewise.slice(1,l);
        let totalCases=liveOfficialData.total.confirmed;
        let patients=liveData.rawPatientData;
        let stateData={
            total:0,
            lastreported:"None till now",
            rocovered:0,
            deaths:0
        };
        let chk=check(liveOfficialData.statewise,state)
        if(chk.found)
        {
            stateData.rocovered=liveOfficialData.statewise[chk.id]['recovered'];
            stateData.deaths=liveOfficialData.statewise[chk.id]['deaths'];
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
            stateData.total=liveOfficialData.statewise[chk.id]['confirmed'];
        }
        return {err:false,data:{
            total:totalCases,
            stateData:stateData
        }}
    }catch(e){
        console.log(e);
        return {err:true,msg:e}
    }
}
exports.getUpdates=async()=>{
    try{
        //console.log('Hello');
        let message='';
        let liveData=await fetch("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(result=>{return result.json()})
        let districtWiseData=await fetch("https://api.covid19india.org/state_district_wise.json").then(result=>{return result.json()})
        let justSendliveOfficialData=await fetch("https://api.covid19india.org/data.json").then(result=>{return result.json()})
        if((!(liveData.success)))
        throw "Api not responding"
        liveData=liveData.data;
        liveData.success=true
        let states=stateCasesCounter(liveData.rawPatientData);
        let stateNames=Object.keys(states),i=0;let live;
        let lastIndiaData=await Config.findOne({active:true});
        if(!lastIndiaData) lastIndiaData=0;
        let min = Math.ceil(0);
        let max = Math.floor(23);
        let tagNum = Math.floor(Math.random() * (max - min + 1)) + min;
        while(i<stateNames.length){
            let name=stateNames[i];
            
            if((!name)||name==''||name=='undefined'||name=='null')
            {i+=1;continue;}
            let state=await State.getStateByName(name);
            if(!(state))
            state=await State.addNew(name)
            live= await this.getStateDataFromUpdates(name,liveData,justSendliveOfficialData);
            // district update starts
            let districts=null,h1=0;
            if(districtWiseData[name]){
            districts = Object.keys(districtWiseData[name].districtData);}
            if(districts)
            while(h1<districts.length){
                let district=districts[h1];
                if(district!=""&&district!=" ")
                {let conf = await District.addOrUpdate({
                    name: district,
                    stateName: name,
                    confirmedCases: districtWiseData[name].districtData[district].confirmed
                })}
                h1+=1;
            }
            /*districts.forEach(async (district) => {
                let conf = await District.addOrUpdate({
                    name: district,
                    stateName: name,
                    confirmedCases: districtWiseData[name].districtData[district].confirmed
                })
            });*/
            // district update ends
            if((state.lastRecorded!=live.data.stateData.total)){
                let ds=await District.getDistrictsByState(name)
                ds=await ds.filter(d=>{
                    let date=new Date(d.updatedAt)
                    let present=new Date()
                    let lastTenMinutes=new Date(present.getTime() - 10*60000);
                    return date>=lastTenMinutes
                })
                if(message.length<=0)
                message+=Message.starting()
                message+=(Message.stateToMessageFormList(live.data.stateData.total-state.lastRecorded,stateNames[i])+Message.stateToMessage(name,live,true)+Message.stateDistricts(ds))
                state=await State.updateState(name,live.data.stateData.total,live.data.stateData.deaths,state.lastRecordedRec)
            }
            else if((state.lastRecordedDeaths!=live.data.stateData.deaths)&&((state.lastRecordedDeaths-live.data.stateData.deaths)<0)){
                if(message.length<=0)
                message+=Message.starting()
                message+=(Message.stateToMessageDeaths(live.data.stateData.deaths-state.lastRecordedDeaths,stateNames[i])+Message.stateToMessage(name,live,true))
                state=await State.updateState(name,live.data.stateData.total,live.data.stateData.deaths,state.lastRecordedRec)
            }
            i+=1;
        };
         console.log("from 1")
        if(message.length>0)
        {
            console.log("from here")
            message+=Message.ending(live.data.total,lastIndiaData.con,tagNum)
            try{
                ChatApi.sendToAll(message);
                return true
            }
            catch(e){
                console.log(e)
                return false
            }
        }
        let news = await NewsFetch.v2.topHeadlines({
            category: 'health',
            language: 'en',
            country: 'in'
          });
        if(news.status && news.status == 'ok') {
            let clearance = await News.deleteAll();
            let count = process.env.NEWS_COUNT
            for(let i=0;i<news.totalResults && count>=0;i++) {
                try {
                    let message = "*" + news.articles[i].title + "*\n" + news.articles[i].content.replace(/\[\+.*chars\]/g,"") + "\nMore Information:\n" + news.articles[i].url
                    let store = await News.addNew({ message })
                    count--;
                } catch(err) {
                }
            }
        }
    }
    catch(e){
        console.log(e)
    }
    
}



exports.getRecoveries=async()=>{
    try{
        //console.log('Hello');
        let message='';
        let liveData=await fetch("https://api.rootnet.in/covid19-in/unofficial/covid19india.org").then(result=>{return result.json()})
        let justSendliveOfficialData=await fetch("https://api.covid19india.org/data.json").then(result=>{return result.json()})
        if((!(liveData.success)))
        throw "Api not responding"
        liveData=liveData.data;
        liveData.success=true
        let states=stateCasesCounter(liveData.rawPatientData);
        let stateNames=Object.keys(states),i=0;let live;
        let lastIndiaData=await Config.findOne({active:true});
        if(!lastIndiaData) lastIndiaData=0;
        let min = Math.ceil(0);
        let max = Math.floor(23);
        let tagNum = Math.floor(Math.random() * (max - min + 1)) + min;
        let rec=0;
        while(i<stateNames.length){
            let name=stateNames[i];
            if((!name)||name==''||name=='undefined'||name=='null')
            {i+=1;continue;}
            let state=await State.getStateByName(name);
            if(!(state))
            state=await State.addNew(name)
            live= await this.getStateDataFromUpdates(name,liveData,justSendliveOfficialData);
            if((state.lastRecordedRec!=live.data.stateData.rocovered)&&((state.lastRecordedRec-live.data.stateData.rocovered)<0)){
                if(message.length<=0)
                message+=Message.startingRec()
                message+=(Message.stateToMessageRec(live.data.stateData.rocovered-state.lastRecordedRec,stateNames[i])+Message.stateToMessage(name,live,true))
                state=await State.updateState(name,state.lastRecorded,state.lastRecordedDeaths,live.data.stateData.rocovered)
            }
            rec+=state.lastRecordedRec
            i+=1;
        };
        if(message.length>0)
        {
            console.log("from here")
            message+=Message.endingRec(rec,tagNum)
            try{
                await ChatApi.sendToAll(message);
                return true
            }
            catch(e){
                console.log(e)
                return false
            }
        }
    }
    catch(e){
        console.log(e)
    }
    
}












exports.sendMessageToAll = (messageToSend)=>{

    let mainPromise = new Promise((resolve1,reject1)=>{
        User.find({},(err,users)=>{
            //console.log("Users ",users);
            if(err) reject1(err);
            let promises = [];
            users.forEach(user=>{
                let interval;
                let number = user.number;
                //console.log("Number ",number);
                let def = new Promise((resolve,reject)=>{
                    let to = 'whatsapp:+'+number;
                    let skip = Math.floor(Math.random()*10)
                    //console.log(skip,to);
                    interval = setInterval(() => {
                        skip--;
                        if(skip == 0)
                        {
                        twilio.messages.create({
                            from: 'whatsapp:+14155238886',
                            body: messageToSend,
                            to: to
                            }).then(message => {
                                //console.log("Number ",to);
                                clearInterval(interval);
                                resolve(message);
                            }).catch(err => {
                                //console.log("Number ",to,err);
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
            console.log("Users ",users);
            if(err) reject1(err);
            let promises = [];
            users.forEach(user=>{
                let number = user.number;
                console.log("Number ",number);
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

exports.updateDistrcit= async ()=>{
    let districtApi = 'https://api.covid19india.org/state_district_wise.json';
    let liveData=await fetch(districtApi).then(result=>{return result.json()})
    if(!liveData)
        throw "Api not responding";
        let states = Object.keys(liveData)||[];
        states.forEach(async state=>{
            let districtObj = liveData[state]['districtData'];
            let districts = Object.keys(districtObj)||[];
            districts.forEach(async district=>{
                let confirmedCases = districtObj[district]['confirmed'];
                let updated = await this.addOrUpdate({
                    'name':district,
                    'stateName':state,
                    'confirmedCases':confirmedCases

                });
                if(updated){
                    return true;
                }else{
                    return false;
                }
            })
        })
   
}
exports.addOrUpdate= async (data)=>{
    let district=null;
    district = await District.findOne({'name':data.name,'stateName':data.stateName});
    if(!district){
        district=new District(data)
    }
    district.confirmedCases=data.confirmedCases;
    let newDistrict = await district.save();
    if(newDistrict){
        let menu = await Menu.findOne({'name':'districtMenu@'+data.stateName});
        if(!menu){
            menu = new Menu({'name':'districtMenu@'+data.stateName,'command':'getDistrictMenu@'+data.stateName,'options':[]});
            menu = await menu.save()
        }
        let oldDistrict = menu.options.find(x=>{
            return x.description==district.name;

        });
        if(oldDistrict){
            return newDistrict;
        }else{
            let maxSlNo = 0;
            menu.options.forEach(x => {
                if(x.slNo>maxSlNo)
                    maxSlNo=x.slNo;
            });
            menu.options.push({
                'slNo':maxSlNo+1,
                'description':newDistrict.name,
                'static':false,
                'action':'getDistrictData'
            });
            let newMenu = await menu.save();
            if(newMenu){
                return newDistrict;
            }
        }
    }
    return null;
    
}
   
