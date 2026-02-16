import { TrendingUp } from 'lucide-react'
import React from 'react'

const Hero = () => {
  return (
    <section className='relative overflow-hidden bg-secondary'>
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl'></div>
        <div className='absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl'></div>
      </div>

      <div className="container mx-auto px-5 py-16 md:py-24 relative">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 backdrop-blue-sm">
              <TrendingUp size={16} className='text-blue-600'/>
              <span className='text-sm font-medium'>#1 Job Platform in india</span>
            </div>
            
            {/* main heading */}
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
              Find your dream job at{" "} 
              <span className='inline-block'>Hire</span> 
              <span className='text-red-500'>Heaven</span>
            </h1>

            {/* description */}
            <p className="text-lg md:text-xl leading-relaxed opacity-80 max-w-2xl">
              Connect with top employers and discover opportunities that match your skill. Wheather you're a job seeker
              or recruiter, we've got you covered with powerful tools and seamless experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
