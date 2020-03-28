const mongoose=require("mongoose");

const configSchema =new mongoose.Schema({
    corn: { type: String, default: "0 * * * * *" },
    instance: { type: String, default: "instance110058" },
    corn: { type: String, default: "tsluf1h92ku9xgen" },
    active: { type: Boolean, default: true }
});

configSchema.statics.updateConfigCorn = (corn,instance,token) => {

    const update = {};
    
    if(corn){
        update.corn = corn;        
    }
    return Config.findOneAndUpdate({}, {
        $set: update
    }, {new: true});
};



const Config = module.exports = mongoose.model("config", configSchema);
