import { useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { enterApp, type initialRespType } from "../app/functions/auth";
import axios from 'axios'

const api = import.meta.env.VITE_API

const Auth = ({ children }: { children: ReactNode }) => {
  const disp = useAppDispatch();
  const router = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)

  const checkLogIn = async () => {
    try {
      interface RegisterResponse {
        data: {
          User: initialRespType
        };
      }
      const resp = await axios.post<RegisterResponse>(`${api}/user/check-user-already-loggedin`,
        { withCredentials: true }
      );
      console.log(`logged in: ${JSON.stringify(resp, null, 2)}`);
      disp(enterApp({ userData: resp.data.data.User }))

      router('/')

    } catch (error) {
      console.log(`not logged in: ${error}`);
      router('/login')
    }
  };


  useEffect(() => {
    if (!isLoggedIn) {
      checkLogIn()
    }
  }, [])

  return (
    <>
      {
        children
      }
    </>
  )
}

export const RevAuth = ({ children }: { children: ReactNode }) => {
  const disp = useAppDispatch();
  const router = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)

  const checkLogIn = async () => {
    try {
      interface RegisterResponse {
        data: {
          User: initialRespType
        };
      }
      const resp = await axios.post<RegisterResponse>(`${api}/user/check-user-already-loggedin`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      disp(enterApp({ userData: resp.data.data.User }))

      router('/')

    } catch (error) {
      console.log(`not logged in: ${error}`);
    }
  };


  useEffect(() => {
    if (isLoggedIn) {
      router('/')
    } else {
      checkLogIn()
    }
  }, [])

  return (
    <>
      {
        children
      }
    </>
  )
}

export default Auth