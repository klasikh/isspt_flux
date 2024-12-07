import prisma from "../../../lib/prisma";
import NextAuth from "next-auth"
import { Account, AuthOptions, Profile, Session, User } from "next-auth/next";
// import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
    providers : [
        CredentialsProvider({
            name: "credentials",

            credentials: {
                username: {
                    label: "Username",
                    type: "text",
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            authorize: async (credentials) => {
                if(!credentials) {
                    return null;
                }
                
                const { username, password } = credentials;

                const user = await prisma.user.findUnique({
                    where: {
                        username
                    }
                });

                if(!user) {
                    throw new Error("Aucun compte ne correspond à ce nom d'utilisateur")
                    // return null;
                }

                const userPassword = user.password;

                const isValidPassword = bcrypt.compareSync(password, userPassword);

                if(!isValidPassword) {
                    throw new Error("Mot de passe incorrect")
                    // return null;
                }

                return user;
            },
        })
    ],
    pages: {
        signIn: "/auth/sigin",
        // signOut: "/auth/signout",
    },
    secret: "theNextAuthSecretHashedToSecurePassw0rd",
    jwt: {
        async encode({ secret, token }: { secret: any, token: any }) {
            if(!token) {
                throw new Error("No token to encode");
            }
            return jwt.sign(token, secret);
        },
        async decode({ secret, token }: { secret: any, token: any }) {
            if(!token) {
                throw new Error("No token to decode");
            }
            const decodedToken = jwt.verify(token, secret);

            if(typeof decodedToken === "string") {
                return JSON.parse(decodedToken);
            } else {
                return decodedToken;
            }
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
        updatedAge: 24 * 60 * 60,
    },
    callbacks: {
        async session(params: { session: Session; token: JWT; user: User }) {
            if(params.session.user) {
                params.session.user.id = params.token.id;
                params.session.user.name = params.token.name;
                params.session.user.username = params.token.username;
                params.session.user.image = params.token.image;
                params.session.user.role = params.token.role;
                params.session.user.bookmarks = params.token.bookmarks;
                params.session.user.payments = params.token.payments;
                params.session.user.userModulesPriorities = params.token.userModulesPriorities;
            }

            return params.session;
        },
        async jwt(params: {
            token: JWT,
            user?: User | undefined;
            account?: Account | null | undefined;
            profile?: Profile | undefined;
            isNewUser: boolean | undefined;
        }) {
            if(params.user) {
                params.token.id = params.user.id;
                params.token.name = params.user.name;
                params.token.username = params.user.username;
                params.token.image = params.user.image;
                params.token.role = params.user.role;
                params.token.payments = params.user.payments;
                params.token.bookmarks = params.user.bookmarks;
                params.token.userModulesPriorities = params.user.userModulesPriorities;
            }

            return params.token;
        }
    }
}

export default NextAuth(authOptions);

// export { handler as GET, handler as POST };
