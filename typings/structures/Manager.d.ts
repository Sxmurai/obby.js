/// <reference types="node" />
import { Socket, SocketOptions } from "./Socket";
import { Player } from "./Player";
import { EventEmitter } from "events";
export declare class Manager extends EventEmitter {
    options: ManagerOptions;
    sockets: Map<string, Socket>;
    players: Map<string, Player>;
    constructor(options: ManagerOptions);
    init(userId?: string): void;
    create(guild: string, socket?: Socket, handleVcMove?: boolean): Player;
    destroy(guild: string, disconnect?: boolean): void;
    get ideal(): Socket[];
    search(term: string, socket?: Socket): Promise<ObsidianTrackResponse[]>;
    decode(track: string, socket?: Socket): Promise<ObsidianTrackResponseTrackInfo>;
}
export interface ManagerOptions {
    name?: string;
    userId?: string;
    nodes: SocketOptions[];
    send: SendOptions;
    resuming?: ResumingOptions;
    bufferTimeout?: number;
}
export declare type SendOptions = (guildId: string, payload: any) => any;
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
export declare type ObsidianTrackResponseLoadtype = "NO_MATCHES" | "LOAD_FAILED" | "TRACK_LOADED" | "SEARCH_RESULT" | "PLAYLIST_LOADED";
export interface Manager {
    on(event: "connected", listener: (socket: Socket) => any): this;
    once(event: "connected", listener: (socket: Socket) => any): this;
    on(event: "ready", listener: (socket: Socket) => any): this;
    once(event: "ready", listener: (socket: Socket) => any): this;
    on(event: "closed", listener: (socket: Socket, code: number, reason: string, wasClean: boolean) => any): this;
    once(event: "closed", listener: (socket: Socket, code: number, reason: string, wasClean: boolean) => any): this;
    on(event: "error", listener: (socket: Socket, error: Error) => any): this;
    once(event: "error", listener: (socket: Socket, error: Error) => any): this;
    on(event: "stats", listener: (socket: Socket) => any): this;
    once(event: "stats", listener: (socket: Socket) => any): this;
}
