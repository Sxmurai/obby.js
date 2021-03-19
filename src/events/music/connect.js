module.exports = {
  name: "connected",
  emitter: "music",

  execute: (client, { name }) => {
    console.log(`Node (${name}) is connected!`);
  },
};
