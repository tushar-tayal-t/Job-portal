import { Button } from "@/components/ui/button"; 
import Link from "next/link"; 
import { ArrowRight } from "lucide-react"; 
 
const About = () => { 
  return ( 
    <div className="min-h-screen"> 
      {/* Mission Section */} 
      <section className="container mx-auto px-4 py-12 md:py-16"> 
        <div className="max-w-4xl mx-auto"> 
          {/* Image */} 
          <div className="flex justify-center mb-8"> 
            <img 
              src="/about.png" 
              className="w-full max-w-125 rounded-2xl shadow-lg" 
              alt="About HireHeaven" 
            /> 
          </div> 
 
          {/* Content */} 
          <div className="text-center space-y-6"> 
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold"> 
              Our Mission At 
              <span className='text-orange-400'> Jobs</span> 
              <span className='text-blue-900'> Portal</span>
            </h1> 
 
            <p 
              className="text-lg md:text-xl leading-relaxed opacity-90 max-w-3xl mx-auto" 
            > 
              At JobsPortal, we're dedicated to revolutionizing the job search 
              experience. Our mission is to create meaningful connections 
              between talented individuals and forward-thinking companies, 
              fostering growth and success for both. 
            </p> 
          </div> 
        </div> 
      </section> 
 
      {/* CTA Section */} 
      <section className="py-16 md:py-20 bg-secondary"> 
        <div className="container mx-auto px-4"> 
          <div className="max-w-3xl mx-auto text-center space-y-6"> 
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold"> 
              Ready to find your dream job? 
            </h2> 
            <p className="text-lg md:text-xl opacity-80"> 
              Join thousands of successful job seekers on HireHeaven 
            </p> 
            <div className="pt-4"> 
              <Link href="/jobs"> 
                <Button size="lg" className="gap-2 h-12 px-8 text-base"> 
                  Get Started 
                  <ArrowRight size={18} /> 
                </Button> 
              </Link> 
            </div> 
          </div> 
        </div> 
      </section> 
    </div> 
  ); 
}; 
 
export default About;