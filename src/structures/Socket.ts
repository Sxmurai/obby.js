/*
  Copyright (C) 2021 ixxaesthetical (Gavin)

  This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
  
  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
*/

import Websocket, { OPEN, ErrorEvent, CloseEvent, MessageEvent } from "ws";

import { Manager } from "./Manager";

export class Socket {
  private socket!: Websocket;
  manager: Manager;

  url!: string;
  state = ConnectionState.CLOSED;

  name: string;
  host: string;
  port: number;
  password: string;
  secure: boolean;

  stats: SocketStats = {
    frames: {
      sent: 0,
      nulled: 0,
      deficit: 0,
    },
    cpu: {
      cores: 0,
      processLoad: 0,
      systemLoad: 0,
    },
    links: {
      active: 0,
      total: 0,
    },
    memory: {
      free: 0,
      allocated: 0,
      reservable: 0,
      used: 0,
    },
  };

  constructor(manager: Manager, options: SocketOptions) {
    this.manager = manager;

    this.name = options.name ?? `Socket ${manager.sockets.size + 1}`;
    this.host = options.host;
    this.port = options.port ?? 3030;
    this.password = options.password ?? "";
    this.secure = options.secure ?? false;

    this.connect();
  }

  connect() {
    if (this.socket && this.socket.readyState == OPEN) {
      this.manager.emit(
        "debug",
        "Socket was already found open, closing and reconnecting."
      );
      this.socket.close();
    }

    this.state = ConnectionState.CONNECTING;
    this.url = `ws${this.secure ? "s" : ""}://${this.host}:${this.port}`;

    this.socket = new Websocket(this.url, {
      headers: {
        Authorization: this.password,
        "User-Id": this.manager.options.userId,
        "Client-Name": this.manager.options.name,
        ...(Object.keys(this.manager.options.resuming ?? {}).length
          ? {
              // @ts-expect-error
              "Resume-Key": (this.manager.options.resuming?.key ??= Math.random()
                .toString(16)
                .slice(2)),
            }
          : {}),
      },
    });

    this.socket.onopen = this._open.bind(this);
    this.socket.onmessage = this._message.bind(this);
    this.socket.onerror = this._error.bind(this);
    this.socket.onclose = this._closed.bind(this);
  }

  send(op: OpCodes, d?: any) {
    this.socket.send(JSON.stringify({ op, d }));
  }

  /**
   * Get the penalties for this socket. Because yes.
   * Totally not taken from https://github.com/Lavaclient/lavaclient/blob/f55121b6fe46c21f5bc4e94d35019db38c101a95/src/structures/Socket.ts#L144#L155
   */
  get penalties() {
    const cpu = Math.pow(1.05, 100 * this.stats.cpu.systemLoad) * 10 - 10;

    let deficit = 0,
      nulled = 0;

    if (this.stats.frames.deficit !== -1) {
      deficit =
        Math.pow(1.03, 500 * ((this.stats.frames.deficit ?? 0) / 3000)) * 600 -
        600;

      nulled =
        (Math.pow(1.03, 500 * ((this.stats.frames.nulled ?? 0) / 3000)) * 600 -
          600) *
        2;
      nulled *= 2;
    }

    return cpu + deficit + nulled;
  }

  private _open() {
    this.state = ConnectionState.CONNECTED;
    this.manager.emit("connected", this);

    if (Object.keys(this.manager.options.resuming ?? {}).length) {
      this.send(OpCodes.SETUP_RESUMING, {
        key: this.manager.options.resuming!.key, // this should return a valid string, as when we connect we set this if none is present
        // @ts-expect-error
        timeout: (this.manager.options.resuming?.timeout ??= 60 * 1000),
      });
    }

    if (this.manager.options.bufferTimeout !== 0) {
      this.send(OpCodes.SETUP_DISPATCH_BUFFER, {
        timeot: this.manager.options.bufferTimeout,
      });
    }
  }

  private _message(event: MessageEvent) {
    let data: Packet = {};

    try {
      data = JSON.parse(event.data.toString());
    } catch (error) {
      this.manager.emit("error", this, error);
      return;
    }

    switch (data.op) {
      case OpCodes.STATS: {
        const { cpu, memory, links, frames } = data.d;

        this.stats = {
          cpu: {
            cores: cpu.cores,
            processLoad: cpu.process_load,
            systemLoad: cpu.system_load,
          },
          memory,
          links,
          frames,
        };

        this.manager.emit("stats", this);

        break;
      }

      case OpCodes.PLAYER_UPDATE: {
        const player = this.manager.players.get(data.d.guild_id);
        if (!player) {
          return;
        }

        player.track = data.d.current_track.track;
        player.potition = data.d.current_track.position;
        player.paused = data.d.current_track.paused;
        player.playing = !data.d.current_track.paused;

        break;
      }

      case OpCodes.PLAYER_EVENT: {
        const player = this.manager.players.get(data.d.guild_id);
        if (!player) {
          return;
        }

        switch (data.d.type) {
          case "WEBSOCKET_READY": {
            this.state = ConnectionState.READY;
            this.manager.emit("ready", this);

            break;
          }

          case "TRACK_START": {
            player.emit("start", data.d.track);
            break;
          }

          case "TRACK_END": {
            player.emit("end", { track: data.d.track, reason: data.d.reason });

            break;
          }

          case "TRACK_STUCK": {
            player.emit("stuck", {
              track: data.d.track,
              threshod: data.d.threshold_ms,
            });

            break;
          }

          case "TRACK_EXCEPTION": {
            player.emit("error", data.d.exception);
            break;
          }

          default: {
            player.emit(
              data.d.type.replace(/TRACK|WEBSOCKET/gi, "").toLowerCase(),
              data.d
            );
            break;
          }
        }

        break;
      }
    }
  }

  private _error(event: ErrorEvent) {
    this.manager.emit("error", this, event.error);
  }

  private _closed(event: CloseEvent) {
    this.state = ConnectionState.CLOSED;
    this.manager.emit("closed", this, event.code, event.reason, event.wasClean);
  }
}

export enum ConnectionState {
  CLOSED,
  CONNECTING,
  CONNECTED,
  READY,
}

export interface SocketOptions {
  /**
   * The name of the socket, used for identifying which Socket is which.
   * Defaults to Socket <socket count + 1>
   */
  name?: string;

  /**
   * The host (address) of where the Obsidian server is hosted.
   */
  host: string;

  /**
   * The port on the address of where the Obsidian server is hosted.
   * Defaults to 3333, the Obsidian default.
   */
  port?: number;

  /**
   * The password used to authorize with the Websocket and the HTTP REST API.
   * Defaulted to an empty string, the Obsidian default.
   */
  password?: string;

  /**
   * If the Obsidian server is using SSL
   * Defaults to false.
   */
  secure?: boolean;
}

export enum OpCodes {
  VOICE_UPDATE,
  STATS,
  PLAYER_EVENT,
  PLAYER_UPDATE,
  PLAY_TRACK,
  STOP_TRACK,
  PAUSE,
  FILTERS,
  SEEK,
  DESTROY,
  SETUP_RESUMING,
  SETUP_DISPATCH_BUFFER,
}

interface Packet {
  op?: number;
  d?: any;
}

export interface SocketStats {
  memory: MemoryStats;
  cpu: CPUStats;
  links: LinkStats;
  frames: FrameStats;
}

export interface MemoryStats {
  free: number;
  used: number;
  allocated: number;
  reservable: number;
}

export interface CPUStats {
  cores: number;
  systemLoad: number;
  processLoad: number;
}

export interface LinkStats {
  active: number;
  total: number;
}

export interface FrameStats {
  sent: number;
  nulled: number;
  deficit: number;
}
