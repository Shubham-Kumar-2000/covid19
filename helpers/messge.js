exports.stateToMessage=(name,data,isNew=false,diff=0)=>{
    data=data.data
    return "In *"+name+"* there has been *"
    +data.stateData.total+"* confirmed cases.\nRecovered: "
    +data.stateData.rocovered+"\nDeaths: "
    +data.stateData.deaths+"\n\n\nThe last case reported was on "
    +data.stateData.lastreported.reportedOn+" in *"
    +data.stateData.lastreported.district+"* and is currently "
    +data.stateData.lastreported.status+".\nGender: "
    +data.stateData.lastreported.gender+"\n\n\n"
}
exports.ending=(num,num2)=>{
    return `Till now there has been *${num}* confirmed cases in India and *${num2}* cases reported today. Please stay in your homes isolated and use sanitizers and disinfectant sprays frequently. Wear a mask. Stay safe and positive.`
}
exports.stateToMessageFormList=(diff)=>{
    if(diff>0)
    return "New *"+diff+" Positive* Case(s) detected\n\n"
    else
    return "New *"+(0-diff)+" Negative* Case(s) detected\n\n"
}
exports.stateToMessageDeaths=(diff)=>{
    return "New *"+diff+" Death(s)* detected\n\n"
}
exports.starting=()=>{
    var indiaTime = new Date();
    let d = new Date();
    let dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', meridian: 'full' }) 
    let [{ value: mo },,{ value: da },,{ value: ye },,{ value: hh },,{ value: mm },,{ value: ss },,{ value: ap }] = dtf.formatToParts(d) 
    return "*New Update* :"+hh+':'+mm+" "+ap+" | "+da+'-'+mo+'-'+ye+'\n\n\n';
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