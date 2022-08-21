import axios from 'axios'
import Cookies from 'js-cookie'
import type { NextPage } from 'next'
import Head from 'next/head';
import { useEffect } from 'react'
import Header from '../components/Header';

export const server = "/api/";

export default function Home() {
  useEffect(() => {
    const hash = Cookies.get("hash");
    if (hash) {
      Cookies.set("hash", hash, { expires: 30 });
      axios.post(`${server}/userinfo`, { hash: hash }).then(res => {
        if (res.data.status === "ok") {
          if (res.data.message.firstLogin) {
            window.location.href = "/setup";
          } else {
            window.location.href = "/home";
          }
        } else {
          window.location.href = "/getstarted";

        }
      })
    } else {
      window.location.href = "/getstarted";
    }
  }, [])
  return <>
    <Header></Header>
    Loading</>
}
export async function getServerSideProps() {
  return {
    props: {

    }
  }
}

