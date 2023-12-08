// /pages/index.tsx
import Head from "next/head";
import { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { AwesomeLink } from "../../components/AwesomeLink";
import type { Link as Node } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import Link from "next/link";
import Pagination from "../../components/Pagination";
import PaginationNew from "../../components/PaginationNew";
// import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon, EyeIcon, PencilIcon, TrashIcon, } from "@heroicons/react/24/outline";
import axios, { all } from "axios";

const AllPaymentsQuery = gql`
  query allPaymentsQuery($first: Int, $after: ID) {
    payments(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          surname
          description
          motifId
        }
      }
    }
  }
`;

const PaymentsList = ({ payments, }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const {data:session}=useSession()
  const theUserSession = session;

  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  const { data: allPays } = useQuery(AllPaymentsQuery);
        console.log(allPays)
  useEffect(() => {
    const fetchPosts = async () => { 
        setLoading(true);
        // const res = await axios.post('/api/graphql', {
        //                         "query": AllPaymentsQuery,
        //                         "variables" : ""
        //                       },
        //                     { headers: { 'Content-Type': 'application/json' } }
        //                   );
        // setAllPayments(res);
        setLoading(false);
    };
    
    fetchPosts();
    console.log(allPayments);
  }, []);

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = payments.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  return (
    <div>
      <Head>
        <title>Liste des payments</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto max-w-5xl mt-7">
        <div className="mb-12">
          <Link href="/payments/add">
            <Button variant="outlined" size="sm" className="bg-blue-500 hover:text-white">
              Ajouter un paiement
            </Button>
          </Link>
        </div>
        <div className="mt-12">
          <div className=""></div>
          <Card>
            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
              <Typography variant="h6" color="white">
                Liste des paiements ({payments.length})
              </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["nom de l'étudiant", "motif", "montant", "status", "action",].map(
                      (el) => (
                        <th
                          key={el}
                          className="border-b border-blue-gray-50 py-3 px-5 text-left"
                        >
                          <Typography
                            variant="small"
                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                          >
                            {el}
                          </Typography>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  { currentPosts?.map((node: any) => (
                        <tr key={node.id}>
                          <td className={`py-3 px-5`}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {node.name + " " + node.surname}
                              </Typography>
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {node.motif?.name}
                              </Typography>
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {node.amount}
                              </Typography>
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                            <div className="flex items-center gap-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="text-xs font-medium text-blue-gray-600"
                              >
                                <span className={
                                    node.status === "CREATED"
                                    ? "inline-block bg-gray-400 rounded-full px-3 py-1 text-xs font-semibold text-gray-900 mr-2 mb-2"
                                    : node.status === "CANCELED"
                                    ? "inline-block bg-black rounded-full px-3 py-1 text-xs font-semibold text-white mr-2 mb-2"
                                    : node.status === "ONPROCESS"
                                    ? "inline-block bg-yellow-500 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2"
                                    : node.status === "APPROVED"
                                    ? "inline-block bg-green-500 rounded-full px-3 py-1 text-xs font-semibold text-white mr-2 mb-2"
                                    : node.status === "REJECTED"
                                    ? "inline-block bg-red-500 rounded-full px-3 py-1 text-xs font-semibold text-white mr-2 mb-2"
                                    : ""
                                  }
                                >
                                  {
                                    node.status === "CREATED"
                                    ? "En attente"
                                    : node.status === "CANCELED"
                                    ? "Annuler"
                                    : node.status === "ONPROCESS"
                                    ? "Traitement..."
                                    : node.status === "APPROVED"
                                    ? "Approuvé"
                                    : node.status === "REJECTED"
                                    ? "Rejeté"
                                    : ""
                                  }
                                </span>
                              </Typography>
                            </div>
                          </td>
                          <td className={`py-3 px-5`}>
                             <Typography
                              className="text-xs font-semibold text-blue-gray-600"
                            >
                              <Link href={`/payments/${node.id}`}>
                                <IconButton variant="text" color="white" className="text-sm bg-gray-600 hover:bg-gray-400">
                                  <EyeIcon className="h-5 w-5 text-white-500" />
                                </IconButton>
                              </Link>
                              {
                                ((node.status === "CREATED" || node.status === "CANCELED"|| node.status === "REJECTED") && node.addedBy === theUserSession?.user?.id)
                                ?
                                  (
                                    <Link href={`/payments/edit/${node.id}`}>
                                      <IconButton variant="text" color="white" className="text-sm bg-blue-600 hover:bg-blue-400 mx-3">
                                        <PencilIcon className="h-5 w-5 text-white-500" />
                                      </IconButton>
                                    </Link>
                                  )
                                : ""
                              }
                            </Typography>
                          </td>
                        </tr>
                    )
                  )}
                </tbody>
              </table>
              <PaginationNew
                postsPerPage={postsPerPage}
                totalPosts={payments.length}
                paginate={paginate}
                currentPage={currentPage}
              />
              {/* <div className="text-center items-center justify-center w-1/3 mx-auto">

                <Pagination />
              </div> */}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PaymentsList;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
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

  if (!user || (user?.role !== "USER" && user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN")) {
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
      props: {},
    };
  }

  const payments = await prisma.payment.findMany({
    select: {
      id: true,
      description: true,
      name: true,
      surname: true,
      motif: {
        select: {
          name: true
        },
      },
      filiere: {
        select: {
          name: true
        },
      },
      amount: true,
      step: true,
      status: true,
      rejectMotif: true,
      resendMotif: true,
      isNotified: true,
      createdYear: true,
      addedBy: true,
      fromId: true,
      toId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!payments) return {
    notFound: true
  }

  const getUserPriorities = await prisma.userModulePriority.findMany({
    where: {
      userId: user.id,
      module: {
        name: "PAIEMENT"
      }
    },
    select: {
      userId: true,
      moduleId: true,
      module: {
        select: {
          id: true,
          name: true,
        }
      },
      priority: true
    },
    take: 1,
  })

  if(getUserPriorities[0] && getUserPriorities[0]?.module?.name === "PAIEMENT") {
    if(getUserPriorities[0].priority !== "READ" && getUserPriorities[0].priority !== "CREATE_READ" && getUserPriorities[0].priority !== "C_READ_UPDATE" && getUserPriorities[0].priority !== "C_READ_DELETE" && getUserPriorities[0].priority !== "C_R_UPDATE_DELETE" && getUserPriorities[0].priority !== "R_UPDATE_DELETE") {

      toast.error("Vous n'avez pas les permissions requises pour effectuer cette action.");
      return {
        redirect: {
          permanent: false,
          destination: '/dashboard',
        },
        props: {},
      };
    }

  } else {

    toast.error("Vous n'avez aucune priorité sur ce module")
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
      props: {},
    };
  }

  return {
    props: {
      payments,
    },
  };
};
