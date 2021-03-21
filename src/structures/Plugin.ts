import type { Obsidian } from "./Obsidian";

export abstract class Plugin {
  public obsidian!: Obsidian;
  public loaded = false;

  /**
   * If it should manually be loaded
   */
  public manualLoad = false;

  /**
   * When the plugin is loaded.
   * @param {Obsidian} obsidian
   * @returns
   */
  public load(obsidian: Obsidian) {
    this.obsidian = obsidian;

    return;
  }

  /**
   * When the plugin is initalized
   * @returns {void}
   */
  public init() {
    this.loaded = true;
    return;
  }
}
