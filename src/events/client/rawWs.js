module.exports = {
  name: "rawWS",
  emitter: "client",

  execute: (client, packet) => {
    if (
      packet.op === 0 &&
      ["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(packet.t)
    ) {
      const player = client.music.players.get(packet.d.guild_id);

      if (player) {
        player.handleVoice(packet.d);
      }
    }
  },
};
