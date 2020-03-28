const State = require('./state');

exports.addNew = (name) => {
    return new Promise((resolve, reject) => {
        new State({name}).save().then(stateNew => {
            resolve ({
                status: true,
                data: stateNew
            })
        }).catch(err => {
            reject ({
                status: false,
                data: err
            })
        })
    });
}

exports.getAllStates = () => {
    return new Promise((resolve, reject) => {
        State.find({},(err, states) => {
            if(err)
            resolve ({
                    status: false,
                    data: err
                })
            resolve ({
                status: true,
                data: states
            })
        });
    });
}

exports.getStateByName = (name) => {
    return new Promise((resolve, reject) => {
        State.findOne({name},(err, stateNew) => {
            if(err)
            resolve ({
                    status: false,
                    data: err
                })
            resolve ({
                status: true,
                data: stateNew
            })
        });
    });
}

exports.updateState = (name, num) => {
    return new Promise((resolve, reject) => {
        State.findOneAndUpdate({"name": name}, { $set: { lastRecorded: num } }, {new: true} ,(err, stateNew) => {
            //console.log("here",err);
            if(err)
            resolve ({
                    status: false,
                    data: err
                })
            resolve ({
                status: true,
                data: stateNew
            })
        });
    });
}