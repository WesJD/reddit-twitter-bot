'use strict';

const args = process.argv.slice(2);
const handle = require("../handles/" + args[0] + ".json");
const requestOptions = {
    url: "https://www.reddit.com/r/" + handle.reddit.subreddit + "/new.json?sort=new",
    json: true,
    resolveWithFullResponse: true
};

const fs = require("fs");
const request = require("request-promise");
const Stater = require("./stater")(["imgur.com"]);
const Tweeter = require("./tweeter")(handle, request);

let lastId = handle.reddit.lastId;

function check() {
    console.log("Checking...");
    request(requestOptions)
        .then(response => {
          if(response.statusCode == 200) {
              const latest = response.body.data.children;
              for(const post of latest) {
                  const postData = post.data;
                  const state = Stater.getImageState(postData.url);
                  if(state.isAcceptable()) {
                      if (lastId != postData.id) {
                          Tweeter.tweet(postData.title, postData.url, state);
                          return postData;
                      }
                      break;
                  }
              }
          } else return Promise.reject(new Error("Response code " + response.statusCode));
        })
        .then(postData => {
            if(postData != null) {
                lastId = postData.id;
                handle.reddit.lastId = lastId;
                fs.writeFile("./handles/" + args[0] + ".json", JSON.stringify(handle, undefined, 2), "utf8");
            }
            console.log("Done.");
        })
        .catch(err => { console.error("Unable to process: ", err) });
}

console.log("Starting...");
setInterval(check, 1000 * 60 * 3);
