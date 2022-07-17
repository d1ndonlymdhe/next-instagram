import axios from 'axios'
import Cookies from 'js-cookie'
import type { NextPage } from 'next'
import { useEffect } from 'react'

export const server = "/api/";

const Home: NextPage = () => {
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
        }
      })
    } else {
      window.location.href = "/getstarted";
    }
  }, [])
  return <>Loading</>
}

export default Home
