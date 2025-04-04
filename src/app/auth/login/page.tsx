"use client"
import { Button } from '@/components/ui/button'
import { generateAndStoreMockToken } from '@/data/actions/authAction';
import Link from 'next/link';
import React, { useState } from 'react'

const page = () => {
const [message,setMessage] = useState("")
    const handleGenerateToken = async () =>{
       const message = await generateAndStoreMockToken()
       setMessage(message.success)
       

    }
  return (
    <div className="w-full h-full flex justify-center items-center flex-col gap-4">
      <Button
        onClick={handleGenerateToken}
        className="px-4 py-2 bg-blue-500 hover:text-blue-400 rounded"
      >
        Generate Mock Token
      </Button>

      <p>{message}</p>
      <Link href={"/"}>back to home </Link>
    </div>
  );
}

export default page