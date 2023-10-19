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
                email: {
                    label: "Email",
                    type: "text",
                },
                password: {
                    label: "00000000",
                    password: "password"
                }
            },
            authorize: async (credentials) => {
                if(!credentials) {
                    return null;
                }
                
                const { email, password } = credentials;

                const user = await prisma.user.findUnique({
                    where: {
                        email
                    }
                });

                if(!user) {
                    throw new Error("Aucun utilisateur ne correspond à cette adresse email")
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
        signOut: "/auth/signout",
    },
    secret: process.env.NEXT_AUTH_SEC,
    jwt: {
        async encode({ secret, token }) {
            if(!token) {
                throw new Error("No token to encode");
            }
            return jwt.sign(token, secret);
        },
        async decode({ secret, token }) {
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
                params.session.user.email = params.token.email;
                params.session.user.role = params.token.role;
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
                params.token.email = params.user.email;
                params.token.role = params.user.role;
            }

            return params.token;
        }
    }
}

export default NextAuth(authOptions);

// export { handler as GET, handler as POST };
