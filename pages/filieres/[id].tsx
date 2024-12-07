import React, { Fragment, useRef, useState } from 'react'
import Head from "next/head";
import { type SubmitHandler, useForm } from 'react-hook-form'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import prisma from '../../lib/prisma';
import Link from "next/link";
import { gql, useMutation } from '@apollo/client';
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

const Filiere = ({ filiere }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Informations d'une filière</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-lg">
        <Toaster />
        <div className="flex">
            <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-500 text-white font-bold px-4 py-2 mb-6 rounded-md hover:bg-gray-600 flex"
            >
                <ArrowLeftIcon className="h-6 w-6 text-white font-bold mr-2" aria-hidden="true" />
                Retour
            </button>
            <Link
                href="/filieres/list"
                className="bg-blue-500 text-white font-bold px-4 py-2 mb-6 rounded-md hover:bg-gray-600 float-right right-0 ml-auto"
            >
                Liste des filières
            </Link>
        </div>
        <h1 className="text-2xl font-bold mb-3 uppercase text-center">Informations de la filière</h1>
        <div className="w-full bg-white rounded overflow-hidden shadow-lg">
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-4 block bg-gray-600 p-1 text-white">Sigle: {filiere.sigle}</div>
            <div className="font-bold text-xl mb-4 block bg-gray-600 p-1 text-white">Nom: {filiere.name}</div>
            <div className="font-bold text-xl block bg-gray-600 p-1 text-white">Description</div>
            <div className="text-gray-700 mb-4 text-base block bg-gray-300 p-2">
              <span>{filiere.description}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Filiere;

export const getServerSideProps: GetServerSideProps = async ( ctx, ) => {
    const id = ctx.params?.id;
    const session = await getSession(ctx);

    if (!session) {
        return {
            redirect: {
                permanent: false,
                destination: '/auth/signin',
            },
            props: {},
        };
    }

    const user = await prisma.user.findUnique({
        where: {
            username: session.user?.username,
        },
        select: {
            id: true,
            name: true,
            username: true,
            role: true,
        }
    });

    if (!user || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) {
        return {
            redirect: {
                permanent: false,
                destination: '/404',
            },
            props: {},
        };
    }

    const filiere = await prisma.filiere.findUnique({
        where: {
            id: id
        },
        select: {
            id: true,
            sigle: true,
            name: true,
            description: true,
        },
    });

    if (!filiere) return {
        notFound: true
    }

    return {
        props: {
            filiere,
        },
    };
};

