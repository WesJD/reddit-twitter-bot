'use strict';

module.exports = (handle) => {
    const Promise = require("bluebird");
    const request = Promise.promisify(require("request"));
    const Twit = Promise.promisifyAll(require("twit"));
    const Twitter = new Twit({
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
        return new Promise((resolve, reject) => {
            encodeImageFromUrl(imageUrl)
                .then(base64Image => Promise.all([base64Image, Twitter.post("media/upload", { media_data: base64Image })]))
                .then(responses => Promise.all([Twitter.post("media/metadata/create", { media_id: responses[1].data.media_id_string, alt_text: { text: "An image" } })].concat(responses)))
                .then(responses => { resolve(responses[2].data.media_id_string) })
                .catch(reject);
        });
    }

    function tweetResponse(id, userName, postLink) {
        return new Promise((resolve, reject) => {
            Twitter.post("statuses/update", { in_reply_to_status_id: id, status: "@" + userName + " Direct link: " + postLink })
                .then(resolve)
                .catch(reject);
        });
    }

    return {

        tweet: (postData, state) => {
            const imageUrl = postData.url;
            const text = postData.title + " " + imageUrl;
            return new Promise((resolve, reject) => {
                const link = "https://reddit.com" + postData.permalink;
                if(state.isRawImage()) {
                    uploadMedia(imageUrl)
                        .then(mediaIdString => Twitter.post("statuses/update", { status: text, media_ids: [mediaIdString] }))
                        .then(response => Promise.all([response, tweetResponse(response.data.id_str, response.data.user.screen_name, link)]))
                        .then(resolve)
                        .catch(reject);
                } else if(state.isValidSite()) {
                    Twitter.post("statuses/update", { status: text })
                        .then(response => Promise.all([response, tweetResponse(response.data.id_str, response.data.user.screen_name, link)]))
                        .then(resolve)
                        .catch(reject);
                } else reject(new Error("State was not acceptable."));
            });
        }

    }

};