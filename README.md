# obby.js

An unofficial JavaScript wrapper for [obsidian](https://github.com/mixtape-bot/obsidian).

---

## example code

```js
import { Obsidian } from "obby.js";

const obsidian = new Obsidian({
  nodes: [
    /* Nodes to add */
  ],
  send: (id, payload) => {
    // this function is for eris
    const guild = <client>.guilds.get(id); // <client> refers to your client object
    if (guild) {
      // send the op code  + the payload data. not a priority packet so we set that to false.
      guild.shard.sendWs(payload.op, payload.d, false);
    }
  },
  id: "some user id", // your bots user id. this is optional, as you can put the user ID in the `init` function. Shown below.
});

obsidian.init(<client>.user.id); // <client> refers to your client object.
```

---

## getting started

You'll first want to go to the [obsidian](https://github.com/mixtape-bot/obsidian) and go to the releases tab. There just download the latest JAR. You will need [Java 13+](https://www.azul.com/downloads/zulu-community/?version=java-13-mts&package=jdk).

Go into your bots project and setup an NPM project (npm or yarn works good, i prefer yarn). Install obby.js with either `yarn add obby.js` or `npm install obby.js`, whichever one applies to you.

After that, make a new folder in that bot directory. Let's say we name it `obsidian`. Put the JAR you downloaded from the releases tab and put it into the obsidian folder. You'll then want to grab yourself a copy of the [.obsidianrc](https://github.com/mixtape-bot/obsidian/blob/main/.obsidianrc). Make a new file named `.obsidianrc` in your obsidian directory and copy-paste that example config into that file. Change the password. Changing the port is optional.

Open up a terminal in that directory and type `java -jar Obsidian.jar`. If you get any runtime error such as something along the lines of "compiled for a more recent version of the Java Runtime" you will need to install Java 13+.

Then, you can look at our [example bot](https://github.com/Sxmurai/obby.js/tree/example-bot) for examples on how to use the client.

P.S: If you want to use filters, it does not work on windows. Run it on linux if you want to be able to use the Player#filters function.

---

Need help? Join [a server that doesnt exist yet lol]() for support. I will **not** help you if you cannot read/do not know the basics of JavaScript.

Thank you!

---

<h5 align="center">aesthetical - 2021</h5>
