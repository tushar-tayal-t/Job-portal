"use client";

import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import Info from "./components/info";
import Skills from "./components/skills";
import Company from "./components/company";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AccountPage = () => {
  const {isAuth, loading, user} = useAppData();
  const router = useRouter();

  useEffect(()=>{
    if (!isAuth && !loading) router.push('/');
  }, [isAuth, loading]);

  if (loading) return <Loading/>
  
  return (<>
      {user && 
        <div className="w-[90%] md:w-[60%] m-auto">
          <Info user={user} isYourAccount={true}/>
          {user.role === "jobseeker" && (
            <Skills user={user} isYourAccount={true}/>
          )}
          {user.role === "recruiter" && (
            <Company/>
          )}
        </div>
      }
    </> 
  )
}

export default AccountPage
