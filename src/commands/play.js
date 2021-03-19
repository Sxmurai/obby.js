const { Util } = require("../Util");

module.exports = {
  trigger: "play",
  triggers: ["p"],

  execute: async (client, { channel, member, guildID }, args) => {
    const search = args.join(" ");
    if (!search.length) {
      channel.createMessage("Please provide something to play!");
      return;
    }

    // for now we wont use a queue, but you can easily add that
    let player = client.music.players.get(guildID);
    if (player && player.playing) {
      channel.createMessage("There is something already playing!");
      return;
    }

    player = client.music.create({ guild: guildID });

    const { tracks } = await Util.fetchTracks(search);

    if (!tracks.length) {
      channel.createMessage("Nothing was found for that.");
      client.music.destroy(guildID);
      return;
    }

    const voiceChannel = member.voiceState.channelID;
    if (!voiceChannel) {
      client.createMessage("Please join a voice channel.");
      return;
    }

    player.connect(voiceChannel, { deaf: true });

    player.on("end", () => {
      client.music.destroy(guildID);
      channel.createMessage("Song has finished.");
    });

    // play it
    player.play(tracks[0].track);

    channel.createMessage(`🎵 Playing: \`${tracks[0].info.title}\``);
  },
};
