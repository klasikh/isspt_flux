import { authOptions } from '../pages/api/auth/[...nextauth]'
import { getServerSession, useSession } from "next-auth/next"


export default async function createContext(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { data: sess, status }  = useSession()
  console.log(sess)

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

   // if the user is not logged in, return null
   if (!session || typeof session === 'undefined') return {}
   
   const { user, accessToken } = session
 
   return {
     user,
     accessToken,
   }

}