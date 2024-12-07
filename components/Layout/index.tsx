import React from "react";
import { useSession } from "next-auth/react"
// import Header from "./Header";
import Dashboard from "./Dashboard";

// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../../pages/api/auth/[...nextauth]";

interface Props {
  children: React.ReactNode | React.ReactNode[]
}
const Layout: React.FC<Props> = ({ children }) => {

  // const session = await getServerSession(authOptions);
  const { data: session, status } = useSession()

  return (
    <div>
    {/* <Header /> */}
    {session && session.user?.username ? (
      <>
        <Dashboard>
          {children}
        </Dashboard>
      </>
    ) : (
      <>
        {children}
      </>
    )}
    </div>
  );
};

export default Layout;