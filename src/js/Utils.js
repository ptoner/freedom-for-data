class Utils {
    constructor() {

    }

    getLogByEventName(eventName, logs) {

        if (!logs) return;

        var found;

        logs.forEach(function(log){

            if (log.event == eventName) {
                found = log;
            }
        });

        return found;
    }


    getRequireMessage(ex) {
        // return ex.message.substr(43);
        // return ex.message;
        return ex.message.substr(ex.message.lastIndexOf(": revert")+8).trim();
    }

}

module.exports = Utils;