"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

// import { signUp } from "../api/auth/signup";

const SignUp = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setMessage("Inscription en cours...");
    // const signUpMessage = await signUp(name, email, password);
    // setMessage(signUpMessage);
  }

  return (
    <>
      <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
      <div className="container mx-auto p-4">
        <Card className="absolute top-2/4 left-2/4 w-full max-w-[24rem] -translate-y-2/4 -translate-x-2/4">
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              Inscription
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <p className="-ml-2.5">
              {message}
            </p>
            <Input label="Nom" size="lg" onChange={(e) => setName(e.target.value)} />
            <Input type="email" label="Email" size="lg" onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" label="Mot de passe" size="lg" onChange={(e) => setPassword(e.target.value)} />
            <div className="-ml-2.5">
              <Checkbox label="J'accepte les termes et conditions" />
            </div>
          </CardBody>
          <CardFooter className="pt-0">
            <Button
              variant="gradient"
              fullWidth
              onClick={handleSubmit}
            >
              S&apos;inscrire
            </Button>
            <Typography variant="small" className="mt-6 flex justify-center">
              Avez-vous déjà un compte ?
              <Link href="/auth/signin">
                <Typography
                  as="span"
                  variant="small"
                  color="blue"
                  className="ml-1 font-bold"
                >
                  Se connecter
                </Typography>
              </Link>
            </Typography>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default SignUp;
