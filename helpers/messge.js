let advices = [
    "This will pass too. Enjoy your time at home and spend quality time with your family! Things will be normal soon.",
    "Plan and calculate your essential needs for the next three weeks",
    "Our brothers from the North-East are just as Indian as you! Help everyone during this crisis ❤️",
    "Avoid going out during the lockdown. Help break the chain of spread.",
    "Get in touch with your local NGO's and district administration to volunteer for this cause.",
    "Help out the elderly by bringing them their groceries and other essentials.",
    "Be compassionate! Help those in need like the elderly and poor. They are facing a crisis which we can't even imagine!",
    "Call up your loved ones during the lockdown, support each other through these times.",
    "Be considerate. While buying essentials remember that you need to share with 130 crore fellow citizens!",
    "The virus does not discriminate. Why do you? DO NOT DISCRIMINATE. We are all Indians!",
    "Lockdown means LOCKDOWN! Avoid going out unless absolutely necessary. Stay safe!",
    "Panic mode : OFF! ❌ ESSENTIALS ARE ON! ✔️",
    "Going out to buy essentials? Social Distancing is KEY! Maintain at least 2 metres distance between each other in the line.",
    "If you have symptoms and suspect you have coronavirus - reach out to your doctor or call state helplines. 📞 Get help.",
    "Help the medical fraternity by staying at home!",
    "Stand against FAKE news and illegit WhatsApp forwards! Do NOT ❌ forward a message until you verify the content it contains.",
    "There is no evidence that hot weather will stop the virus! You can! Stay home, stay safe.",
    "Your essential needs will be taken care of by the government in a timely manner. Please do not hoard.",
    "Plan ahead! Take a minute and check how much supplies you have at home. Planning lets you buy exactly what you need.",
    "Don't hoard groceries and essentials. Please ensure that people who are in need don't face a shortage because of you!",
    "Wash your hands with soap and water often, especially after a grociery run. Keep the virus at bay.",
    "Help out your employees and domestic workers by not cutting their salaries. Show the true Indian spirit!",
    "If you have any medical queries, reach out to your state helpline, district administration or trusted doctors!",
    "Help out your employees and domestic workers by not cutting their salaries. Show the true Indian spirit!"
]

/**
 * 
 */

exports.stateToMessage=(name,data,isNew=false)=>{
    data=data.data.stateData
    let start = '';
    if(!isNew)
        start = "Current State Data for *"+name+"*:\n\n"
    start += "Confirmed: "+data.total+"\nRecovered: "+data.rocovered+"\nDeaths: "+data.deaths+"\n\n";
    
    let recentTag = "\n\nThe last case reported was on "+data.lastreported.reportedOn
    +" in *" +data.lastreported.district
    +"* and is currently "+data.lastreported.status
    +".\nGender: "+data.lastreported.gender+"\n\n";

    return isNew ? start : start;
}
exports.ending=(num,num2,t)=>{
    return `Till now there has been *${num}* confirmed cases in India and *${num-num2}* cases reported today.\n\n*_${advices[t]}_*`
}

exports.endingRec=(num,t)=>{
    return `Woohoo!!! *${num}* pepole has already recoverd in India.\n\n*_${advices[t]}_*`
}


exports.stateToMessageFormList=(diff,name)=>{
    if(diff>0)
    return `New *${diff} Positive* Case(s) detected in ${name}. Current Statistics:\n\n`
    else
    return `New *${0-diff} Negative* Case(s) detected in ${name}. Current Statistics:\n\n`
}
exports.stateToMessageDeaths=(diff,name)=>{
    return `New *${diff} Death(s)* detected in ${name}. Current Statistics:\n\n`
}
exports.starting=()=>{
    var indiaTime = new Date();
    let d = new Date();
    let dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', meridian: 'full' }) 
    let [{ value: mo },,{ value: da },,{ value: ye },,{ value: hh },,{ value: mm },,{ value: ss },,{ value: ap }] = dtf.formatToParts(d) 
    return "🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑\n*New Update* : "+da+'-'+mo+'-'+ye+", "+hh+':'+mm+" "+ap+"\n\n\n";
}

exports.DistrictToMessage=(districtData)=>{
    let m= `There are *${districtData.confirmedCases} confirmed* cases in *${districtData.name}* district under *${districtData.stateName}* state.`;
    if(districtData.zone&&districtData.zone!=""&&districtData.zone!=" "){
        if(districtData.zone=="green"){
            m+="\n\n*Zone* : 🟢🟢🟢"
        }
        else if(districtData.zone=="red"){
            m+="\n\n*Zone* : 🔴🔴🔴"
        }
        else if(districtData.zone=="orange"){
            m+="\n\n*Zone* : 🟠🟠🟠"
        }
    }
    return m
}
exports.searchState=(state)=>{
    return "\nIn *"+state.name+"* there are *"+state.lastRecorded+"* confirmed COVID-19 case(s) from which *"+state.lastRecordedDeaths+"* people died.\n\n";
}
exports.countryToMessage=(data)=>{
    return "In *"+data.name+"* there has been *"
    +data.confirmed+"* confirmed cases.\nRecovered: "
    +data.recovered+"\nDeaths: "
    +data.deaths+"\nActive cases: "
    +data.active
}
exports.stateDistricts=(districts)=>{
    if((!(districts instanceof Array))||districts.length==0)
    return "";
    let msg="The last reported case(s) were in ";
    if(districts.length==1)
    msg+=("*"+districts[0].name+"*\n\n")
    else
    districts.forEach((d,i)=>{
        if(i==(districts.length-1))
        msg+=("*"+d.name+"*\n\n")
        else if(i==(districts.length-2))
        msg+=("*"+d.name+"* and ")
        else
        msg+=("*"+d.name+"*, ")
    })
    return msg;
}
exports.chartCaption=(prediction,real)=>{
    return this.yesterdayToMessage(real)+"\n\n"+this.predictionToMessage(prediction);
}
exports.yesterdayToMessage=(real)=>{
    return "Yesterday there were "+real.con+" confirmed cases in India while "+real.rec+" people recoverd and "+real.dead+" died due to COVID-19."
}
exports.predictionToMessage=(prediction)=>{
    return "Based on our analysis, Pedictions for today :\nConfirmed Case(s): "+(prediction.con>0?prediction.con:"*None*")+"\nRecoveries : "+(prediction.rec>0?prediction.rec:"*None*")+"\nDeath(s): "+(prediction.dead>0?prediction.dead:"*None*");
}

exports.stateToMessageRec=(diff,name)=>{
    return `New *${diff} patient(s) Recovered* in ${name}. Current Statistics:\n\n`
}
exports.startingRec=()=>{
    var indiaTime = new Date();
    let d = new Date();
    let dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', meridian: 'full' }) 
    let [{ value: mo },,{ value: da },,{ value: ye },,{ value: hh },,{ value: mm },,{ value: ss },,{ value: ap }] = dtf.formatToParts(d) 
    return "🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩\n*New Update* : "+da+'-'+mo+'-'+ye+", "+hh+':'+mm+" "+ap+"\n\n\n";
}
exports.distanceToMessage=(dist,state,area,district)=>{
    let m= "You are "+((dist/2000).toFixed(2))+" KM away from a infected area ";
    if(district&&district.zone&&district.zone!=""&&district.zone!=" "){
        if(district.zone=="green"){
            area="🟢"+area+"🟢"
        }
        else if(district.zone=="red"){
            area="🔴"+area+"🔴"
        }
        else if(district.zone=="orange"){
            area="🟠"+area+"🟠"
        }
    }
    m+=area+" in the state of "+state+"\n\nStay at Home,\nStay Safe";
}