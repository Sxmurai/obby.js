/// <reference types="node" />
import EventEmitter from "events";
import { Manager } from "./Manager";
import { OpCodes, Socket } from "./Socket";
export declare class Player extends EventEmitter {
    #private;
    private handleVcMove;
    socket: Socket;
    manager: Manager;
    guild: string;
    channel: string | null;
    connected: boolean;
    paused: boolean;
    playing: boolean;
    potition: number;
    track: string;
    volume: number;
    filters: PlayerFilterData;
    constructor(manager: Manager, options: PlayerOptions);
    connect(channel: string, options?: ConnectOptions): void;
    play(track: string, options?: PlayOptions): void;
    setVolume(amount: number): void;
    setFilters(filters: PlayerFilterData): void;
    pause(): void;
    resume(): void;
    seek(position: number): void;
    disconnect(): void;
    destroy(): void;
    send(op: OpCodes, d?: any): void;
    voiceUpdate(update: any): void;
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
    on(event: "start", listener: (track: string) => any): this;
    once(event: "start", listener: (track: string) => any): this;
    on(event: "end", listener: ({ track, reason }: {
        track: string;
        reason: string;
    }) => any): this;
    once(event: "end", listener: ({ track, reason }: {
        track: string;
        reason: string;
    }) => any): this;
    on(event: "stuck", listener: ({ track, threshold, }: {
        track: string;
        threshold: number;
    }) => any): this;
    once(event: "stuck", listener: ({ track, threshold, }: {
        track: string;
        threshold: number;
    }) => any): this;
    on(event: "error", listener: (exception: any) => any): this;
    once(event: "error", listener: (exception: any) => any): this;
}
