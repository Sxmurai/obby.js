const { inspect } = require("util");

module.exports = {
  trigger: "eval",
  triggers: ["ev", "evaluate"],
  ownerOnly: true,

  execute: async (client, message, args) => {
    const code = args
      .join(" ")
      .replace(/```\n?/g, "")
      .replace(/```/g, "");

    if (!code.length) {
      message.channel.createMessage("Please provide something to evaluate!");
      return;
    }

    try {
      let now = Date.now();
      const data = await eval(code);
      now -= Date.now();

      const cleaned = inspect(data, false, 0).truncate(1950);

      message.channel.createMessage(
        `*evaluated in ${now}ms*\n${codeBlock(cleaned)}`
      );
    } catch (error) {
      message.channel.createMessage(
        `An exception as occured:\n${codeBlock(error.message)}`
      );
    }
  },
};

const codeBlock = (data) => `\`\`\`js\n${data.truncate(1950)}\`\`\``;

String.prototype.truncate = function (amount = 45) {
  return this.length > amount
    ? this.substring(0, amount - 3) + "..."
    : this.toString();
};
