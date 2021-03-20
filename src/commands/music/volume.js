const { OpCodes } = require("obby.js");

module.exports = {
  trigger: "volume",
  triggers: ["vol", "v"],

  execute: (client, { channel, guildID }, [amount]) => {
    const player = client.music.players.get(guildID);
    if (!player) {
      channel.createMessage("There is nothing playing!");
      return;
    }

    if (isNaN(amount) || parseInt(amount) > 100 || parseInt(amount) < 1) {
      channel.createMessage("Please provide an amount above 1 and below 100.");
      return;
    }

    player.send(OpCodes.FILTERS, {
      volume: parseInt(Math.round(amount)) / 100,
    });

    channel.createMessage(
      `${getVolumeEmoji(
        parseInt(Math.round(amount))
      )} Set volume to **${Math.round(amount)}**`
    );
  },
};

const getVolumeEmoji = (volume) => {
  if (volume === 0) {
    return "🔈";
  } else if (volume < 33) {
    return "🔉";
  } else if (volume < 66) {
    return "🔊";
  }
};
