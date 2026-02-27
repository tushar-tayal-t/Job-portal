"use client"
import { useParams } from 'next/navigation'
import Cookies from 'js-cookie'
import React, { useEffect, useRef, useState } from 'react'
import { job_service, useAppData } from '@/context/AppContext'
import { Company, Job } from '@/types'
import axios from 'axios'
import toast from 'react-hot-toast'
import Loading from '@/components/loading'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Briefcase, Building2, CheckCircle, Clock, DollarSign, Eye, FileText, Globe, Laptop, MapPin, Pencil, Plus, Trash2, Users, XCircle } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CompanyPage = () => {
  const {id} = useParams();
  const token = Cookies.get("token");
  const {user, isAuth} = useAppData();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [isUpdatedModalOpen, setIsUpdatedModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [openings, setOpenings] = useState("");
  const [jobType, setJobType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const addModalRef = useRef<HTMLButtonElement>(null);
  const updateModalRef = useRef<HTMLButtonElement>(null);

  async function fetchCompany() {
    try {
      setLoading(true);
      const {data} = await axios.get(`${job_service}/api/job/company/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCompany(data);
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

  const clearInput = () => {
    setTitle("");
    setDescription("");
    setRole("");
    setSalary("");
    setLocation("");
    setOpenings("");
    setJobType("");
    setWorkLocation("");
    setIsActive(true);
  }

  const addJobHandler = async() => {
    setBtnLoading(true);
    try {
      const jobData = {
        title,
        description,
        role,
        salary: Number(salary),
        location,
        openings: Number(openings),
        job_type: jobType,
        work_location: workLocation,
        company_id: id,
      };

      const {data} = await axios.post(`${job_service}/api/job/new`, jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(data.message);
      fetchCompany();
      clearInput();
      addModalRef.current?.click();
    } catch(error:any) {
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

  const deleteJobHandler = async(jobId: number) => {
    if (confirm("Are you sure you want to delete this job?")) {
      setBtnLoading(true);
      try {
        await axios.delete(`${job_service}/api/job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Job has been deleted");
        fetchCompany();
      } catch(error:any) {
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
  }

  useEffect(()=>{
    fetchCompany();
  }, [id]);

  if (loading) return <Loading/>

  const handleOpenUpdateModal = (job: Job) => {
    setSelectedJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setRole(job.role);
    setSalary(String(job.salary) || "");
    setLocation(job.location || "");
    setOpenings(String(job.openings) || "");
    setJobType(job.job_type);
    setWorkLocation(job.work_location);
    setIsActive(job.is_active);
    setIsUpdatedModalOpen(true);
  }

  const handleCloseUpdateModal = () => {
    setIsUpdatedModalOpen(false);
    setSelectedJob(null);
    clearInput();
  }

  const updateJobHandler = async() => {
    if (!selectedJob) return;
    setBtnLoading(true);
    try {
      const updateData = {
        title,
        description,
        role,
        salary: Number(salary),
        location,
        openings: Number(openings),
        job_type: jobType,
        work_location: workLocation,
        company_id: id,
        is_active: isActive
      };
      const {data} = await axios.put(
        `${job_service}/api/job/${selectedJob.job_id}`, 
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success("Job updated successfully");
      fetchCompany();
      handleCloseUpdateModal();
    } catch (error: any) {
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

  const isRecruiterOwner = (
    user && 
    company && 
    user.user_id === company.recruiter_id
  );

  return (
    <div className='min-h-screen bg-secondary/30'>
      {company && (
        <div className='max-w-6xl mx-auto px-4 py-8'>
          <Card className='overflow-hidden shadow-lg border-2 mb-8'>
            <div className="h-32 bg-blue-600"></div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
                <div className="w-32 h-32 rounded-2xl border-4 border-background overflow-hidden shadow-xl bg-background shrink-0">
                  <img src={company.logo} alt="Logo" className='w-full h-full object-cover' />
                </div>
                <div className="flex-1 mb:mb-4">
                  <h1 className='text-3xl font-bold mb-2'>
                    {company.name}
                  </h1>
                  <p className="text-base leading-relaxed opacity-80 max-w-3xl">
                    {company.description}
                  </p>
                </div>
                <Link href={company.website} target='_blank' className='md:mb-4'>
                  <Button className='gap-2'><Globe size={18}/>Visit Website</Button>
                </Link>
              </div>
            </div>

          </Card>

          <Dialog>
            {/* Job section */}
            <Card className='shadow-lg border-2 overflow-hidden'>
              <div className="bg-blue-600 border-b p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Briefcase size={20} className='text-blue-600'/>
                    </div>
                  </div>
                  <h2 className='text-2xl font-bold text-white'>Open Positions</h2>
                  <p className='text-sm opacity-70 text-white'>
                    {company.jobs?.length || 0}{" "}Active Job
                    {(company.jobs?.length ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {isRecruiterOwner && <>
                <DialogTrigger asChild>
                  <Button className='gap-2'>
                    <Plus size={18}/>Post New Job
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-150 max-h-[90vh] overflow-y-auto'>
                  <DialogHeader>
                    <DialogTitle className='text-2xl flex items-center gap-2'>
                      Post a new Job
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 py-4">
                    <div className='space-y-2'>
                      <Label htmlFor='title' className='text-sm font-medium flex items-center gap-2'>
                        <Briefcase size={16}/> Job Title
                      </Label>
                      <Input 
                        id='title' 
                        type='text' 
                        placeholder='Enter job title' 
                        className='h-11' 
                        value={title} 
                        onChange={(e)=>setTitle(e.target.value)}/>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='description' className='text-sm font-medium flex items-center gap-2'>
                        <FileText size={16}/> Description
                      </Label>
                      <Input 
                        id='description' 
                        type='text' 
                        placeholder='Enter description' 
                        className='h-11' 
                        value={description} 
                        onChange={(e)=>setDescription(e.target.value)}/>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='role' className='text-sm font-medium flex items-center gap-2'>
                        <Building2 size={16}/> Role/Department
                      </Label>
                      <Input 
                        id='role' 
                        type='text' 
                        placeholder='Enter job role' 
                        className='h-11' 
                        value={role} 
                        onChange={(e)=>setRole(e.target.value)}/>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='salary' className='text-sm font-medium flex items-center gap-2'>
                        <DollarSign size={16}/> Salary
                      </Label>
                      <Input 
                        id='salary' 
                        type='number' 
                        placeholder='Enter salary'
                        value={salary}
                        className='h-11 cursor-pointer' 
                        onChange={(e) => setSalary(e?.target?.value)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='openings' className='text-sm font-medium flex items-center gap-2'>
                        <Users size={16}/> Openings
                      </Label>
                      <Input 
                        id='openings' 
                        type='number' 
                        placeholder='Eg. 5'
                        value={openings}
                        className='h-11 cursor-pointer' 
                        onChange={(e) => setOpenings(e?.target?.value)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='location' className='text-sm font-medium flex items-center gap-2'>
                        <MapPin size={16}/> Location
                      </Label>
                      <Input 
                        id='location' 
                        type='text' 
                        placeholder='Enter location'
                        value={location}
                        className='h-11 cursor-pointer' 
                        onChange={(e) => setLocation(e?.target?.value)}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor='jobType' className='text-sm font-medium flex items-center gap-2'>
                          <Clock size={16}/> Job Type
                        </Label>
                        <Select value={jobType} onValueChange={setJobType}>
                          <SelectTrigger className='h-11'>
                            <SelectValue placeholder="Select Job Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='Full-time'>Full-time</SelectItem>
                              <SelectItem value='Part-time'>Part-time</SelectItem>
                              <SelectItem value='Contract'>Contract</SelectItem>
                              <SelectItem value='Internship'>Internship</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor='worklocation' className='text-sm font-medium flex items-center gap-2'>
                          <Laptop size={16}/> Work Location
                        </Label>
                        <Select value={workLocation} onValueChange={setWorkLocation}>
                          <SelectTrigger className='h-11'>
                            <SelectValue placeholder="Select Work Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value='On-site'>On-site</SelectItem>
                              <SelectItem value='Remote'>Remote</SelectItem>
                              <SelectItem value='Hybrid'>Hybrid</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button ref={addModalRef} variant={"outline"}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button className='gap-2' disabled={btnLoading} onClick={addJobHandler}>
                      {btnLoading ? "Posting Job..." : "Post Job"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </>}
              <div className="p-6">
                {(company.jobs && company.jobs.length > 0) ? (
                  <div className="space-y-4">
                    {company.jobs.map((j)=>(
                      <div key={j.job_id} className='p-5 rounded-lg border-2 hover:border-blue-500 transition-all bg-background'>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h1 className="text-xl font-semibold">
                                {j.title}
                              </h1>
                              <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${j.is_active ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}>
                                {j.is_active ? <CheckCircle size={14}/>: <XCircle size={14}/>}
                                {j.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                              <div className="flex items-center gap-2 opacity-70 ">
                                <Building2 size={16}/>
                                <span>{j.role}</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-70">
                                <DollarSign size={16}/>
                                <span>
                                  {j.salary ? `$${j.salary.toLocaleString()}` : "Not Disclosed"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 opacity-70">
                                <MapPin size={16}/>
                                <span>{j.location}</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-70">
                                <Laptop size={16}/>
                                <span>{j.work_location} ({j.job_type})</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-70">
                                <Users size={16}/>
                                <span>{j.openings} openings</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/jobs/${j.job_id}`}>
                              <Button variant={"outline"} size={"sm"} className='gap-2'>
                                <Eye size={16}/> View
                              </Button>
                            </Link>
                            {
                              isRecruiterOwner && <>
                                <Button onClick={()=>handleOpenUpdateModal(j)} variant={"outline"} className='gap-2' size={"sm"}>
                                  <Pencil size={16}/> Edit
                                </Button>
                              </>
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <Briefcase size={32} className='opacity-40'/>
                      </div>
                      <p className='text-base opacity-70 mb-2'>No Jobs posted yet</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </Dialog>

          <Dialog open={isUpdatedModalOpen} onOpenChange={setIsUpdatedModalOpen}>
            <DialogContent className='sm:max-w-150 max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle className='text-2xl flex items-center gap-2'>
                  Update Job
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className='space-y-2'>
                  <Label htmlFor='title' className='text-sm font-medium flex items-center gap-2'>
                    <Briefcase size={16}/> Job Title
                  </Label>
                  <Input 
                    id='title' 
                    type='text' 
                    placeholder='Enter job title' 
                    className='h-11' 
                    value={title} 
                    onChange={(e)=>setTitle(e.target.value)}/>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description' className='text-sm font-medium flex items-center gap-2'>
                    <FileText size={16}/> Description
                  </Label>
                  <Input 
                    id='description' 
                    type='text' 
                    placeholder='Enter description' 
                    className='h-11' 
                    value={description} 
                    onChange={(e)=>setDescription(e.target.value)}/>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='role' className='text-sm font-medium flex items-center gap-2'>
                    <Building2 size={16}/> Role/Department
                  </Label>
                  <Input 
                    id='role' 
                    type='text' 
                    placeholder='Enter job role' 
                    className='h-11' 
                    value={role} 
                    onChange={(e)=>setRole(e.target.value)}/>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='salary' className='text-sm font-medium flex items-center gap-2'>
                    <DollarSign size={16}/> Salary
                  </Label>
                  <Input 
                    id='salary' 
                    type='number' 
                    placeholder='Enter salary'
                    value={salary}
                    className='h-11 cursor-pointer' 
                    onChange={(e) => setSalary(e?.target?.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='openings' className='text-sm font-medium flex items-center gap-2'>
                    <Users size={16}/> Openings
                  </Label>
                  <Input 
                    id='openings' 
                    type='number' 
                    placeholder='Eg. 5'
                    value={openings}
                    className='h-11 cursor-pointer' 
                    onChange={(e) => setOpenings(e?.target?.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='location' className='text-sm font-medium flex items-center gap-2'>
                    <MapPin size={16}/> Location
                  </Label>
                  <Input 
                    id='location' 
                    type='text' 
                    placeholder='Enter location'
                    value={location}
                    className='h-11 cursor-pointer' 
                    onChange={(e) => setLocation(e?.target?.value)}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor='jobType' className='text-sm font-medium flex items-center gap-2'>
                      <Clock size={16}/> Job Type
                    </Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className='h-11'>
                        <SelectValue placeholder="Select Job Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='Full-time'>Full-time</SelectItem>
                          <SelectItem value='Part-time'>Part-time</SelectItem>
                          <SelectItem value='Contract'>Contract</SelectItem>
                          <SelectItem value='Internship'>Internship</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor='worklocation' className='text-sm font-medium flex items-center gap-2'>
                      <Laptop size={16}/> Work Location
                    </Label>
                    <Select value={workLocation} onValueChange={setWorkLocation}>
                      <SelectTrigger className='h-11'>
                        <SelectValue placeholder="Select Work Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='On-site'>On-site</SelectItem>
                          <SelectItem value='Remote'>Remote</SelectItem>
                          <SelectItem value='Hybrid'>Hybrid</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor='updateIsActive' className='text-sm font-medium flex items-center gap-2'>
                      {isActive ? (
                        <CheckCircle size={16} className='text-green-600'/>
                      ) : (
                        <XCircle size={16} className='text-gray-500'/>
                      )}
                      <Select value={isActive ? "true" : "false"} onValueChange={(value)=>setIsActive(value === "true")}>
                        <SelectTrigger className='h-11'>
                          <SelectValue placeholder="select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='true'>Active</SelectItem>
                            <SelectItem value='false'>Inactive</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button ref={addModalRef} variant={"outline"}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button className='gap-2' disabled={btnLoading} onClick={updateJobHandler}>
                  {btnLoading ? "Updating Job..." : "Update Job"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}

export default CompanyPage
