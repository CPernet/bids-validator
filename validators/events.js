/* eslint-disable no-unused-vars */
const async = require('async');
const utils = require('../utils');
const Issue = utils.issues.Issue;

const Events = function(events, stimuli, headers, jsonContents, issues) {
    // check that all stimuli files present in /stimuli are included in an _events.tsv file
    checkStimuli(stimuli, issues);

    // check the events file for suspiciously long or short durations
    checkDesignLength(events, headers, jsonContents, issues);

    return;
};

const checkStimuli = function (stimuli, issues) {
    const stimuliFromEvents = stimuli.events;
    const stimuliFromDirectory = stimuli.directory;
    if (stimuliFromDirectory) {
        const unusedStimuli = stimuliFromDirectory.filter(function(stimuli) {
            return stimuliFromEvents.indexOf(stimuli.relativePath) < 0;
        });
        for (let key in unusedStimuli) {
            const stimulus = unusedStimuli[key];
            issues.push(new Issue({
                code: 77,
                file: stimulus,
            }));
        }
    }
    return;
};

const checkDesignLength = function(events, headers, jsonContents, issues) {
    // get all headers associated with task data
    var taskHeaders = headers.filter(header => {
        const file = header[0];
        return file.path.includes('_task-');
    });

    // loop through headers with files that are tasks
    async.eachOfLimit(taskHeaders, 200, (taskHeader) => {

        // extract the fourth element of 'dim' field of header - this is the
        // number of volumes that were obtained during scan (numVols)
        const file = taskHeader[0];
        const header = taskHeader[1];
        const dim = header.dim;
        const numVols = dim[4];

        // get the json sidecar dictionary associated with that nifti scan
        const potentialSidecars = utils.files.potentialLocations(file.path.replace(".gz", "").replace(".nii", ".json"));
        const mergedDictionary  = utils.files.generateMergedSidecarDict(potentialSidecars, jsonContents);

        // extract the 'RepetitionTime' field from said sidecar (TR)
        const TR = mergedDictionary.RepetitionTime;

        // calculate max reasonable scan time (TR * numVols = longDurationThreshold)
        const longDurationThreshold = Math.floor(TR * numVols);

        // calculate min reasonable scan time (.5 * TR * numVols = shortDurationThreshold)
        const shortDurationThreshold = Math.floor(.5 * longDurationThreshold);

        // get the _events.tsv associated with this task scan
        const potentialEvents = utils.files.potentialLocations(file.relativePath.replace(".gz", "").replace("bold.nii", "events.tsv"));
        const associatedEvents = events.filter(event => potentialEvents.indexOf(event.path) > -1);

        // loop through all events associated with this task scan
        for (let event of associatedEvents) {
            // get all non-empty rows
            const rows = event.contents.split('\n').filter(row => !(!row || /^\s*$/.test(row)));

            // get the 'onset' field of the last event (lastEventOnset)
            const lastEventOnset = rows[rows.length -1].split('\t')[0];

            // check if lastEventOnset > longDurationThreshold - append issue if so
            if (lastEventOnset > longDurationThreshold) {
                issues.push(new Issue({
                    file: event.file,
                    code: 85
                }));
            }

            // check if the lastEventOnset < shortDurationThreshold - append issue if so
            if (lastEventOnset < shortDurationThreshold) {
                issues.push(new Issue({
                    file: event.file,
                    code: 86
                }));
            }

   
        }
    }, () => {return;});
};

module.exports = {
    Events: Events,
};