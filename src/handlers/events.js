const { Util } = require("../Util");
const { join } = require("path");

module.exports = (client, emitters) => {
  for (const file of Util.walk(join(__dirname, "..", "events"))) {
    const event = require(file);

    emitters[event.emitter ?? "client"].on(
      event.name,
      event.execute.bind(null, client)
    );
  }
};
