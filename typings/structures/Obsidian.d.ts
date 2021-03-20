/// <reference types="node" />
import { Socket, SocketOptions } from "./Socket";
import { EventEmitter } from "events";
import { Player } from "./Player";

export declare class Obsidian extends EventEmitter {
  options: ObsidianOptions;
  players: Map<string, Player>;
  sockets: Map<string, Socket>;
  constructor(options: ObsidianOptions);
  init(id?: string): void;
  create(options: PlayerCreateOptions): Player | undefined;
  destroy(guild: string): void;
  search(search: string, socket?: Socket): Promise<ObsidianTrackResponse>;
  decode(track: string, socket?: Socket): Promise<ObsidianTrackResponseTracks>;

  on(event: "connected", listener: (socket: Socket) => any);
  on(
    event: "raw",
    listener: (socket: Socket, opCode: number, data: any) => any
  );
  on(
    event: "closed",
    listener: (socket: Socket, code: number, reason?: string) => any
  );
  on(event: "error", listener: (socket: Socket, error: Error) => any);
}

export interface ObsidianOptions {
  nodes: SocketOptions[];
  id?: string;
  send: (id: string, payload: any) => any;
}
export interface PlayerCreateOptions {
  guild: string;
  socket?: Socket;
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

export declare type ObsidianTrackResponseLoadtype =
  | "NO_MATCHES"
  | "LOAD_FAILED"
  | "TRACK_LOADED"
  | "SEARCH_RESULT"
  | "PLAYLIST_LOADED";
