module.exports = {
  trigger: "pause",
  triggers: ["tempstop"],

  execute: (client, { channel, guildID }) => {
    const player = client.music.players.get(guildID);
    if (!player) {
      channel.createMessage("There is nothing playing!");
      return;
    }

    if (player.paused) {
      channel.createMessage("The song is already paused");
      return;
    }

    player.pause();

    channel.createMessage(`⏸️ Paused the music!`);
  },
};
