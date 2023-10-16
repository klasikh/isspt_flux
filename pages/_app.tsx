// pages/_app.tsx
import '../styles/tailwind.css'
// import { UserProvider } from '@auth0/nextjs-auth0/client'
import AppProvider from "../components/AppProvider"
import { ThemeProvider } from "@material-tailwind/react";
import { MaterialTailwindControllerProvider } from "../components/context";
import Layout from '../components/Layout'
import { ApolloProvider } from '@apollo/client'
import type { AppProps } from 'next/app'
import apolloClient from '../lib/apollo'

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
} : AppProps) {
  return (
    <AppProvider session={session}>
      <ThemeProvider>
        <MaterialTailwindControllerProvider>
          <ApolloProvider client={apolloClient}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ApolloProvider>
        </MaterialTailwindControllerProvider>
      </ThemeProvider>
    </AppProvider>
  )
}

export default MyApp
