import { useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { enterApp, type initialRespType } from "../app/functions/auth";
import axios from 'axios'

const api = import.meta.env.VITE_API

interface formDataTypes {
  latitude: string;
  longitude: string;
}

const Auth = ({ children }: { children: ReactNode }) => {
  const disp = useAppDispatch();
  const router = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
  const [formData, setFormData] = useState<formDataTypes>(
    {
      latitude: '',
      longitude: ''
    }
  )


  const checkLogIn = async () => {
    try {
      interface RegisterResponse {
        data: {
          User: initialRespType
          accessToken: string;
        };
      }

      const resp = await axios.post<RegisterResponse>(`${api}/user/check-user-already-loggedin`,
        formData,
        { withCredentials: true }
      );
      // console.log(`logged in: ${JSON.stringify(resp, null, 2)}`);
      disp(enterApp({ userData: resp.data.data.User }))
      window.localStorage.setItem("accessToken", resp.data.data.accessToken)
      setFormData({ latitude: '', longitude: '' })
      router('/')

    } catch (error) {
      console.log(`not logged in: ${error}`);
      router('/login')
    }
  };

  useEffect(() => {
    if (!isLoggedIn && formData.latitude) {
      console.log('called first');

      checkLogIn()
    }
  }, [formData, setFormData])

  useEffect(() => {

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('getting locaiton')
        setFormData({
          ...formData,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude)
        })
      },
    )
    // Disable in Production
    if (!formData.latitude) {
      console.log('offline');

      // setFormData({
      //   ...formData,
      //   latitude: "Not given",
      //   longitude: "Not given",
      // })
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
  const [formData, setFormData] = useState<formDataTypes>(
    {
      latitude: '',
      longitude: ''
    }
  )

  const checkLogIn = async () => {
    try {
      interface RegisterResponse {
        data: {
          User: initialRespType;
          accessToken: string;
        };
      }
      const resp = await axios.post<RegisterResponse>(`${api}/user/check-user-already-loggedin`,
        { ...formData },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      disp(enterApp({ userData: resp.data.data.User }))
      window.localStorage.setItem("accessToken", resp.data.data.accessToken)
      router('/')

    } catch (error) {
      console.log(`not logged in: ${error}`);
    }
  };

  useEffect(() => {
    // console.log('md called');

    if (isLoggedIn) {
      router('/')
    } else {
      if (formData.latitude) {
        console.log('called second');
        checkLogIn()
      }
    }

  }, [formData, setFormData])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude)
        })
      }
    )
    // Disable in Production
    if (!formData.latitude) {
      // setFormData({
      //   ...formData,
      //   latitude: "Not given",
      //   longitude: "Not given",
      // })
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