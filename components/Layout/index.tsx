import React from "react";
import Header from "./Header";
import Dashboard from "./Dashboard";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

interface Props {
  children: React.ReactNode | undefined
}
const Layout: React.FC<Props> = async ({ children }) => {

  const session = await getServerSession(authOptions);

  return (
    <div>
    {/* <Header /> */}
    {session && session.user?.email ? (
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
