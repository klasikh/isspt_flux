// /pages/index.tsx
import Head from "next/head";
import { gql, useQuery } from "@apollo/client";
import type { Link as Node } from "@prisma/client";
import type { GetServerSideProps } from 'next'
import { getSession } from "next-auth/react"
import Link from "next/link";
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

const AllModulesQuery = gql`
  query allModulesQuery($first: Int, $after: ID) {
    modules(first: $first, after: $after) {
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
function Home() {
    
    const { data, loading, error, fetchMore } = useQuery(AllModulesQuery, {
        variables: { first: 10 },
    });

    if (loading) return <p>Chargement...</p>;
    if (error) return <p>Oh no... {error.message}</p>;

    const { endCursor, hasNextPage } = data?.modules.pageInfo;

    return (
        <div>
        <Head>
            <title>Modules</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="container mx-auto max-w-5xl mt-7">
            <div className="mb-12">
                { data?.motifs.edges.map(({ node }: { node: Node }) => (
                <Link href="/dashboard" key={node.id}>
                    <Button variant="outlined" size="sm" className="bg-blue-500 hover:text-white">
                        {node?.title}
                    </Button>
                </Link>
                ))}
                </div>
            </div>
        </div>
    );
}

export default Home;

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
                destination: '/404',
            },
            props: {},
        };
    }

    return {
        props: {},
    };
};
