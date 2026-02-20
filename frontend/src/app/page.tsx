import React from 'react'
import { Button } from "@/components/ui/button"
import Hero from '@/components/hero'
import CareerGuide from '@/components/career-guide'
import ResumeAnalyzer from '@/components/resume-analyser'
const Home = () => {
  return (
    <div>
      <Hero/>
      <CareerGuide/>
      <ResumeAnalyzer/>
    </div>
  )
}

export default Home
