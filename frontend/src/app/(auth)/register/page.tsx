"use client";
import { auth_service, useAppData } from '@/context/AppContext';
import axios from 'axios';
import { redirect } from 'next/navigation';
import { ChangeEvent, useState } from 'react'
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Label } from '@/components/ui/label';
import { ArrowRight, Briefcase, File, Info, Loader2, Lock, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loading from '@/components/loading';
import { useForm } from 'react-hook-form';

type FormData = {
  name: string;
  email: string;
  password: string;
  phone: number;
  bio: string;
}

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors }} = useForm<FormData>();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [eye, setEye] = useState(false);

  const {isAuth, setUser, loading, setIsAuth} = useAppData();
  
  if (isAuth) redirect('/');

  if (loading) return <Loading/>

  const submitHandler = async(data: FormData) => {
    const {name, email, phone, password, bio } = data;
    setBtnLoading(true);
    const formData = new FormData();
    formData.append('role', role);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phoneNumber', phone.toString());

    if (role === 'jobseeker') {
      formData.append('bio', bio);
      if (resume) {
        formData.append('file', resume);
      }
    }

    try {
      const {data} = await axios.post(`${auth_service}/api/auth/register`, formData);
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: true,
        path: "/"
      });
      setUser(data.registerdUser);
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
          <h1 className='text-4xl font-bold mb-2'>Join JobsPortal</h1>
          <p className="text-sm opacity-70">Create your account to start a new journey</p>
        </div>
        <div className='border border-gray-400 rounded-2xl p-8 shadow-lg backdrop-blur-sm'>
          <form onSubmit={handleSubmit(submitHandler)} className='space-y-5'>
            <div className="space-y-2">
              <Label htmlFor='role' className='text-sm font-medium'>I want to</Label>
              <div className="relative">
                <Briefcase className='icon-style'/>
                <select 
                  id="role" 
                  value={role} 
                  onChange={(e:ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                  className='w-full h-11 pl-10 pr-4 border-2 border-gray-300 rounded-md bg-transparent'
                  required
                >
                  <option value="">Select your role</option>
                  <option value="jobseeker">Find a Job</option>
                  <option value="recruiter">Hire Talent</option>
                </select>
              </div>
            </div>

            {role && <div className='space-y-5 animate-in fade-in duration-300'>
              <div className="space-y-2">
                <Label htmlFor='name' className='text-sm font-medium'>Full Name</Label>
                <div className="relative">
                  <Mail className='icon-style'/>
                  <Input 
                    id='name' 
                    type='text' 
                    placeholder='John Doe' 
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Username must be at least 2 characters"
                      }
                    })}
                    className='pl-10 h-11'
                  />
                </div>
                {errors.name && <p className='text-red-400'>{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor='email' className='text-sm font-medium'>Email Address</Label>
                <div className="relative">
                  <Mail className='icon-style'/>
                  <Input 
                    id='email' 
                    type='email' 
                    placeholder='you@example.com' 
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Invalid email format"
                      }
                    })}
                    className='pl-10 h-11'
                  />
                </div>
                {errors.email && <p className='text-red-400'>{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor='password' className='text-sm font-medium'>Password</Label>
                <div className="relative">
                  <Lock className='icon-style'/>
                  <Input 
                    id='password' 
                    type={eye ? 'text' : 'password'} 
                    placeholder='*******' 
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be 8 characters long",
                      }
                    })}
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
                {errors.password && <p className='text-red-400'>{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor='phone' className='text-sm font-medium'>Phone Number</Label>
                <div className="relative">
                  <Phone className='icon-style'/>
                  <Input 
                    id='phone' 
                    type='number' 
                    placeholder='1234567890' 
                    {...register("phone", {
                      required: "Phone number is required",
                      minLength: {
                        value: 10,
                        message: "Please enter the valid phone number",
                      }
                    })}
                    className='pl-10 h-11'
                  />
                </div>
                {errors.phone && <p className='text-red-400'>{errors.phone.message}</p>}
              </div>

              {
                role === 'jobseeker' && <div className="space-y-5 pt-4 border-t border-gray-400">
                  <div className="space-y-2">
                    <Label htmlFor='resume' className='text-sm font-medium'>Resume (PDF)</Label>
                    <div className="relative">
                      {/* <File className='icon-style'/> */}
                      <Input 
                        id='resume' 
                        type='file' 
                        accept='application/pdf'
                        onChange={
                          (e)=>{
                            if (e.target.files && e.target.files[0]) {
                              setResume(e.target.files[0]);
                            }
                          }
                        }
                        className='h-11 cursor-pointer'
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor='bio' className='text-sm font-medium'>Bio</Label>
                    <div className="relative">
                      <Info className='icon-style'/>
                      <Input 
                        id='bio' 
                        type='text' 
                        placeholder='Tell us About yourself' 
                        {...register("bio", {
                          required: "Bio is required",
                        })}
                        className='pl-10 h-11'
                      />
                    </div>
                    {errors.bio && <p className='text-red-400'>{errors.bio.message}</p>}
                  </div>
                </div>
              }

              <Button disabled={btnLoading} className='w-full'>
                {btnLoading ? (
                  <>
                    <Loader2 size={18} className='animate-spin'/> Please Wait...
                  </>
                ) : "Register"}
                <ArrowRight size={18} />
              </Button>
            </div>}

          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm">
              Already have an account? {" "} 
              <Link href={'/login'} className='text-blue-500 font-medium hover:underline transition-all'>
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
