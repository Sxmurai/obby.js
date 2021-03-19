const { Util } = require("../Util");
const { join } = require("path");
const { prefix } = require("../../config.json");

module.exports = (client) => {
  for (const file of Util.walk(join(__dirname, "..", "commands"))) {
    const command = require(file);

    client.commands.set(command.trigger, command);
  }

  console.log(`Loaded ${client.commands.size} commands`);

  client.on("messageCreate", (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
      return;
    }

    const [cmd, ...args] = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g);

    const command = [...client.commands.values()].find((c) =>
      [c.trigger, ...(c.triggers ?? [])].includes(cmd.toLowerCase())
    );

    if (command) {
      command.execute(client, message, args);
    }
  });
};
