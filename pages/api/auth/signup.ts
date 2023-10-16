
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export const signUp = async (nama: string, email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if(user) {
        return "Il existe déjà un compte créé avec cette adresse email";
    }

    const passwordHashed = bcrypt.hashSync(password, 12);

    await prisma.user.create({
        data: {
            name,
            email,
            role: 'USER',
            passwordHashed
        },
    });

    return "Compte créé avec succès!";
}
