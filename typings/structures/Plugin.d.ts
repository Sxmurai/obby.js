import type { Obsidian } from "./Obsidian";
export declare abstract class Plugin {
    obsidian: Obsidian;
    loaded: boolean;
    manualLoad: boolean;
    load(obsidian: Obsidian): void;
    init(): void;
}
