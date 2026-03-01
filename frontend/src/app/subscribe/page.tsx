"use client";
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { payment_service } from '@/context/AppContext';
import toast from 'react-hot-toast';
import Loading from '@/components/loading';
import { Card } from '@/components/ui/card';
import { CheckCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SubscriptionPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handleSubscribe = async()=>{
    const token = Cookies.get("token");
    setLoading(true);
    try {
      const {data} = await axios.post(
        `${payment_service}/api/payment/checkout`, 
        { amount: 200 },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setPaymentUrl(data.url);
    } catch(error: any) {
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

  useEffect(()=>{
    if (paymentUrl) {
      router.push(paymentUrl);
    }
  }, [paymentUrl])

  if (loading) return <Loading/>
  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-secondary/30'>
      <Card className='max-w-md w-full p-8 text-center shadow-lg border-2'>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
          <Crown size={32} className='text-blue-600'/>
        </div>
        <h1 className='text-3xl font-bold mb-2'>Premium Subscription</h1>
        <p className="text-sm opacity-70 mb-6">Boost your job search</p>
        <div className="mb-6">
          <p className="text-5xl font-bold text-blue-600">₹ 119</p>
          <p className="text-sm opacity-60 mt-1">Per month</p>
        </div>

        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className='text-gray-600 shrink-0 mt-0.5'/>
            <p className="text-sm">Your application will be shown first to recruiters</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className='text-gray-600 shrink-0 mt-0.5'/>
            <p className="text-sm">Priority support</p>
          </div>
        </div>

        <Button className='w-full h-12 text-base gap-2' onClick={handleSubscribe}>
          <Crown size={18}/>Subscribe Now
        </Button>
      </Card>
    </div>
  )
}

export default SubscriptionPage
