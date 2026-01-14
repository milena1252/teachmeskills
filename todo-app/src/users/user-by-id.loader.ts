import { Injectable, Scope } from "@nestjs/common";
import DataLoader from "dataloader";
import { UsersService } from "./users.service";
import { UserType } from "./user.type";

@Injectable({ scope: Scope.REQUEST })
export class UserByIdLoader {
    constructor(private readonly usersService: UsersService) {}

    public readonly loader = new DataLoader<string, UserType | null>(
        async(ids) => {
        const users = await this.usersService.findByIds(ids as string[]);

        const map = new Map(users.map((u) => [u.id, u]));

        return ids.map((id) => map.get(id) ?? null);
    });
}