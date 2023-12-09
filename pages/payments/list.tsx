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
import axios from "axios";

const AllPaymentsQuery = `
  query MyQuery {
    payments {
      edges {
        node {
          id
          name
          surname
          description
          motifId
          motif{
            name
            description
          }
          filiere {
            name
            description
          }
          amount
          status
          step
        }
      }
    }
  }
`;

const GetDatasByFilter = `
  query($inputvalue: String!) {
    getDatasByFilter(inputvalue: $inputvalue) {
      edges {
        node {
          id
          name
          surname
          description
          motifId
          motif{
            name
            description
          }
          filiere {
            name
            description
          }
          amount
          status
          step
        }
      }
    }
  }
`;

const GetDatasByFilterInterval = `
query($leftSide: String!, $rightSide: String!) {
  getDatasByFilterInterval(leftSide: $leftSide, rightSide: $rightSide) {
    edges {
      node {
        id
        name
        surname
        description
        motifId
        motif{
          name
          description
        }
        filiere {
          name
          description
        }
        amount
        status
        step
      }
    }
  }
}
`;


const PaymentsList = ({ payments, }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const {data:session}=useSession();
  const theUserSession = session;

  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [noDataResponse, setNoDataResponse] = useState("");
  const [textSearchVar, setTextSearchVar] = useState("");
  const [intervalLeftSide, setIntervalLeftSide] = useState("");

  let yearsArray = []
  const currentDate = new Date();
  const currentYear = new Date().getFullYear();
  const yearToString = currentYear.toString()
  const nextDate = new Date(currentDate)
  nextDate.setDate(currentDate.getDate() + 1)

  for(let i=2018; i <= currentYear; i++) {
    yearsArray.push(i)
  } 

  function formatDate(date: any) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }

  useEffect(() => {
    const fetchPosts = async () => {
        setLoading(true);
        const res = await axios.post('/api/graphql', {
                                "query": AllPaymentsQuery,
                                // "variables" : ""
                              },
                            { headers: { 'Content-Type': 'application/json' } }
                          );
        if(res.data?.errors) {
          toast.error(`${res?.data.errors[0].extensions.originalError.message}`)
          setNoDataResponse(`${res?.data.errors[0].extensions.originalError.message}`);
          setLoading(false);
        } else {
          setLoading(false);
          setAllPayments(res.data?.data?.payments?.edges);
        }
        setLoading(false);
    };
    
    fetchPosts();
  }, []);

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = allPayments?.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const fetchTheDatas = async () => {
    setLoading(true);
        const res = await axios.post('/api/graphql', {
                                "query": AllPaymentsQuery,
                                // "variables" : ""
                              },
                            { headers: { 'Content-Type': 'application/json' } }
                          );
        if(res.data?.errors) {
          toast.error(`${res?.data.errors[0].extensions.originalError.message}`)
          setNoDataResponse(`${res?.data.errors[0].extensions.originalError.message}`);
          setLoading(false);
        } else {
          setLoading(false);
          setAllPayments(res.data?.data?.payments?.edges);
        }
        setLoading(false);
  }

  const filterByYearNameAndOthers = async (e: any) => {
    if(e.target.value) {
      if(e.target.value.length >= 3) {
        setTextSearchVar(e.target.value);
        try {
          setLoading(true);
          const filterRes = await axios.post('/api/graphql', {
                    "query": GetDatasByFilter,
                    "variables" : { inputvalue: e.target.value }
              },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if(filterRes.data?.errors) {
            toast.error(`${filterRes?.data.errors[0].extensions.originalError.message}`)
            setNoDataResponse(`${filterRes?.data.errors[0].extensions.originalError.message}`)
            setLoading(false);
          } else {
            setLoading(false);
            // if(filterRes.data?.data?.getDatasByFilter?.edges.length < 1) {
            //   setNoDataResponse("Aucune donnée trouvée")
            // } else {
              setAllPayments(filterRes.data?.data?.getDatasByFilter?.edges);
            // }
          }
          setLoading(false);
          
        } catch (error) {
          console.error(error)
        }
      }
    } else {
      fetchTheDatas();
    }
  }
  
  const filterByIntervalLeftSide = async (e: any) => {
    if(e.target.value) {
      if(e.target.value.length >= 3) {
        setIntervalLeftSide(e.target.value)
        try {
          setLoading(true);
          const filterRes = await axios.post('/api/graphql', {
                    "query": GetDatasByFilterInterval,
                    "variables" : { leftSide: e.target.value, rightSide: formatDate(nextDate) }
              },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if(filterRes.data?.errors) {
            toast.error(`${filterRes?.data.errors[0].extensions.originalError.message}`)
            setNoDataResponse(`${filterRes?.data.errors[0].extensions.originalError.message}`)
            setLoading(false);
          } else {
            setLoading(false);
            // if(filterRes.data?.data?.getDatasByFilter?.edges.length < 1) {
            //   setNoDataResponse("Aucune donnée trouvée")
            // } else {
              setAllPayments(filterRes.data?.data?.getDatasByFilterInterval?.edges);
            // }
          }
          setLoading(false);
          
        } catch (error) {
          console.error(error)
        }
      }
    } else {
      fetchTheDatas();
    }
  }
   
  const filterByIntervalRightSide = async (e: any) => {
    if(e.target.value) {
      if(intervalLeftSide) {
        if(e.target.value !== "" && e.target.value.length >= 3) {
          const selectedDate = new Date(e.target.value)
          let thisNextDate = new Date(selectedDate)
          thisNextDate.setDate(selectedDate.getDate() + 1)

          try {
            setLoading(true);
            const filterRes = await axios.post('/api/graphql', {
                      "query": GetDatasByFilterInterval,
                      "variables" : { leftSide: intervalLeftSide, rightSide: formatDate(thisNextDate) }
                },
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            if(filterRes.data?.errors) {
              toast.error(`${filterRes?.data.errors[0].extensions.originalError.message}`)
              setNoDataResponse(`${filterRes?.data.errors[0].extensions.originalError.message}`)
              setLoading(false);
            } else {
              setLoading(false);
              // if(filterRes.data?.data?.getDatasByFilter?.edges.length < 1) {
              //   setNoDataResponse("Aucune donnée trouvée")
              // } else {
                setAllPayments(filterRes.data?.data?.getDatasByFilterInterval?.edges);
              // }
            }
            setLoading(false);
            
          } catch (error) {
            console.error(error)
          }
        }
      }
    } else {
      fetchTheDatas();
    }
  }

  const skipAllFilter = async () =>  {
    setTextSearchVar("")
    setIntervalLeftSide("")
    let yearSel = document.getElementById('yearSelect')
    let textInp = document.getElementById('textInput')
    let dateInp = document.getElementById('dateInput')
    yearSel.value = ""
    textInp.value = ""
    dateInp.value = ""
    fetchTheDatas();
  }

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
        <div className="mt-5">
          <div className="flex space-x-1 mb-6 ml-10">
            <span className="text-md">Filtrer par :</span>
            <div className="">
              <select name="" id="yearSelect" className="-mt-2 ml-5 rounded-md -p-5" onChange={ (e) => filterByYearNameAndOthers(e) } >
                <option value="" selected disabled>Année</option>
                { yearsArray?.map((year) => (
                  <option value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="">
              <input type="text" id="textInput" placeholder="Nom / motif / filière / montant" className="-mt-2 rounded-md mx-5" onChange={ (e) => filterByYearNameAndOthers(e) } />
            </div>
          </div>
          <div className="flex space-x-1 mb-10 ml-10">
            <span className="text-md">Filtrer entre :</span>
            <div className="">
              <input 
                type="date" 
                id="dateInput"
                className="-mt-2 rounded-md mx-4" 
                onChange={ (e) => filterByIntervalLeftSide(e) }
                max={ formatDate(currentDate) }
              />
              <span>et</span>
              {
                intervalLeftSide 
                ? (
                    <input 
                      type="date" 
                      className={
                        intervalLeftSide
                        ? "-mt-2 rounded-md mx-4"
                        : "-mt-2 rounded-md mx-4 text-gray-600 border-gray-300 cursor-not-allowed"
                      } 
                      onChange={ (e) => filterByIntervalRightSide(e) } 
                      min={ formatDate(intervalLeftSide) }
                      max={ formatDate(currentDate) }
                      placeholder={ formatDate(currentDate) }
                      disabled={!intervalLeftSide} 
                    />
                )
                : (
                  <span className="mx-4">Aujourd'hui</span>
                )
              }
            </div>
            <div className="float-right right-0 mx-auto">
              <button 
                className={
                  (textSearchVar || intervalLeftSide)
                  ? "btn bg-red-300 border-red-500 p-2 text-white rounded-md -mt-2"
                  : "p-2 text-white rounded-md -mt-2 bg-gray-600 border-gray-300 cursor-not-allowed"
                } 
                onClick={skipAllFilter}
                disabled={!textSearchVar && !intervalLeftSide}
              >
                Annuler les filtres
              </button>
            </div>
          </div>
          <Card>
            <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
              <Typography variant="h6" color="white">
                Liste des paiements ({allPayments?.length})
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
                { !loading &&
                      currentPosts?.map(({node}: {node: any}) => (
                      <tbody>
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
                        </tbody>
                      )
                    )
                }
              </table>
              {
                loading && (
                  <div className="flex text-center justify-center items-center mx-auto flex-wrap">
                        <img src="/images/horizontal_loading.gif" alt="" className="inline-flex" style={{ width: "200px", height: "120px"}} />
                      </div>
                  ) 
              }
              { noDataResponse &&
                  <div className="text-center mt-5">{noDataResponse}</div>
              }
              <PaginationNew
                postsPerPage={postsPerPage}
                totalPosts={allPayments?.length}
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
