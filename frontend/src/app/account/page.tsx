"use client";

import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import Info from "./components/info";
import Skills from "./components/skills";

const AccountPage = () => {
  const {isAuth, loading, user} = useAppData();

  if (loading) return <Loading/>
  return (<>
      {user && 
        <div className="w-[90%] md:w-[60%] m-auto">
          <Info user={user} isYourAccount={true}/>
          {
            user.role === "jobseeker" && <Skills user={user} isYourAccount={true}/>
          }
        </div>
      }
    </> 
  )
}

export default AccountPage
