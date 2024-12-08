// /pages/index.tsx
import React, { Fragment, useRef, useEffect, useState } from 'react'
import Head from "next/head";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { Link as Node } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from "next-auth/react";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import PaginationNew from "../../components/PaginationNew";
import prisma from '../../lib/prisma';

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

const AllLogsQuery = `
  query MyQuery {
    logInfos {
      edges {
        node {
          id
          title
          description
          link
          createdYear
        }
      }
    }
  }
`;

const GetLogInfosDatasByFilter = `
  query($inputvalue: String!) {
    getLogInfosDatasByFilter(inputvalue: $inputvalue) {
      edges {
        node {
          id
          title
          description
          link
          createdYear
        }
      }
    }
  }
`;

const GetLogInfosDatasByFilterInterval = `
query($leftSide: String!, $rightSide: String!) {
  getLogInfosDatasByFilterInterval(leftSide: $leftSide, rightSide: $rightSide) {
    edges {
      node {
        id
        title
        description
        link
        createdYear
      }
    }
  }
}
`;

const LogsList = ({ logs }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const {data:session}=useSession();
  const theUserSession = session;

  const [allLogs, setAllLogs] = useState([]);
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
                                "query": AllLogsQuery,
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
          setAllLogs(res.data?.data?.logInfos?.edges);
        }
        setLoading(false);
    };
    
    fetchPosts();
  }, []);

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = allLogs?.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const fetchTheDatas = async () => {
    setLoading(true);
        const res = await axios.post('/api/graphql', {
                                "query": AllLogsQuery,
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
          setAllLogs(res.data?.data?.logInfos?.edges);
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
                    "query": GetLogInfosDatasByFilter,
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
            // if(filterRes.data?.data?.getLogInfosDatasByFilter?.edges.length < 1) {
            //   setNoDataResponse("Aucune donnée trouvée")
            // } else {
              setAllLogs(filterRes.data?.data?.getLogInfosDatasByFilter?.edges);
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
                    "query": GetLogInfosDatasByFilterInterval,
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
            // if(filterRes.data?.data?.getLogInfosDatasByFilter?.edges.length < 1) {
            //   setNoDataResponse("Aucune donnée trouvée")
            // } else {
              setAllLogs(filterRes.data?.data?.getLogInfosDatasByFilterInterval?.edges);
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
                      "query": GetLogInfosDatasByFilterInterval,
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
              // if(filterRes.data?.data?.getLogInfosDatasByFilter?.edges.length < 1) {
              //   setNoDataResponse("Aucune donnée trouvée")
              // } else {
                setAllLogs(filterRes.data?.data?.getLogInfosDatasByFilterInterval?.edges);
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
          <title>Liste des logs</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="container mx-auto max-w-5xl mt-7">
          <div className="mt-12">
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
                <input type="text" id="textInput" placeholder="Titre / lien " className="-mt-2 rounded-md mx-5" onChange={ (e) => filterByYearNameAndOthers(e) } />
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
              <CardHeader variant="gradient" color="" className="bg-[#1a1930] mb-8 p-6">
                <Typography variant="h6" color="white">
                  Logs ({allLogs?.length})
                </Typography>
              </CardHeader>
              <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      {["title", "description", "action",].map(
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
                                  {node.title}
                                </Typography>
                              </div>
                            </td>
                            <td className={`py-3 px-5`}>
                              <Typography
                                variant="small"
                                className="text-xs font-medium text-blue-gray-600"
                              >
                                {
                                  node.description.length > 30
                                  ? node.description.substr(0, 30) + '...'
                                  : node.description
                                }
                              </Typography>
                            </td>
                            <td className={`py-3 px-5`}>
                              <Typography
                                className="text-xs font-semibold text-blue-gray-600"
                              >
                                <Link href={`/logs/${node.id}`}>
                                  <IconButton variant="text" color="white" className="text-sm bg-gray-600 hover:bg-gray-400">
                                    <EyeIcon className="h-5 w-5 text-white-500" />
                                  </IconButton>
                                </Link>
                              </Typography>
                            </td>
                          </tr>
                        </tbody>
                      )
                    )}
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
                  totalPosts={allLogs?.length}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              </CardBody>
            </Card>
          </div>


        </div>
      </div>
    );
}

export default LogsList;

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
    select: {
      username: true,
      role: true,
    },
    where: {
      username: session.user?.username,
    },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return {
      redirect: {
        permanent: false,
        destination: '/dashboard',
      },
      props: {},
    };
  }

  const logs = await prisma.logInfo.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      link: true,
      createdYear: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!logs) return {
    notFound: true
  }

  return {
    props: {
      logs,
    },
  };
};
