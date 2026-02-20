"use client";
import { Button } from "@/components/ui/button"
import Hero from '@/components/hero'
import CareerGuide from '@/components/career-guide'
import ResumeAnalyzer from '@/components/resume-analyser'
import { useAppData } from '@/context/AppContext'
import Loading from '@/components/loading'

const Home = () => {
  const {loading} = useAppData();
  
  if (loading) return <Loading/>

  return (
    <div>
      <Hero/>
      <CareerGuide/>
      <ResumeAnalyzer/>
    </div>
  )
}

export default Home
