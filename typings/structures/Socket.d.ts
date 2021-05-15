import { Manager } from "./Manager";
export declare class Socket {
    private socket;
    manager: Manager;
    url: string;
    state: ConnectionState;
    name: string;
    host: string;
    port: number;
    password: string;
    secure: boolean;
    stats: SocketStats;
    constructor(manager: Manager, options: SocketOptions);
    connect(): void;
    send(op: OpCodes, d?: any): void;
    get penalties(): number;
    private _open;
    private _message;
    private _error;
    private _closed;
}
export declare enum ConnectionState {
    CLOSED = 0,
    CONNECTING = 1,
    CONNECTED = 2,
    READY = 3
}
export interface SocketOptions {
    name?: string;
    host: string;
    port?: number;
    password?: string;
    secure?: boolean;
}
export declare enum OpCodes {
    VOICE_UPDATE = 0,
    STATS = 1,
    PLAYER_EVENT = 2,
    PLAYER_UPDATE = 3,
    PLAY_TRACK = 4,
    STOP_TRACK = 5,
    PAUSE = 6,
    FILTERS = 7,
    SEEK = 8,
    DESTROY = 9,
    SETUP_RESUMING = 10,
    SETUP_DISPATCH_BUFFER = 11
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
