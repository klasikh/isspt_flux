import React from "react";
import { authOptions } from "../../../../pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

interface ProtectedLayoutProps {
    children: React.ReactNode | React.ReactNode[];
}

const ProtectedLayout = async ({children}: ProtectedLayoutProps) => {
    const session = await getServerSession(authOptions);

    if(!session || !session.user?.email) {
        return (
            <div>
                Cette route est protégée, vous devez vous connecter d&apos;abord.
            </div>
        )
    }

    return (
        <>
            {children}
        </>
    );
}

export default ProtectedLayout;
