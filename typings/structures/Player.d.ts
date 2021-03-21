/// <reference types="node" />
import { EventEmitter } from "events";
import { Obsidian, PlayerCreateOptions } from "./Obsidian";
import { OpCodes, Socket } from "./Socket";
export declare class Player extends EventEmitter {
    #private;
    socket: Socket;
    guild: string;
    channel: string | null;
    stats: PlayerStats;
    track: string;
    playing: boolean;
    paused: boolean;
    private _state;
    private _server;
    constructor(obsidian: Obsidian, options: PlayerCreateOptions);
    handleVoice(packet: any): void;
    connect(channel: string, options?: ConnectOptions): void;
    disconnect(): void;
    destroy(): void;
    play(track: string, options?: PlayTrackOptions): void;
    stop(): void;
    seek(position: number): void;
    pause(): void;
    resume(): void;
    filters(data: PlayerFilterData): void;
    send(op: OpCodes, payload?: any): void;
}
export interface Player {
    on(event: "start", listener: (track: string) => any): this;
    once(event: "start", listener: (track: string) => any): this;
    on(event: "end", listener: ({ track, reason, }: {
        track: string;
        reason: "STOPPED" | "REPLACED" | "CLEANUP" | "LOAD_FAILED" | "FINISHED";
    }) => any): this;
    on(event: "stuck", listener: ({ track, threshold, }: {
        track: string;
        threshold: number;
    }) => any): this;
    once(event: "stuck", listener: ({ track, threshold, }: {
        track: string;
        threshold: number;
    }) => any): this;
    on(event: "move", listener: ({ channel, deaf, mute, }: {
        channel: string;
        deaf: boolean;
        mute: boolean;
    }) => any): this;
    once(event: "move", listener: ({ channel, deaf, mute, }: {
        channel: string;
        deaf: boolean;
        mute: boolean;
    }) => any): this;
    on(event: "error", listener: ({ message, cause, severity, }: {
        message: string;
        cause: string;
        severity: string;
    }) => any): this;
    once(event: "error", listener: ({ message, cause, severity, }: {
        message: string;
        cause: string;
        severity: string;
    }) => any): this;
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
    mute?: boolean;
}
export interface PlayTrackOptions {
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
