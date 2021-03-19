# obby.js

An unofficial JavaScript wrapper for [obsidian](https://github.com/mixtape-bot/obsidian).

Note: Obsidian is not done yet. This client as of currently is only for testing purposes. When Obsidian is released in full, this project will be maintained. This is for the pre-release version of 1.0.0

oh and btw i take ownership of first working client for obsidian kthx

---

## example usage

```js
const { Obsidian } = require("obby.js");
const { Client, Intents } = require("discord.js");

const client = new Client({
  ws: {
    intents: new Intents()
      .add("GUILDS")
      .add("GUILD_MESSAGES")
      .add("GUILD_VOICE_STATES"),
  },
});

client.music = new Obsidian({
  nodes: [
    {
      name: "Node's Name", // optional, used to identify what node youre using
      address: "localhost", // also optional, defaults to "localhost"
      port: 3030, // also optional, defaults to 3030 as the default is
      password: "youshallnotpass", // only option needed. set in the .obsidianrc
      secure: false, // defaults to false. only set to true if you have the server running with https
    },
  ],
  plugins: [], // the plugins to use soon:tm:
  send: (guildId, payload) => {
    const guild = client.guilds.get(guildId);
    if (guild) {
      guild.shard.sendWs(payload.op, payload.d, false);
      // for djs use
      // guild.shard.send(payload)
    }
  },
});

// playing
client.music.play("base64 encoded track");

// pausing/resuming
client.music.pause();
client.music.resume();

// seeking
client.music.seek(5000); // replace 5000 with the time in milliseconds
```
