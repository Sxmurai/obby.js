const { Client } = require("eris");
const { Obsidian } = require("obby.js");
const { token, nodes } = require("../config.json");

const client = new Client(token);

client.music = new Obsidian({
  nodes,
  send: (id, payload) => {
    const guild = client.guilds.get(id);
    if (guild) {
      guild.shard.sendWS(payload.op, payload.d);
    }
  },
  id: "755613660822372393",
});

client.commands = new Map();

["events", "commands"].forEach((thing) =>
  require(`./handlers/${thing}`)(client, { client, music: client.music })
);

client.music.init();
client.connect();
