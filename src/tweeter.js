'use strict';

module.exports = (handle, request) => {
    const Twitter = require("twit-promise")({
        consumer_key: handle.twitter.consumer_key,
        consumer_secret: handle.twitter.consumer_secret,
        access_token: handle.twitter.access_token,
        access_token_secret: handle.twitter.access_token_secret,
        timeout_ms: 1000 * 15
    });

    function encodeImageFromUrl(url) {
        return new Promise((resolve, reject) => {
            request({ url: url, encoding: null, resolveWithFullResponse: true })
                .then(response => {
                    if(response.statusCode == 200) resolve(new Buffer(response.body).toString("base64"));
                    else reject(new Error("Response code " + response.statusCode));
                })
                .catch(reject);
        });
    }

    function uploadMedia(imageUrl) {
        console.log("Uploading media...");
        return new Promise((resolve, reject) => {
            encodeImageFromUrl(imageUrl)
                .then(base64Image => Promise.all([ base64Image, Twitter.post("media/upload", { media_data: base64Image }) ]))
                .then(responses => Promise.all([ Twitter.post("media/metadata/create", { media_id: responses[1].data.media_id_string, alt_text: { text: "An image" } }) ].concat(responses)))
                .then(responses => { resolve(responses[2].data.media_id_string) })
                .catch(reject);
        });
    }

    return {

        tweet: (text, imageUrl, state) => {
            console.log("Tweeting...");
            return new Promise((resolve, reject) => {
                if (state.isRawImage()) {
                    console.log("Raw image");
                    uploadMedia(imageUrl)
                        .then(mediaIdString => Twitter.post("statuses/update", { status: text, media_ids: [ mediaIdString ] }))
                        .then(resolve)
                        .catch(reject);
                } else if (state.isValidSite()) {
                    console.log("Valid site");
                    Twitter.post("statuses/update", { status: text + " " + imageUrl })
                        .then(resolve)
                        .catch(reject);
                } else reject(new Error("State was not acceptable."));
            });
        }

    }

};
