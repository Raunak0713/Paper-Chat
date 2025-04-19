'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useClerk } from '@clerk/nextjs'
import { UploadButton } from "@/utils/uploadThing"

const DashboardPage = () => {
  const router = useRouter()
  const { user } = useClerk()
  const [files, setFiles] = useState<any[]>([])
  const saveFile = useMutation(api.file.saveFile)

  const fileData = useQuery(
    api.user.getAllFilesOfUser, 
    user?.id ? { clerkId: user.id } : "skip"
  )
  
  const isLoading = fileData === undefined

  useEffect(() => {
    if (fileData) {
      setFiles(fileData)
    }
  }, [fileData])

  const handleCardClick = (fileId: string) => {
    router.push(`/chat/${fileId}`)
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 overflow-hidden">
      {/* Enhanced Background Circles */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100 via-rose-200 to-rose-300 opacity-50" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-rose-300 rounded-full blur-3xl opacity-60 animate-pulse" />
        <div className="absolute top-36 right-24 w-96 h-96 bg-rose-400 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-20 left-32 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-rose-300 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-rose-500 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Content container with proper scrolling */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full flex justify-center pt-16 px-6 pb-6">
          <div className="w-full max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Your Files</h1>
              <div className="text-sm text-gray-500">{files.length > 0 ? `${files.length} files` : ''}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {isLoading ? (
                Array(6).fill(0).map((_, idx) => (
                  <div key={idx} className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-5 overflow-hidden relative border border-rose-100 group h-48">
                    <div className="animate-pulse flex flex-col space-y-4">
                      <div className="w-12 h-12 rounded-lg bg-rose-200 mx-auto mb-2"></div>
                      <div className="h-5 w-3/4 bg-rose-200 rounded mx-auto"></div>
                      <div className="flex justify-between items-center pt-3">
                        <div className="h-4 w-1/3 bg-rose-100 rounded"></div>
                        <div className="h-4 w-1/4 bg-rose-100 rounded"></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))
              ) : (
                <>
                  {files.length > 0 && files.map((file) => (
                    <div
                      key={file._id}
                      onClick={() => handleCardClick(file._id)}
                      className="cursor-pointer bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-5 border border-rose-100 hover:bg-rose-50/90 transition-all duration-300 hover:shadow-rose-200/50 hover:translate-y-[-2px] relative group overflow-hidden h-48 flex flex-col"
                    >
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-center font-medium text-gray-800 mb-2 truncate">
                        {file.fileName}
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-2 border-t border-rose-100/50">
                        <span>PDF</span>
                        <span>
                          {new Date(file._creationTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-rose-400 to-rose-500 w-0 group-hover:w-full transition-all duration-300"></div>
                    </div>
                  ))}
                
                  {/* Upload File Card */}
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-rose-300 hover:border-rose-400 hover:bg-rose-50/60 transition-all duration-300 flex flex-col h-48 relative group overflow-hidden">
                    <div className="flex flex-col items-center justify-center flex-grow p-5">
                      <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-rose-200 transition-colors">  
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-medium text-gray-800">Upload File</p>
                      </div>
                    </div>
                    
                    <div className="px-4 pb-4 w-full">
                      <UploadButton
                        appearance={{
                          allowedContent: {
                            display: "none",
                          },
                          button: {
                            backgroundColor: "#f43f5e",
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            width: "100%",
                            cursor: "pointer",
                          }
                        }}
                        endpoint="pdfUploader"
                        onClientUploadComplete={async (res) => {
                          if (!res || !res[0]) return;
                          const file = res[0];

                          if (!user?.id) {
                            console.error('User not loaded');
                            return;
                          }

                          try {
                            const fileId = await saveFile({
                              fileName: file.name,
                              fileUrl: file.url,
                              clerkId: user.id,
                            });
                            router.push(`/chat/${fileId}`);
                          } catch (err) {
                            console.error('Failed to save file:', err);
                            alert('Something went wrong while saving the file.');
                          }
                        }}
                        onUploadError={(error) => {
                          console.error(error);
                          alert('Upload failed.');
                        }}
                      />
                    </div>
                  </div>
                  
                  {files.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-rose-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-lg font-medium">No files found</p>
                      <p className="text-sm mt-1">Upload a file to get started</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage