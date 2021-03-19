import { EventEmitter } from "events";
import { Obsidian, PlayerCreateOptions } from "./Obsidian";
import { OpCodes, Socket } from "./Socket";

export class Player extends EventEmitter {
  /**
   * The socket that the player will use
   * @type {Socket}
   */
  public socket!: Socket;

  #obsdian: Obsidian;

  public guild!: string;
  public channel: string | null = null;

  // player statistics
  public stats!: PlayerStats;

  public track = "";
  public playing = false;
  public paused = false;

  private _state: any;
  private _server: any;

  public constructor(obsidian: Obsidian, options: PlayerCreateOptions) {
    super();

    this.guild = options.guild;

    // this will be set in Obsidian#create if none is provided
    this.socket = options.socket!;
    this.#obsdian = obsidian;
  }

  public handleVoice(packet: any) {
    if ("token" in packet) {
      this._server = packet;
    } else {
      this._state = packet;
    }

    if (this._state && this._server) {
      this.send(OpCodes.VOICE_UPDATE, {
        session_id: this._state.session_id,
        ...this._server,
      });

      delete this._server;
      delete this._state;
    }
  }

  /**
   * Connects the bot to the voice channel.
   * @param {string} channel
   * @param {ConnectOptions} options
   * @returns {void}
   */
  public connect(
    channel: string,
    options: ConnectOptions = { mute: false, deaf: false }
  ) {
    if (this.channel !== null) {
      return;
    }

    this.channel = channel;

    this.#obsdian.options.send(this.guild, {
      op: 4,
      d: {
        guild_id: this.guild,
        channel_id: this.channel,
        self_deaf: options!.deaf ?? false,
        self_mute: options!.mute ?? false,
      },
    });
  }

  /**
   * Disconnects the bot from the existing voice channel
   * @returns {void}
   */
  public disconnect() {
    if (!this.channel) {
      return;
    }

    this.#obsdian.options.send(this.guild, {
      op: 4,
      d: {
        guild_id: this.guild,
        channel_id: null,
        self_deaf: null,
        self_mute: null,
      },
    });
  }

  /**
   * Plays the track provided
   * @param {string} track
   */
  public play(track: string, options: PlayTrackOptions = {}) {
    this.send(OpCodes.PLAY, {
      track,
      end_time: options.end,
      start_time: options.start,
      no_replace: options.noReplace,
    });
  }

  /**
   * Stops the currently playing track
   */
  public stop() {
    this.send(OpCodes.STOP);
  }

  /**
   * Seeks to a position of the track in ms
   * @param {number} time Time to seek too in ms
   */
  public seek(position: number) {
    this.send(OpCodes.SEEK, { position });
  }

  /**
   * Pauses the currently playing track
   */
  public pause() {
    this.paused = true;
    this.send(OpCodes.PAUSE, { state: true });
  }

  /**
   * Resumes the track
   */
  public resume() {
    this.paused = false;
    this.send(OpCodes.PAUSE, { state: false });
  }

  public send(op: OpCodes, payload?: any) {
    this.socket.send(op, { guild_id: this.guild, ...payload });
  }
}

export interface PlayerStats {
  frames: {
    lost: number;
    sent: number;
  };
  playingTrack: {
    track: string;
    position: number;
    paused: boolean;
  };
}

export interface ConnectOptions {
  deaf?: boolean;
  mute?: boolean; // why would you ever want this???? but yeah its a thing
}

export interface PlayTrackOptions {
  end?: number;
  start?: number;
  noReplace?: boolean;
}
