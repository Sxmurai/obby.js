/*
  Copyright (C) 2021 ixxaesthetical (Gavin)

  This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
  
  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
*/

import { Socket } from "./structures/Socket";
import { Player } from "./structures/Player";
import { Manager } from "./structures/Manager";

/**
 * Totally not borrowed from https://github.com/Lavaclient/lavaclient/blob/master/src/Structures.ts
 */
export class Structure {
  private static classes = {
    Player,
    Socket,
    Manager,
  };

  static extend<K extends keyof Classes, E extends Classes[K]>(
    name: K,
    extension: (clazz: Classes[K]) => E
  ) {
    return (this.classes[name] = extension(this.classes[name]));
  }

  static get<K extends keyof Classes>(name: K) {
    return this.classes[name];
  }
}

interface Classes {
  Player: typeof Player;
  Socket: typeof Socket;
  Manager: typeof Manager;
}
