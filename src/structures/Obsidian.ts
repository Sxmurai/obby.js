import { Socket, SocketOptions } from "./Socket";
import { EventEmitter } from "events";
import { Player } from "./Player";

import http from "http";
import https from "https";

export class Obsidian extends EventEmitter {
  public options: ObsidianOptions;

  public players: Map<string, Player> = new Map();
  public sockets: Map<string, Socket> = new Map();

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

  /**
   * Search for something and return tracks
   * @param {string} search
   * @param {?Socket} socket
   * @returns {Promise<ObsidianTrackResponse>}
   */
  public async search(
    search: string,
    socket?: Socket
  ): Promise<ObsidianTrackResponse> {
    // TODO: make better socket selection if none provided
    socket = socket ?? [...this.sockets.values()][0];

    return new Promise((res, rej) => {
      const { options } = socket!;
      const { request } = options.secure ? https : http;

      request(
        `http${options.secure ? "s" : ""}://${options.address}:${
          options.port
        }/loadtracks?identifier=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: options.password,
          },
        },
        (response) => {
          const data = Buffer.alloc(0);

          response
            .on("data", (c) => Buffer.concat([data, c]))
            .on("error", (error) => rej(error))
            .on("end", () => res(JSON.parse(data.toString())));
        }
      )
        .on("error", (error) => rej(error))
        .end();
    });
  }

  /**
   * Returns a JSON response from a base64 string
   * @param {string} track
   * @param {?Socket} socket
   * @returns {Promise<ObsidianTrackResponseTracks>}
   */
  public async decode(
    track: string,
    socket?: Socket
  ): Promise<ObsidianTrackResponseTracks> {
    // TODO: make better socket selection if none provided
    socket = socket ?? [...this.sockets.values()][0];

    return new Promise((res, rej) => {
      const { options } = socket!;
      const { request } = options.secure ? https : http;

      request(
        `http${options.secure ? "s" : ""}://${options.address}:${
          options.port
        }/decodetrack?track=${encodeURIComponent(track)}`,
        {
          headers: {
            Authorization: options.password,
          },
        },
        (response) => {
          const data = Buffer.alloc(0);

          response
            .on("data", (c) => Buffer.concat([data, c]))
            .on("error", (error) => rej(error))
            .on("end", () => res(JSON.parse(data.toString())));
        }
      )
        .on("error", (error) => rej(error))
        .end();
    });
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

export interface ObsidianTrackResponse {
  load_type: ObsidianTrackResponseLoadtype;
  playlist_info?: ObsidianTrackResponseTrackPlaylist;
  tracks: ObsidianTrackResponseTracks[];
  exception?: ObsidianTrackResponseTrackException;
}

export interface ObsidianTrackResponseTrackPlaylist {
  name: string;
  selectedTrack: number;
}

export interface ObsidianTrackResponseTracks {
  track: string;
  info: ObsidianTrackResponseTrackInfo;
}

export interface ObsidianTrackResponseTrackException {
  message: string;
  severity: "COMMON" | "SUSPICIOUS" | "FAULT";
}

export interface ObsidianTrackResponseTrackInfo {
  title: string;
  author: string;
  uri: string;
  identifier: string;
  length: number;
  position: number;
  is_stream: boolean;
  is_seekable: boolean;
}

export type ObsidianTrackResponseLoadtype =
  | "NO_MATCHES"
  | "LOAD_FAILED"
  | "TRACK_LOADED"
  | "SEARCH_RESULT"
  | "PLAYLIST_LOADED";