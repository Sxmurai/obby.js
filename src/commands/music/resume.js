module.exports = {
  trigger: "resume",
  triggers: [],

  execute: (client, { channel, guildID }) => {
    const player = client.music.players.get(guildID);
    if (!player) {
      channel.createMessage("There is nothing playing!");
      return;
    }

    if (!player.paused) {
      channel.createMessage("The song isn't paused");
      return;
    }

    player.resume();

    channel.createMessage(`▶️ Resumed the music!`);
  },
};
