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
    let start;
    if(!isNew)
        start = "Current State Data for *"+name+"*:\n\n"
    start += "Confirmed: "+data.total+"\nRecovered: "+data.rocovered+"\nDeaths: "+data.deaths
    
    let recentTag = "\n\nThe last case reported was on "+data.lastreported.reportedOn
    +" in *" +data.lastreported.district
    +"* and is currently "+data.lastreported.status
    +".\nGender: "+data.lastreported.gender+"\n\n";

    return isNew ? start+recentTag : start;
}
exports.ending=(num,num2,t)=>{
    return `Till now there has been *${num}* confirmed cases in India and *${num-num2}* cases reported today.\n\n*_${advices[t]}_*`
}
exports.stateToMessageFormList=(name,diff)=>{
    if(diff>0)
    return `New *${diff} Positive* Case(s) detected in ${name}. Current Statistics:\n\n`
    else
    return `New *${0-diff} Negative* Case(s) detected in ${name}. Current Statistics:\n\n`
}
exports.stateToMessageDeaths=(diff)=>{
    return "New *"+diff+" Death(s)* detected\n\n"
}
exports.starting=()=>{
    var indiaTime = new Date();
    let d = new Date();
    let dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', meridian: 'full' }) 
    let [{ value: mo },,{ value: da },,{ value: ye },,{ value: hh },,{ value: mm },,{ value: ss },,{ value: ap }] = dtf.formatToParts(d) 
    return "*New Update* : "+da+'-'+mo+'-'+ye+", "+hh+':'+mm+" "+ap+"\n\n\n";
}

exports.DistrictToMessage=(districtData)=>{
    return `There are *${districtData.confirmedCases} confirmed* cases in *${districtData.name}* district under *${districtData.stateName}* state.`;
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