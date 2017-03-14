# reddit-twitter-bot

This is a subreddit twitter bot written in [Node](https://nodejs.org). It currently mirrors _posts with images_ to a Twitter feed.

## How to use
1. Clone the repository.
2. Run `npm install` in that directory.
3. Setup a config file in `./handles`. You can check out [example.json](/handles/example.json) if you need to know how to make a config file.
4. Run the bot with `pm2 start src/bot.js --name amazingbotname -- <your handle name>` where `<your handle name>` is the name of the file (without `.json`) in `./handles`.

## Examples
Check out [@runixporn on Twitter](https://twitter.com/runixporn).

## License
Licensed under the [Mozilla Public License 2.0](LICENSE.md).
