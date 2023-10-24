import React, { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form'
import prisma from '../../../lib/prisma';
import { gql, useQuery, useMutation } from '@apollo/client';
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

type FormValues = {
  id: string;
  title: string;
  description: string;
  name: string;
  motifId: string;
  filiereId: string;
  amount: string;
  step: string;
  filePath: FileList;
  createdYear: string;
  addedBy: string;
}

const AllMotifsQuery = gql`
  query allFilieresQuery($first: Int, $after: ID) {
    motifs(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          description
        }
      }
    }
  }
`;

const AllFilieresQuery = gql`
  query allFilieresQuery($first: Int, $after: ID) {
    filieres(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          description
        }
      }
    }
  }
`;

const EditPaymentMutation = gql`
  mutation($id: ID!, $title: String!, $description: String!, $name: String!, $motifId: ID!, $filiereId: ID!, $step: String!, $amount: String!, $createdYear: String!, $addedBy: String!) {
    updatePayment(id: $id, title: $title, description: $description, name: $name, motifId: $motifId, filiereId: $filiereId, amount: $amount, step: $step, createdYear: $createdYear, addedBy: $addedBy) {
      id
      title
      description
      name
      motifId
      filiereId
      amount
      step
      filePath
      createdYear
      addedBy
    }
  }
`

const EditPayment = ({ payment }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {data:session}=useSession()
  const theUserSession = session;

  const { data: allMotifs } = useQuery(AllMotifsQuery);

  const { data: allFilieres } = useQuery(AllFilieresQuery);

  const [editPayment, { data, loading, error }] = useMutation(EditPaymentMutation)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ mode: 'onBlur' });

  // Upload photo function
  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length <= 0) return
    const file = e.target.files[0]
    const filename = encodeURIComponent(file.name)
    const res = await fetch(`/api/upload-image?file=${filename}`)
    const data = await res.json()
    const formData = new FormData()

    // @ts-ignore
    Object.entries({ ...data.fields, file }).forEach(([key, value]) => {
      // @ts-ignore
      formData.append(key, value)
    })

    toast.promise(
      fetch(data.url, {
        method: 'POST',
        body: formData,
      }),
      {
        loading: 'Uploading...',
        success: 'Image successfully uploaded!🎉',
        error: `Upload failed 😥 Please try again ${error}`,
      },
    )
  }

  useEffect(() => {
    if (payment) {
        reset({
          title: payment.title,
          description: payment.description,
          name: payment.name ,
          motifId: payment.motifId,
          filiereId: payment.filiereId,
          amount: payment.amount,
          step: payment.step,
        });
    }
  }, [payment]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { id, title, description, name, motifId, filiereId, amount, step, createdYear, addedBy } = data

    // const filePath = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${image[0]?.name}`

    const theStep = "0";
    const year = new Date().getFullYear();
    const yearToString = year.toString()
    // const variables = { title, description, name, motifId, filiereId, amount, theStep, filePath, createdYear, }
    const variables = { id: payment.id, title, description, name, motifId, filiereId, amount, step: theStep, createdYear: yearToString, addedBy: session?.user.id }
    try {
      const theEditedPayment = await toast.promise(editPayment({ variables }), {
        loading: 'Opération en cours..',
        success: 'Paiement mis a jour avec succès!🎉',
        error: `Une erreur s'est produite 😥 Veuillez re-essayer SVP - ${error}`,
      })

      // console.log(theEditedPayment)

      if(theEditedPayment.data.updatePayment) {
        router.push(`/payments/${theEditedPayment.data.updatePayment.id}`)
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className="container mx-auto px-8 mt-10">
        <Toaster />
        <h1 className="text-3xl font-medium mb-5">Editer un paiement</h1>
        <form className="grid grid-cols-1 gap-y-4 bg-white shadow-lg p-8 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-gray-700">Titre</span>
            <input
              placeholder="Paiement ..."
              {...register('title', { required: true })}
              name="title"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <label for="description" class="block">
            <span className="text-gray-700">Description</span>
            <textarea id="description" rows="4" {...register('description', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Description du paiement" name="description"></textarea>
          </label>
          <label className="block">
            <span className="text-gray-700">Nom de l&apos;étudiant</span>
            <input
              placeholder="Nom complet de l'étudiant"
              {...register('name', { required: true })}
              name="name"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <div className="flex gap-x-4 w-full">
            <label className="block w-full">
              <span className="text-gray-700">Motif de paiement</span>
              <select id="motifs" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="motifId" {...register('motifId', { required: true })}>
                <option value="" disabled>Motif</option>
                { allMotifs?.motifs.edges.map(({ node }: { node: Node }) => (
                    <option value={node.id} >{node.name}</option>
                  )
                )}
              </select>
            </label>
            <label className="block w-full">
              <span className="text-gray-700">Filière de l&apos;étudiant</span>
              <select id="filieres" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" name="filiereId" {...register('filiereId', { required: true })}>
                <option value="" disabled>Filière</option>
                { allFilieres?.filieres.edges.map(({ node }: { node: Node }) => (
                    <option value={node.id} >{node.name}</option>
                  )
                )}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-gray-700">Montant</span>
            <input
              placeholder="Montant à payer"
              {...register('amount', { required: true })}
              name="amount"
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          {/* <label className="block">
            <span className="text-gray-700">Upload a .png or .jpg image (max 1MB).</span>
            <input
              {...register('image', { required: false })}
              onChange={uploadPhoto}
              type="file"
              accept="image/png, image/jpeg"
              name="image"
            />
          </label> */}

          <button
            disabled={loading}
            type="submit"
            className="my-4 capitalize bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="w-6 h-6 animate-spin mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                En cours...
              </span>
            ) : (
              <span>Valider</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPayment;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;
  const payment = await prisma.payment.findUnique({
    where: {
      id: id
    },
    select: {
      id: true,
      title: true,
      description: true,
      name: true,
      filiereId: true,
      motifId: true,
      amount: true,
      step: true,
      status: true,
      filePath: true,
      isNotified: true,
      createdYear: true,
      addedBy: true,
      fromId: true,
      toId: true,
    },
  });

  if (!payment) return {
    notFound: true
  }

  return {
    props: {
      payment,
    },
  };
};
