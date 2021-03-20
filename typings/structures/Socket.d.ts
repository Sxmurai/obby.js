import { Obsidian } from "./Obsidian";
export declare class Socket {
    #private;
    options: SocketOptions;
    obsidian: Obsidian;
    constructor(obsidian: Obsidian, options: SocketOptions);
    private init;
    send(op: OpCodes, d: any): void;
    private _onOpen;
    private _onMessage;
    private _onClose;
    private _onError;
}
export interface SocketOptions {
    name?: string;
    address?: string | number;
    port?: number;
    password: string;
    secure?: boolean;
}
export declare enum OpCodes {
    VOICE_UPDATE = 0,
    STATS = 1,
    EVENT = 2,
    UPDATE = 3,
    PLAY = 4,
    STOP = 5,
    PAUSE = 6,
    FILTERS = 7,
    SEEK = 8,
    DESTROY = 9
}
