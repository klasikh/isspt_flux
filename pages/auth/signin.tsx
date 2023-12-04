"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { signUp } from "../api/auth/signup";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";

const SignIn = () => {
    const router = useRouter();
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
          // The user is not authenticated, handle it here.
        },
    })

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [message, setMessage] = useState('');
    const [messageColor, setMessageColor] = useState('');

    const handleSubmit = async () => {
        setMessage("Connexion en cours...");
        setMessageColor('text-green-600');

        try {
            const signInResponse = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });
            // console.log(signInResponse)

            if(!signInResponse || signInResponse.ok !== true) {
                setMessage('Coordonnées de connexion incorrects');
                setMessageColor('text-red-500');
            }
            
            if(signInResponse && signInResponse?.error) {
                setMessage(signInResponse?.error)
                setMessageColor('text-red-500');
            } else {
                router.push("/dashboard")
            }

        } catch(err) {
            // console.log(err);
        }

        // setMessage("signInMessage");
    }

    useEffect(() => {
        if(status === "authenticated") {
            // router.refresh();
            router.push('/dashboard');
        }
    }, [status])

    return (
        <>
            <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
                <div className="container mx-auto p-4">
                    <Card className="absolute top-2/4 left-2/4 w-full max-w-[24rem] -translate-y-2/4 -translate-x-2/4">
                        <form>
                            <CardHeader
                                variant="gradient"
                                color="blue"
                                className="text-center justify-center mb-4 grid h-28 place-items-center"
                            >
                                <div className="d-flex">
                                    <img
                                        src="/images/logo.png"
                                        alt=""
                                        className="h-12 rounded mx-auto"
                                    />
                                </div>
                                <Typography variant="h3" color="white">
                                    Connexion
                                </Typography>
                            </CardHeader>
                            <CardBody className="flex flex-col gap-4">
                                <p className={`-ml-2.5 text-center justify-center ` + messageColor}>
                                    {message}
                                </p>
                                <Input type="email" label="Nom d'utilisateur" autoComplete="true" size="lg" onChange={(e) => setUsername(e.target.value)} />
                                <Input type="password" label="Mot de passe" autoComplete="true" size="lg" onChange={(e) => setPassword(e.target.value)} />
                                <div className="-ml-2.5">
                                    <Checkbox label="Se souvenir de moi" />
                                </div>
                            </CardBody>
                            <CardFooter className="pt-0">
                                <Button
                                    variant="gradient"
                                    fullWidth
                                    onClick={handleSubmit}
                                >
                                Se connecter
                                </Button>
                                {/* <Typography variant="small" className="mt-6 flex justify-center">
                                    Vous n&apos;avez pas de compte?
                                    <Link href="/auth/signup">
                                        <Typography
                                        as="span"
                                        variant="small"
                                        color="blue"
                                        className="ml-1 font-bold"
                                        >
                                        S&apos;inscrire
                                        </Typography>
                                    </Link>
                                </Typography> */}
                            </CardFooter>
                        </form>
                    </Card>
                </div>
        </>
    );
}

export default SignIn;
