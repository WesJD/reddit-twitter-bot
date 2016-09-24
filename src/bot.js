'use strict';

const args = process.argv.slice(2);
const handle = require("../handles/" + args[0] + ".json");
const requestOptions = {
    url: "https://www.reddit.com/r/" + handle.reddit.subreddit + "/new.json?sort=new",
    json: true
};

const fs = require("fs");
const request = require("request-promise");
const Stater = require("./stater")(["imgur.com"]);
const Tweeter = require("./tweeter")(handle, request);

let lastId = handle.reddit.lastId;

function check() {
    console.log("Checking...");
    request(requestOptions)
        .then(function(response) {
            if(response.responseCode == 200) {
                const latest = response.data.children;
                for(const post of latest) {
                    const postData = post.data;
                    const state = Stater.getImageState(postData.url);
                    if(state.isAcceptable()) {
                        if (lastId != postData.id) return Promise.all([ postData, Tweeter.tweet(postData.title, postData.url, state) ]);
                        break;
                    }
                }
            } else return Promise.reject(new Error("Response code " + response.responseCode));
        })
        .then(function(responses) {
            if(responses != null) {
                lastId = responses[0].id;
                handle.reddit.lastId = lastId;
                fs.writeFile("./handles/" + args[0] + ".json", JSON.stringify(handle, undefined, 2), "utf8");
            }
            console.log("Done.");
        })
        .catch(function(err) {
            console.error("Unable to process: ", err);
        });
}

console.log("Starting...");
setInterval(check, 1000 * 60 * 3);
