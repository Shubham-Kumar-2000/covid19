let changeTimezone = (date, ianatz) => {
    var invdate = new Date(date.toLocaleString('en-US', {
      timeZone: ianatz
    }));
    return new Date(date.getTime() + date.getTime() - invdate.getTime());
}
  
const d = changeTimezone(new Date(), "Asia/Kolkata");
const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', meridian: 'full' }) 
const [{ value: mo },,{ value: da },,{ value: ye },,{ value: hh },,{ value: mm },,{ value: ss },,{ value: ap }] = dtf.formatToParts(d) 
  

exports.stateToMessage=(name,data,isNew=false,diff=0)=>{
    data=data.data
    return "In *"+name+"* there has been *"
    +data.stateData.total+"* confirmed cases.\nRecovered: "
    +data.stateData.rocovered+"\nDeaths: "
    +data.stateData.deaths+"\n\n\nThe last case reported was on "
    +data.stateData.lastreported.reportedOn+" in the *"
    +data.stateData.lastreported.district+"* district and is currently "
    +data.stateData.lastreported.status+".\nGender: "
    +data.stateData.lastreported.gender+"\n\n\n"
}
exports.ending=(num)=>{
    return "Till now there has been *"+num+"* confirmed cases in India. Please stay in your homes isolated and use sanitizers and disinfectant sprays frequently. Wear a mask. Stay safe and positive."
}