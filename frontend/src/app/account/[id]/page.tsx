"use client";

import { user_service } from "@/context/AppContext";
import { User } from "@/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "@/components/loading";
import Info from "../components/info";

const UserAccount = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const {id} = useParams();

  async function fetchUser() {
    try {
      const {data} = await axios.get(`${user_service}/api/user/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`
        }
      });
      setUser(data);
    } catch(error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
    if (Cookies.get("token")) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <Loading/>
  
  return (<>
      {user && 
        <div className="w-[90%] md:w-[60%] m-auto">
          <Info user={user} isYourAccount={false}/>
        </div>
      }
    </>
  )
}

export default UserAccount
