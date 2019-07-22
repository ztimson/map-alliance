import {User} from "./user";

export interface Message {
    from: User;
    text: string;
}
