import { UsersModule } from "./users/users.module";
import { CoreEntity } from "./core";
import { AuthModule } from "./auth/auth.module";

export const features = [
  UsersModule,
  AuthModule
]


export const Entities = [
  CoreEntity
]