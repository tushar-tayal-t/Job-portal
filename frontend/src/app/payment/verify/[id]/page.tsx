"use client"
import Loading from '@/components/loading';
import { Card } from '@/components/ui/card';
import { payment_service, useAppData } from '@/context/AppContext';
import axios from 'axios';
import { CheckCircle, CircleAlert } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const PaymentVerification = () => {
  const {id} = useParams();
  const {setUser} = useAppData();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentIntent, setPaymentIntent] = useState("");
  
  const token = Cookies.get("token");

  useEffect(()=>{
    async function verifyPayment() {
      if (id === '0') {
        setIsVerified(false);
        setLoading(false);
        return;
      }
      try {
        const {data} = await axios.post(
          `${payment_service}/api/payment/verify`,
          {
            id 
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setIsVerified(true);
        toast.success(data.message);
        setPaymentIntent(data.paymentIntent);
        if (data.updatedUser) {
          setUser(data.updatedUser);
        }
      } catch(error:any) {
        if (error.response?.data?.message) {
          toast.error(error.response?.data?.message);
        } else if(error.message) {
          toast.error(error.message);
        } else {
          toast.error("Server error");
        }
      } finally {
        setLoading(false);
      }
    }
    verifyPayment();
  }, []);

  if (loading) return <Loading/>
  
  if (!isVerified) return (
    <>
      <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-secondary/30'>
        <Card className='max-w-md w-full p-8 text-center shadow-lg border-2'>
          <div className='flex items-center justify-center gap-4'>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <CircleAlert size={40} className='text-red-600'/>
            </div>
            <h1 className='text-3xl font-bold mb-2'>
              Payment Failed!
            </h1>
          </div>
          <p className="text-base opacity-70 mb-8">Transition failed. Please try again.</p>
          <Link href={'/account'} className='bg-blue-500 hover:bg-blue-600 text-white transition-all duration-800 p-4 rounded-full text-center'>Go to account page</Link>
        </Card>
      </div>
    </>
  );

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-secondary/30'>
      <Card className='max-w-md w-full p-8 text-center shadow-lg border-2'>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle size={40} className='text-green-600'/>
        </div>
        <h1 className='text-3xl font-bold mb-2'>
          Payment Successfully!
        </h1>
        <p className="text-base opacity-70 mb-8">Your Subscription is now active. Your transaction id is {paymentIntent}</p>
        <Link className='bg-blue-500 hover:bg-blue-600 text-white transition-all duration-800 p-4 rounded-full text-center' href={'/account'}>Go to account page</Link>
      </Card>
    </div>
  )
}

export default PaymentVerification

