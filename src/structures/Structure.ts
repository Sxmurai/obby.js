// this is dogshit ignore this dumpster fire
export class Structure {
  private static classes = {
    Player: require("./Player").Player,
    Socket: require("./Socket").Socket,
  };

  public static get<S>(structure: ExtensionType) {
    return this.classes[structure] as S;
  }

  public static extend<S>(
    structure: ExtensionType,
    extender: (extended: S) => S
  ) {
    const struct = this.classes[structure];
    if (!struct) {
      throw new Error("Couldn't find structure requested.");
    }

    this.classes[structure] = extender(struct);
  }
}

type ExtensionType = "Player" | "Socket";
