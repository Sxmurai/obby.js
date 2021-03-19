import ws from "ws";
import { Obsidian } from "./Obsidian";

/**
 * Handles the packets sent and recieved
 *
 * @author aesthetical
 * @since 1.0.0
 */
export class Socket {
  /**
   * The websocket connection
   * @type {ws | null}
   */
  #ws: ws | null = null;

  public options: SocketOptions;
  public obsidian: Obsidian;

  public constructor(obsidian: Obsidian, options: SocketOptions) {
    options.secure = options.secure ?? false;

    this.obsidian = obsidian;
    this.options = options;

    this.init();
  }

  private init() {
    if (this.#ws) {
      this.obsidian.emit(
        "debug",
        this,
        "Socket connection already exists, disconnecting and reconnecting..."
      );

      this.#ws.close();
      this.#ws = null;
    }

    this.#ws = new ws(
      `ws${this.options.secure ? "s" : ""}://${this.options.address}:${
        this.options.port
      }`,
      {
        headers: {
          Authorization: this.options.password,
          "User-Id": this.obsidian.options.id,
        },
      }
    );

    this.#ws.onclose = this._onClose.bind(this);
    this.#ws.onerror = this._onError;
    this.#ws.onmessage = this._onMessage.bind(this);
    this.#ws.onopen = this._onOpen.bind(this);
  }

  public send(op: OpCodes, d: any) {
    this.#ws!.send(JSON.stringify({ op, d }));
  }

  private _onOpen() {
    this.obsidian.emit("connected", this.options);
  }

  private _onMessage(event: ws.MessageEvent) {
    const data = JSON.parse(event.data.toString());

    // send the raw data in case you would want that?
    this.obsidian.emit("raw", this, data.op ?? -1, data.d);

    switch (data.op) {
      case OpCodes.EVENT: {
        const player = this.obsidian.players.get(data.d.guild_id);
        if (!player) {
          return;
        }

        // for now this would work
        player.emit(
          data.d.type.replace(/(track_|websocket_)/gi, "").toLowerCase(),
          data.d
        );
        break;
      }

      case OpCodes.UPDATE: {
        const player = this.obsidian.players.get(data.d.guild_id);

        player!.stats = {
          frames: data.d.frames,
          playingTrack: data.d.current_track, // ew snake_case
        };

        player!.paused = data.d.current_track.paused;
        player!.playing = !data.d.current_track.paused;
        break;
      }
    }
  }

  private _onClose(event: ws.CloseEvent) {
    this.obsidian.emit("closed", this, event.code, event.reason);

    switch (event.code) {
      case 4001:
        throw new Error("Invalid authorization was supplied.");

      case 4002:
        throw new Error("User-Id was not supplied.");

      case 4004:
        throw new Error("Client with supplied user id already exists.");

      case 4005:
        throw new Error(
          "Obsidian had an error while handling incoming frames."
        );
    }
  }

  private _onError(event: ws.ErrorEvent) {
    throw new event.error();
  }
}

export interface SocketOptions {
  name: string;
  address: string | number;
  port: number;
  password: string;
  secure?: boolean;
}

export enum OpCodes {
  VOICE_UPDATE,
  STATS,
  EVENT,
  UPDATE,
  PLAY,
  STOP,
  PAUSE,
  FILTERS,
  SEEK,
  DESTROY,
}