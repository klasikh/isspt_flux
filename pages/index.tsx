"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation"

const HomePage = () => {
    const router = useRouter();
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
          // The user is not authenticated, handle it here.
        },
    })

    useEffect(() => {
        if(status === "authenticated") {
            router.refresh();
            router.push('/dashboard');
        } else {
            router.push('/auth/signin')
        }
    }, [status])
    return (
      <>
        <div>Bienvenue sur Flux ISSPT...</div>
      </>
    );
}

export default HomePage;
