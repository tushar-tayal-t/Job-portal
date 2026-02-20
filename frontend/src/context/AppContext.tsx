"use client";

import { AppContextType, AppProviderProps, User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

export const utils_service = `http://localhost:5001`;
export const auth_service = `http://localhost:5000`;
export const user_service = `http://localhost:5002`;
export const job_service = `http://localhost:5003`;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(true);

  const token = Cookies.get("token");

  async function fetchUser() {
    try {
      const {data} = await axios.get(`${user_service}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setIsAuth(true);
      setUser(data);
    } catch(error) {
      console.error(error);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfilePic(formData:any) {
    setLoading(true);
    try {
      const {data} = await axios.put(`${user_service}/api/user/update/pic`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      toast.success(data.message);
      fetchUser();
    } catch(error:any) {
      if (error.response?.data?.message) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function logoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out successfully");
  }

  useEffect(()=>{
    if (Cookies.get("token")) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);
  return (
    <AppContext.Provider 
      value={{
        btnLoading, 
        user, 
        isAuth, 
        loading, 
        setUser, 
        setIsAuth, 
        setLoading,
        logoutUser,
        updateProfilePic
      }}
    >
      {children}
      <Toaster/>
    </AppContext.Provider>
  )
}

export const useAppData = ():AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider")
  }
  return context;
}