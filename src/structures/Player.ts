/*
  Copyright (C) 2021 ixxaesthetical (Gavin)

  This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
  
  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
*/

import EventEmitter from "events";

import { Manager } from "./Manager";
import { OpCodes, Socket } from "./Socket";

export class Player extends EventEmitter {
  private handleVcMove: boolean;

  socket: Socket;
  manager: Manager;

  guild: string;
  channel!: string | null;
  connected = false;

  #state: any;
  #server: any;

  paused = false;
  playing = false;
  potition = 0;
  track = "";
  volume = 100;

  filters: PlayerFilterData = {};

  constructor(manager: Manager, options: PlayerOptions) {
    super();

    this.manager = manager;

    this.socket = options.socket ?? manager.ideal[0];
    this.guild = options.guild;
    this.handleVcMove = options.handleVcMove ?? true;

    if (this.handleVcMove) {
      this.on("move", ({ channel, deaf, mute }) => {
        this.destroy();
        this.connect(channel, { deaf, mute });
        this.play(this.track, { start: this.potition });
      });
    }
  }

  /**
   * Binds the player to a voice channel.
   * @param {string} channel
   * @param {ConnectOptions} options
   */
  connect(channel: string, options: ConnectOptions = {}) {
    this.channel = channel;

    options.deaf ??= false;
    options.mute ??= false;

    this.manager.options.send(this.guild, {
      op: 4,
      d: {
        guild_id: this.guild,
        channel_id: this.channel,
        self_deaf: options.deaf,
        self_mute: options.mute,
      },
    });

    this.connected = true;
  }

  /**
   * Plays a track
   * @param {string} track
   * @param {PlayOptions} options
   */
  play(track: string, options: PlayOptions = {}) {
    if (!this.connected || !this.channel) {
      throw new Error("Player hasn't been connected yet.");
    }

    this.track = track;
    this.playing = true;

    this.send(OpCodes.PLAY_TRACK, {
      track,
      end_time: options.end,
      start_time: options.start,
      no_replace: options.noReplace,
    });
  }

  /**
   * Sets the players volume
   * @param {number} amount
   */
  setVolume(amount: number) {
    this.filters.volume = amount / 100;
    this.send(OpCodes.FILTERS, this.filters);
  }

  /**
   * Applies filters to the player
   * @param {filters} filters
   */
  setFilters(filters: PlayerFilterData) {
    if (filters === null) {
      this.send(OpCodes.FILTERS, (this.filters = {}));
      return;
    }

    this.filters = {
      ...filters,
    };

    this.send(OpCodes.FILTERS, this.filters);
  }

  /**
   * Pauses the player
   */
  pause() {
    this.send(OpCodes.PAUSE, { state: true });
  }

  /**
   * Resumes the player
   */
  resume() {
    this.send(OpCodes.PAUSE, { state: false });
  }

  /**
   * Seeks the player to a certain position
   * @param {number} position
   */
  seek(position: number) {
    this.send(OpCodes.SEEK, { position });
  }

  /**
   * Disconects the player from the voice channel if there is one.
   */
  disconnect() {
    if (!this.channel) {
      return;
    }

    this.channel = null;

    this.manager.options.send(this.guild, {
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
   * Destroys the player aka the link
   */
  destroy() {
    this.send(OpCodes.DESTROY);
  }

  /**
   * Sends data to the socket
   * @param {number} op
   * @param {any} d
   */
  send(op: OpCodes, d?: any) {
    this.socket.send(op, { guild_id: this.guild, ...d });
  }

  /**
   * Sends a voice update to discord
   * @param {any} update
   */
  voiceUpdate(update: any) {
    if ("d" in update) {
      update = update.d;
    }

    if (this.#state && "user_id" in update) {
      if (update.user_id !== this.manager.options.userId) {
        return;
      }
    }

    if ("token" in update) {
      this.#server = update;
    } else {
      this.#state = update;
    }

    if (this.#state && this.#server) {
      this.send(OpCodes.VOICE_UPDATE, {
        session_id: this.#state.session_id,
        ...this.#server,
      });

      this.#server = this.#state = undefined;
    }
  }
}

export interface PlayerOptions {
  guild: string;
  socket?: Socket;
  handleVcMove?: boolean;
}

export interface ConnectOptions {
  deaf?: boolean;
  mute?: boolean;
}

export interface PlayOptions {
  end?: number;
  start?: number;
  noReplace?: boolean;
}

export interface PlayerFilterData {
  volume?: number;
  tremolo?: PlayerFilterDataTremolo;
  equalizer?: PlayerFilterDataEqualizerBands[];
  timescale?: PlayerFilterDataTimescale;
  karaoke?: PlayerFilterDataKaraoke;
  channel_mix?: PlayerFilterDataChannelMix;
  vibrato?: PlayerFilterDataVibrato;
  rotation?: PlayerFilterDataRotation;
  low_pass?: PlayerFilterDataLowPass;
}

export interface PlayerFilterDataTremolo {
  frequency: number;
  depth: number;
}

export interface PlayerFilterDataTimescale {
  pitch: number;
  pitch_octaves?: number;
  picth_semi_tones?: number;
  rate: number;
  rate_change?: number;
  speed?: number;
  speed_change?: number;
}

// no idea what this is used for but here you go
export interface PlayerFilterDataKaraoke {
  filter_band?: number;
  filter_width?: number;
  level: number;
  mono_level?: number;
}

export interface PlayerFilterDataChannelMix {
  right_to_left: number;
  right_to_right: number;
  left_to_right: number;
  left_to_left: number;
}

export interface PlayerFilterDataVibrato {
  frequency: number;
  depth: number;
}

export interface PlayerFilterDataRotation {
  rotation_hz: number;
}

export interface PlayerFilterDataLowPass {
  smoothing: number;
}

export interface EqualizerBands {
  band: number;
  gain: number;
}

export interface PlayerFilterDataEqualizerBands {
  bands: EqualizerBands[];
}

export interface Player {
  on(
    event: "move",
    listener: ({
      channel,
      deaf,
      mute,
    }: {
      channel: string;
      deaf: boolean;
      mute: boolean;
    }) => any
  ): this;
  once(
    event: "move",
    listener: ({
      channel,
      deaf,
      mute,
    }: {
      channel: string;
      deaf: boolean;
      mute: boolean;
    }) => any
  ): this;

  on(event: "start", listener: (track: string) => any): this;
  once(event: "start", listener: (track: string) => any): this;

  on(
    event: "end",
    listener: ({ track, reason }: { track: string; reason: string }) => any
  ): this;
  once(
    event: "end",
    listener: ({ track, reason }: { track: string; reason: string }) => any
  ): this;

  on(
    event: "stuck",
    listener: ({
      track,
      threshold,
    }: {
      track: string;
      threshold: number;
    }) => any
  ): this;
  once(
    event: "stuck",
    listener: ({
      track,
      threshold,
    }: {
      track: string;
      threshold: number;
    }) => any
  ): this;

  on(event: "error", listener: (exception: any) => any): this;
  once(event: "error", listener: (exception: any) => any): this;
}
