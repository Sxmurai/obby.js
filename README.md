# obby.js

An unofficial JavaScript wrapper for [obsidian](https://github.com/mixtape-bot/obsidian).

Note: Obsidian is not done yet. This client as of currently is only for testing purposes. When Obsidian is released in full, this project will be maintained. This is for the pre-release version of 1.0.0

## example usage

```js
const { Obsidian } = require("obby.js");
const { Client, Intents } = require("discord.js");

const client = new Client({ ws: { intents: new Intents().add("GUILDS").add("GUILD_MESSAGES").add("GUILD_VOICE_STATES") } });

client.music = new Obsidian({
  nodes: [
    {
      name: "Node's Name",
      address: 127.0.0.1,
      port: 5555, // port it's connected to
      password: "youshallnotpass", // set in the .obsidianrc
      secure: false, // only set to true if you have the server running with https
    }
  ],
  plugins: [], // the plugins to use
  send: (guildId, payload) => {
    // this is a needed function to be able to send voice updates to obsdian
  }
});
```
