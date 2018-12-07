class Utils {
    constructor() {

    }

    getLogByEventName(eventName, logs) {

        if (!logs) return;

        var found;

        logs.forEach(function(log){

            if (log.event === eventName) {
                found = log;
            }
        });

        return found;
    }


    logArgsToRecord(args) {
        return {
            id: args.id.toNumber(),
            eventType: "NEW",
            index: args.index.toNumber(),
            ipfsCid: args.ipfsCid,
            owner: args.owner
        }

    }


    recordEventToRecord(result) {
        var log = this.getLogByEventName("RecordEvent", result.logs);
        return this.logArgsToRecord(log.args);
    }

}

module.exports = Utils;