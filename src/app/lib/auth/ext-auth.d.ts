import "next-auth";
import { SessionUser } from "./interface";

declare module "next-auth" {
    interface Session {
        user: SessionUser;
    }
}