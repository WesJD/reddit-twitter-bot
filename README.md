#reddit-bot

This is a subreddit twitter bot written in [Node](https://nodejs.org).

##How to use
1. Clone the repository.
2. Run `npm install` in that directory.
3. Setup a config file in `./handles`. You can check out [example.json](/handles/example.json) if you need to know how to make a config file.
4. Run the bot with `pm2 start bot.js --name amazingbotname -- <your handle name>` where `<your handle name>` is the name of the file (without `.json`) in `./handles`.

##Contributing
Honestly, submitting a PR to this project should be done under rare circumstances. If you legitimately have found something wrong, submit a PR, otherwise hit me up on Twitter or email me.

##License
Licensed under the [MIT License](LICENSE.md).
