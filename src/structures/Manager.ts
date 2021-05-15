/*
  Copyright (C) 2021 ixxaesthetical (Gavin)

  This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
  
  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
*/

import centra from "centra";

import { Socket, SocketOptions } from "./Socket";
import { Player } from "./Player";
import { EventEmitter } from "events";
import { Structure } from "../Structure";

/**
 * The base class of the entire lib
 * @author ixxaesthetical (Gavin)
 * @since 2.0.0-alpha
 */
export class Manager extends EventEmitter {
  options: ManagerOptions;

  /**
   * The sockets used for connecting to Obsidian
   */
  sockets = new Map<string, Socket>();

  /**
   * The players spawned
   */
  players = new Map<string, Player>();

  constructor(options: ManagerOptions) {
    super();

    options.name ??= "Obby.js-Client";
    options.bufferTimeout ??= 0;
    // options.plugins ??= []; @TODO

    this.options = options;
  }

  /**
   * Inits the manager, which loads all of the sockets
   * @param {string} userId
   */
  init(userId?: string) {
    if (!userId && !this.options.userId) {
      throw new Error("No user ID was specified.");
    } else if (userId && !this.options.userId) {
      this.options.userId = userId;
    }

    if (!this.options.nodes.length) {
      throw new Error("No nodes were provided, therefore nothing to do.");
    }

    for (const node of this.options.nodes) {
      node.name ??= `Socket ${this.sockets.size + 1}`;

      this.sockets.set(node.name, new (Structure.get("Socket"))(this, node));
    }
  }

  /**
   * Creates a new player
   * @param {string} guild
   * @param {?Socket} socket
   * @param {?boolean} handleVcMove
   * @returns {Player}
   */
  create(guild: string, socket?: Socket, handleVcMove = true) {
    let player = this.players.get(guild);
    if (player) {
      return player;
    }

    socket ??= this.ideal[0];

    player = new (Structure.get("Player"))(this, {
      guild,
      handleVcMove,
      socket,
    });

    this.players.set(guild, player);

    return player;
  }

  /**
   * Kills a player
   * @param {string} guild
   * @param {boolean} disconnect
   */
  destroy(guild: string, disconnect = true) {
    const player = this.players.get(guild);
    if (!player) {
      return;
    }

    if (disconnect) {
      player.disconnect();
    }

    player.destroy();
  }

  get ideal(): Socket[] {
    return [...this.sockets.values()].sort((a, b) => b.penalties - a.penalties);
  }

  /**
   * Searches for tracks based on the term provided
   * @param {string} term
   * @param {Socket} socket
   * @returns {Promise<ObsidianTrackResponse[]>}
   */
  async search(
    term: string,
    socket?: Socket
  ): Promise<ObsidianTrackResponse[]> {
    socket ??= this.ideal[0];

    return new Promise(async (res, rej) => {
      centra(
        `http${socket?.secure ? "s" : ""}://${socket?.host}:${
          socket?.port
        }/loadtracks?identifier=${term}`
      )
        .header("Authorization", socket?.password!)
        .send()
        .then((resp) => res(resp.json()))
        .catch((error) => rej(error));
    });
  }

  /**
   * Decodes a track
   * @param {string} track
   * @param {Socket} socket
   * @returns {Promise<ObsidianTrackResponseTrackInfo>}
   */
  async decode(
    track: string,
    socket?: Socket
  ): Promise<ObsidianTrackResponseTrackInfo> {
    socket ??= this.ideal[0];

    return new Promise((res, rej) => {
      centra(
        `http${socket?.secure ? "s" : ""}://${socket?.host}:${
          socket?.port
        }/decodetrack?track=${track}`
      )
        .header("Authorization", socket?.password!)
        .send()
        .then((resp) => res(resp.json()))
        .catch((error) => rej(error));
    });
  }
}

export interface ManagerOptions {
  /**
   * The client name sent to Obsidian.
   * Defaults to "Obby.js-Client"
   */
  name?: string;

  /**
   * The user ID.
   * This is required at some point, rather in the ManagerOptions, or Manager#init(userId: string)
   */
  userId?: string;

  /**
   * The sockets to connect to.
   * This is required, as the client isn't very useful without nodes.
   */
  nodes: SocketOptions[];

  /**
   * Handles sending the packets to discord.
   * This is required, as how libs handle this is different.
   */
  send: SendOptions;

  /**
   * The resuming options.
   * If this object is specified, but no key/timeout is provided, it won't send resuming.
   * However if the object isn't specified, resuming is enabled by default.
   */
  resuming?: ResumingOptions;

  /**
   * The buffer timeout.
   * Not required, only needs a number though. Defautls to nothing.
   */
  bufferTimeout?: number;

  // /**
  //  * The plugins to load. @TODO
  //  */
  // plugins?: any[];
}

export type SendOptions = (guildId: string, payload: any) => any;

export interface ResumingOptions {
  key?: string;
  timeout?: number;
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

export interface Manager {
  // connected event
  on(event: "connected", listener: (socket: Socket) => any): this;
  once(event: "connected", listener: (socket: Socket) => any): this;

  // ready event
  on(event: "ready", listener: (socket: Socket) => any): this;
  once(event: "ready", listener: (socket: Socket) => any): this;

  // closed
  on(
    event: "closed",
    listener: (
      socket: Socket,
      code: number,
      reason: string,
      wasClean: boolean
    ) => any
  ): this;
  once(
    event: "closed",
    listener: (
      socket: Socket,
      code: number,
      reason: string,
      wasClean: boolean
    ) => any
  ): this;

  // error
  on(event: "error", listener: (socket: Socket, error: Error) => any): this;
  once(event: "error", listener: (socket: Socket, error: Error) => any): this;

  // stats
  on(event: "stats", listener: (socket: Socket) => any): this;
  once(event: "stats", listener: (socket: Socket) => any): this;
}
