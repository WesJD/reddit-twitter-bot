'use strict';

const ARGS = process.argv.slice(2);
const HANDLE = require("../handles/" + ARGS[0] + ".json");
const REQUEST_OPTIONS = {
    url: "https://www.reddit.com/r/" + HANDLE.reddit.subreddit + "/new.json?sort=new",
    json: true,
    resolveWithFullResponse: true
};

const Promise = require("bluebird");
Promise.config({ cancellation: true });
const request = Promise.promisify(require("request"));
const writeFile = Promise.promisify(require("fs").writeFile);

const Stater = require("./stater")(["imgur.com"]);
const Tweeter = require("./tweeter")(HANDLE);

let lastId = HANDLE.reddit.lastId;

function check() {
    console.log("Checking...");
    const p = request(REQUEST_OPTIONS)
        .then(response => {
            if(response.statusCode == 200) {
                const latest = response.body.data.children;
                for(const post of latest) {
                    const postData = post.data;
                    const state = Stater.getImageState(postData.url);
                    if(state.isAcceptable()) {
                        if(lastId != postData.id) return Promise.all([postData, Tweeter.tweet(postData, state)])
                        else {
                            p.cancel();
                            break;
                        }
                    }
                }
            } else return Promise.reject(new Error("Response code " + response.statusCode));
        })
        .then(responses => {
            lastId = responses[0].id;
            console.log(lastId);
            HANDLE.reddit.lastId = lastId;
            writeFile("./handles/" + ARGS[0] + ".json", JSON.stringify(HANDLE, undefined, 2), "utf8");
            console.log("Tweeted.");
        })
        .catch(err => { console.error("Unable to process: ", err) });
}

console.log("Starting...");
setInterval(check, 1000 * 20);