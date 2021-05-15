import { Socket } from "./structures/Socket";
import { Player } from "./structures/Player";
import { Manager } from "./structures/Manager";
export declare class Structure {
    private static classes;
    static extend<K extends keyof Classes, E extends Classes[K]>(name: K, extension: (clazz: Classes[K]) => E): E;
    static get<K extends keyof Classes>(name: K): {
        Player: typeof Player;
        Socket: typeof Socket;
        Manager: typeof Manager;
    }[K];
}
interface Classes {
    Player: typeof Player;
    Socket: typeof Socket;
    Manager: typeof Manager;
}
export {};
