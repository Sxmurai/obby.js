/**
 * THIS COMMAND WILL ONLY WORK IF YOU ARE HOSTING THE OBSIDIAN JAR FILE ON A LINUX MACHINE!!!
 */

module.exports = {
  trigger: "nightcore",
  triggers: ["nc"],

  execute: (client, { channel, guildID }) => {
    const player = client.music.players.get(guildID);
    if (!player) {
      channel.createMessage("There is nothing playing!");
      return;
    }

    const isOn = !player.nightcore
      ? (player.nightcore = false)
      : player.nightcore;

    if (isOn) {
      player.nightcore = false;

      player.filters({
        equalizer: {
          bands: [
            { band: 1, gain: 0 },
            { band: 0, gain: 0 },
          ],
        },
        timescale: { pitch: 1, speed: 1 },
        tremolo: { depth: 0.5, frequency: 2 },
      });

      channel.createMessage(
        "No more nightcore! This will take a second to apply."
      );
    } else {
      player.nightcore = true;

      player.filters({
        equalizer: {
          bands: [
            { band: 1, gain: 0.1 },
            { band: 0, gain: 0.1 },
          ],
        },
        timescale: { pitch: 1.2, speed: 1.1 },
        tremolo: { depth: 0.3, frequency: 14 },
      });

      channel.createMessage(
        "Applied the filters! This will take a second to apply."
      );
    }
  },
};
