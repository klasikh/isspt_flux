import { authOptions } from '../pages/api/auth/[...nextauth]'
import { useSession } from "next-auth/react"


export default async function createContext(req: any, res: any) {
  const { data:session }=useSession()
  console.log(session)

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

   // if the user is not logged in, return null
   if (!session || typeof session === 'undefined') return {}
   
   const { user, expires } = session
 
   return {
     user,
     expires,
   }

}
