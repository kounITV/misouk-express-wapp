import type { JWT } from "next-auth/jwt";
import { type Role } from "src/app/setting/interface";

interface BaseUser {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    phone: string;
    role: Role
}

export interface UserCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    user: BaseUser;
    accessToken: string;
    refreshToken: string;
}

export interface CustomUser extends BaseUser {
    accessToken: string;
    refreshToken: string;
}

export interface AuthorizationResult {
    authorized: boolean;
    message?: string;
}

export interface SessionUser extends BaseUser {
    accessToken: string;
    refreshToken: string;
}

export interface CustomJWT extends JWT {
    user?: SessionUser;
    exp?: number;
}