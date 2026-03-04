"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth_service, useAppData } from '@/context/AppContext';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';
import React, { SubmitEvent, useState } from 'react'
import toast from 'react-hot-toast';

const ResetPage = () => {
  const {token} = useParams();
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  
  const submitHandler = async(e: SubmitEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setBtnLoading(true);
    try {
      const {data} = await axios.post(`${auth_service}/api/auth/reset/${token}`, {
        password
      });
      toast.success(data.message);
      setPassword("");
    } catch(error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response?.data?.message);
      } else if(error.message) {
        toast.error(error.message);
      } else {
        toast.error("Server error");
      }
    } finally {
      setBtnLoading(false);
    }
  }
  return (
    <div className='mt-20 md:mt-5 z-0'>
      <div className='md:w-1/3 border border-gray-400 rounded-lg p-8 flex flex-col w-full relative shadow-md mx-auto'>
      <h2 className='mb-1'>
        <span className='text-3xl'>Reset Password</span>
      </h2>
      <form className='flex flex-col justify-between mt-3' onSubmit={submitHandler}>
        <div className="grid w-full max-w-sm items-center gap-1.5 ml-1">
          <Label>Password</Label>
          <Input 
            type='password' 
            placeholder='Password' 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required
          />
          <Button disabled={btnLoading} className='flex items-center justify-center gap-2'>
            {btnLoading && <Loader2 size={18} className='animate-spin'/>}
            Submit
          </Button>
        </div>
      </form>
      <Link className='mt-2 text-blue-500 underline text-sm ml-2' href={"/login"}>
        Go to login page
      </Link>
      </div>
    </div>
  )
}

export default ResetPage;
