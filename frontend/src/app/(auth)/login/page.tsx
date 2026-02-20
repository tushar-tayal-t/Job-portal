"use client";
import { auth_service, useAppData } from '@/context/AppContext';
import axios from 'axios';
import { redirect } from 'next/navigation';
import { useState } from 'react'
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loading from '@/components/loading';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [eye, setEye] = useState(false);

  const {isAuth, setUser, loading, setIsAuth} = useAppData();

  if (loading) return <Loading/>
  
  if (isAuth) redirect('/');

  const submitHandler = async(e:React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const {data} = await axios.post(`${auth_service}/api/auth/login`, {
        email,
        password
      });
      
      toast.success(data.message);

      Cookies.set("token", data.token, {
        expires: 15,
        secure: true,
        path: "/"
      });
      setUser(data.userObject);
      setIsAuth(true);
    } catch (error: any) {
      if (error?.response?.data) {
        toast.error(error?.response?.data?.message)
      } else {
        toast.error(error?.message)
      }
      setIsAuth(false);
    } finally {
      setBtnLoading(false);
    }
  }
  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12'>
      <div className="w-full max-w-md">
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold mb-2'>Welcome back to HireHeaven</h1>
          <p className="text-sm opacity-70">Sign in to continue your journey</p>
        </div>
        <div className='border border-gray-400 rounded-2xl p-8 shadow-lg backdrop-blur-sm'>
          <form onSubmit={submitHandler} className='space-y-5'>
            <div className="space-y-2">
              <Label htmlFor='email' className='text-sm font-medium'>Email Address</Label>
              <div className="relative">
                <Mail className='icon-style'/>
                <Input 
                  id='email' 
                  type='email' 
                  placeholder='you@example.com' 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className='pl-10 h-11'
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor='password' className='text-sm font-medium'>Password</Label>
              <div className="relative">
                <Lock className='icon-style'/>
                <Input 
                  id='password' 
                  type={eye ? 'text' : 'password'} 
                  placeholder='*******' 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className='pl-10 h-11'
                />
                <button 
                  className='absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50 cursor-pointer' 
                  onClick={(e)=>{e.preventDefault();setEye(!eye);}}>
                  {!eye ? (
                    <img 
                    src="/openeye.svg" 
                    alt="Eye"/>
                  ) : (
                    <img 
                    src="/closeeye.svg" 
                    alt="Eye"/>
                  )}
                </button>
              </div>
            </div>

            <div className='flex items-center justify-end'>
              <Link 
                href={'/forgot'} 
                className='text-sm text-blue-500 hover-underline transition-all'
              >Forget Password?</Link>
            </div>

            <Button disabled={btnLoading} className='w-full'>
              {btnLoading ? "Signing in..." : "Sign In"}
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm">
              Don't have an account? {" "} 
              <Link href={'/register'} className='text-blue-500 font-medium hover:underline transition-all'>
                Create a new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
