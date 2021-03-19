module.exports = {
  name: "ready",
  emitter: "client",

  execute: (client) => {
    console.log(`${client.user.username} is ready`);
  },
};
