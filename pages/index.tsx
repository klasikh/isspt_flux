"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation"
import Image from "next/image";

const HomePage = () => {
    const router = useRouter();
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
          // The user is not authenticated, handle it here.
        },
    })

    useEffect(() => {
        if(status && status === "authenticated") {
            router.push('/dashboard');
        } else {
            router.push('/auth/signin')
        }
    }, [status])
    return ( 
      <>
        <div className="text-center justify-center items-center flex min-h-screen bg-gray-100">
          <Image src="/images/spinner.gif" alt="" className="w-14 h-14 text-center justify-center items-center bg-none" />
        </div>
      </>
    );
}

export default HomePage;
