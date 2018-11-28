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

}

module.exports = Utils;