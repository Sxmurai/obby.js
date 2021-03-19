import { Socket, SocketOptions } from "./Socket";
import { EventEmitter } from "events";
import { Player } from "./Player";
import { Structure } from "./Structure";

const socket = Structure.get<Socket>("Socket");
const player = Structure.get<Player>("Player");

export class Obsidian extends EventEmitter {
  public options: ObsidianOptions;

  public players: Map<string, typeof player> = new Map();
  public sockets: Map<string, typeof socket> = new Map();

  public constructor(options: ObsidianOptions) {
    super();

    // remove duplicates
    options.nodes = [...new Set(options.nodes)];

    this.options = options;
  }

  public init() {
    // check if any nodes were even provided
    if (!this.options.nodes.length) {
      throw new Error("You did not provide any nodes");
    }

    // go through each node and create a new socket class
    for (const node of this.options.nodes) {
      node.name = node.name ?? `Node ${this.sockets.size + 1}`;

      if (this.sockets.has(node.name!)) {
        continue; // no need to do anything else
      }

      // add the node
      this.sockets.set(node.name!, new Socket(this, node));
    }
  }

  /**
   * Creates a new player, or returns an existing one if it exists.
   * @param {PlayerCreateOptions} options
   * @returns {Player}
   */
  public create(options: PlayerCreateOptions) {
    if (!this.sockets.size) {
      throw new Error(
        "No nodes have been created. Have you called the init method yet?"
      );
    }

    if (this.players.has(options.guild)) {
      return this.players.get(options.guild);
    }

    // TODO: make better socket selection if none provided
    options.socket = options.socket ?? [...this.sockets.values()][0];

    const player = new Player(this, options);
    this.players.set(options.guild, player);

    return player;
  }

  public destroy(guild: string) {
    this.players.get(guild)?.disconnect();
    this.players.delete(guild);
  }
}

export interface ObsidianOptions {
  nodes: SocketOptions[];
  id: string;
  send: (id: string, payload: any) => any;
}

export interface PlayerCreateOptions {
  guild: string;
  socket?: Socket;
}
