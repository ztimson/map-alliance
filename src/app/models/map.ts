import {Marker} from "./marker";
import {Drawing} from "./drawing";
import {User} from "./user";
import {Message} from "./message";

export interface Map {
    drawings: Drawing[];
    markers: Marker[];
    messages: Message[];
    name: string;
    users: User[];
}
