"use client";

import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import Info from "./components/info";
import Skills from "./components/skills";
import Company from "./components/company";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppliedJobs from "./components/appliedJobs";

const AccountPage = () => {
  const {isAuth, loading, user, applications} = useAppData();
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
          {
            user.role === "jobseeker" && (
              <AppliedJobs application={applications}/>
            )
          }
          {user.role === "recruiter" && (
            <Company/>
          )}
        </div>
      }
    </> 
  )
}

export default AccountPage
