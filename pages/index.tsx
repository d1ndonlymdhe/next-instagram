import axios from 'axios'
import Cookies from 'js-cookie'
import { NextApiRequest } from 'next';
import { useEffect } from 'react'
import Header from '../components/Header';
import Spinner from '../components/Spinner';
import { connect } from '../utils/db';
import { user } from '../utils/type';
import User from '../utils/User';

export const server = "/api/";

export default function Home() {
  return <>
    <Header>
      <link rel="preconnect" href="localhost:4000"></link>
      <meta name="description" content="Madhe Ko Instagram an simple instagram clone built with nextjs"></meta>
      <meta name="robots" content="index,follow"></meta>
      <meta property="og:title" content="Madhe Ko Instagram"></meta>
      <meta property="og:site_name" content="Madhe Ko Instagram"></meta>
      <meta property="og:image" content={`/favicon.ico`}></meta>
    </Header>
    <div className="h-screen w-screen flex justify-center items-center bg-slate-400">
      <div className="grid items-center justify-center content-center h-full w-full max-w-[500px] overflow-hidden bg-white box-border rounded-lg px-2 pt-2 font-Roboto">
        <Spinner></Spinner>
      </div>
    </div>
  </>
}
export async function getServerSideProps(context: { req: NextApiRequest }) {
  const hash = context.req.cookies.hash;
  if (hash) {
    const connection = await connect();
    const reqUser = await User.findOne({ hash: hash }) as user;
    if (reqUser) {
      if (reqUser.firstLogin) {
        return {
          redirect: {
            permanent: false,
            destination: "/setup"
          }
        }
      } else {
        return {
          redirect: {
            permanent: false,
            destination: "/home"
          }
        }
      }
    }
  } else {
    return {
      redirect: {
        permanent: false,
        destination: "/getstarted"
      }
    }
  }
  return {
    redirect: {
      permanent: false,
      destination: "/getstarted"
    }
  }
}

