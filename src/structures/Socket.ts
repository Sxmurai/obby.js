import ws from "ws";
import { Obsidian, ObsidianOptionsResuming } from "./Obsidian";

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

  public connected = false;

  #useResuming = false;
  #setupDispatchBuffer = false;

  public constructor(obsidian: Obsidian, options: SocketOptions) {
    options.name = options.name ?? `Node ${obsidian.sockets.size + 1}`;
    options.secure = options.secure ?? false;
    options.address = options.address ?? "localhost";
    options.port = options.port ?? 3030; // default obsidian port

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

    const { options } = this.obsidian;

    const headers: Record<string, string | number> = {
      Authorization: this.options.password,
      "User-Id": options.id!,
    };

    this.#useResuming = false;

    if (options.resuming) {
      this.#useResuming = true;
      headers["Resume-Key"] =
        (options.resuming as any).key ?? Math.random().toString(16).slice(2);
    }

    if (
      this.obsidian.options.dispatchBuffer ||
      this.obsidian.options.dispatchBuffer !== -1
    ) {
      this.#setupDispatchBuffer = true;
    }

    this.#ws = new ws(
      `ws${this.options.secure ? "s" : ""}://${this.options.address}:${
        this.options.port
      }`,
      {
        headers,
      }
    );

    this.#ws.onclose = this._onClose.bind(this);
    this.#ws.onerror = this._onError.bind(this);
    this.#ws.onmessage = this._onMessage.bind(this);
    this.#ws.onopen = this._onOpen.bind(this);
  }

  public send(op: OpCodes, d: any) {
    this.#ws!.send(JSON.stringify({ op, d }));
  }

  private _onOpen() {
    this.obsidian.emit("connected", this.options);

    this._setupResuming();
    this._setupDispatchBuffer();
  }

  private _setupResuming() {
    if (!this.#useResuming) {
      return;
    }

    let data = this.obsidian.options.resuming;

    if (data) {
      data = {
        key: data.key ?? Math.random().toString(16).slice(2),
        timeout: data.timeout ?? 60000,
      };

      this.obsidian.options.resuming = data;
    }

    this.send(OpCodes.RESUMING, data);
  }

  private _setupDispatchBuffer() {
    if (!this.#setupDispatchBuffer) {
      return;
    }

    this.send(OpCodes.DISPATCH_BUFFER, {
      timeout: this.obsidian.options.dispatchBuffer!,
    });
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

        switch (data.d.type) {
          case "WEBSOCKET_READY": {
            this.connected = true;
            this.obsidian.emit("ready", this);
            break;
          }

          case "WEBSOCKET_CLOSED": {
            // see _onClose
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
              threshold: data.d.threshold_ms,
            });
            break;
          }

          case "TRACK_EXCEPTION": {
            player.emit("error", data.d.exception);
            break;
          }

          default: {
            // this is only here in case a new event was added, and im not aware about it. a little temp quick fix just in case
            player.emit(
              data.d.type.replace(/TRACK|WEBSOCKET/gi, "").toLowerCase(),
              data.d
            );
          }
        }

        break;
      }

      case OpCodes.UPDATE: {
        const player = this.obsidian.players.get(data.d.guild_id);

        if (player) {
          player!.stats = {
            frames: data.d.frames,
            playingTrack: data.d.current_track, // ew snake_case
          };

          player!.paused = data.d.current_track.paused;
          player!.playing = !data.d.current_track.paused;

          player!.track = data.d.current_track.track;
        }
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
    this.obsidian.emit("error", this, event.error);
  }
}

export interface SocketOptions {
  name?: string;
  address?: string | number;
  port?: number;
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
  RESUMING,
  DISPATCH_BUFFER, // im not too sure what this does but yeah its there and being added
}
