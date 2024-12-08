"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
// import { signUp } from "../api/auth/signup";
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
import toast, { Toaster } from "react-hot-toast";

const SignIn = () => {
    const router = useRouter();
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
          // The user is not authenticated, handle it here.
        },
    })
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [message, setMessage] = useState('');
    const [messageColor, setMessageColor] = useState('');

    const handleSubmit = async () => {
        
        try {
            if(!username || !password) {
                toast.error("Veuillez remplir tous les champs")
                setMessage('Veuillez remplir tous les champs');
                setMessageColor('text-red-500');
                setIsLoading(false)
                return ;
            }
            setIsLoading(true);
            setMessage("Connexion en cours...");
            setMessageColor('text-green-600');

            const signInResponse = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });
            // console.log(signInResponse)

            if(!signInResponse || signInResponse.ok !== true) {
                setMessage('Coordonnées de connexion incorrects');
                setMessageColor('text-red-500');
                setIsLoading(false)
            }
            
            if(signInResponse && signInResponse?.error) {
                setMessage(signInResponse?.error)
                setMessageColor('text-red-500');
                setIsLoading(false)
            } else {
                setIsLoading(false)
                router.push("/dashboard")
            }

        } catch(err) {
            // console.log(err);
        }

        // setMessage("signInMessage");
    }

    useEffect(() => {
        if(status && status === "authenticated") {
            // router.refresh();
            router.push('/dashboard');
        }
    }, [status])

    return (
        <>
            <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
            <Toaster />
                <div className="container mx-auto p-4">
                    <Card className="absolute top-2/4 left-2/4 w-full max-w-[24rem] -translate-y-2/4 -translate-x-2/4">
                        <form>
                            <CardHeader
                                variant="gradient"
                                color=""
                                className="bg-[#1a1930] text-center justify-center mb-4 grid h-28 place-items-center"
                            >
                                <div className="d-flex">
                                    <Image
                                        src="/images/logo.png"
                                        alt=""
                                        className="h-12 rounded mx-auto"
                                        width={60}
                                        height={60}
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
                                <Input type="text" label="Nom d'utilisateur" autoComplete="true" size="lg" onChange={(e) => setUsername(e.target.value)} required />
                                <Input type="password" label="Mot de passe" autoComplete="true" size="lg" onChange={(e) => setPassword(e.target.value)} required />
                                <div className="-ml-2.5">
                                    <Checkbox label="Se souvenir de moi" />
                                </div>
                            </CardBody>
                            <CardFooter className="pt-0">
                                <Button
                                    disabled={ isLoading || !username  || !password }
                                    className="bg-[#bb303b] hover:bg-[#cb6e35]"
                                    fullWidth
                                    onClick={handleSubmit}
                                    type="submit"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                            className="w-6 h-6 animate-spin mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                            >
                                            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                                            </svg>
                                            Connexion en cours...
                                        </span>
                                    ) : (
                                        <span>Se connecter</span>
                                    )}
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
