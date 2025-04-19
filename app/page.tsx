"use client";

import { Navbar } from "@/components/navbar";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/utils/uploadThing"; // Assuming this is your custom button utility
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, isLoaded } = useUser()
  const saveFile = useMutation(api.file.saveFile)


  // Company names for marquee
  const companies1 = [
    "Acme Inc", "TechFlow", "Quantum Systems", "Nexus AI", "Stellar Solutions",
    "Fusion Labs", "Apex Digital", "Momentum Corp", "Eclipse Data", "Prism Tech"
  ];
  const companies2 = [
    "Atlas Partners", "Horizon AI", "Vector Dynamics", "Chronos Technologies", "Spark Innovation",
    "Nebula Analytics", "Pinnacle Tech", "Zenith Software", "Cipher Solutions", "Insight Systems"
  ];

  // Open the file picker on button click
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Handle the file upload process
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      // You can add upload logic here if needed
      console.log("PDF Selected:", file.name);
      router.push("/chat");
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-rose-50">
      <Navbar />

      <div className="relative pt-16">
        {/* Decorative blobs */}
        <div className="absolute top-40 left-10 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
              Chat with your <span className="text-rose-500">PDFs</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your PDF and start a conversation. Get insights, summaries, and answers instantly.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 md:mb-0 md:absolute md:left-0 md:top-1/2 md:transform md:-translate-y-1/2 md:w-6/12 z-10">
              <div className="p-8 md:p-12">
                <div className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-600 font-medium text-sm mb-6">
                  Instant Insights
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Just <span className="text-rose-500">upload</span> your PDF and talk to it
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Get answers, summaries, and insights from your documents in seconds. No more scrolling through pages.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-6 py-3 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition-colors duration-300">
                    Try it now
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors duration-300">
                    Learn more
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-200 to-rose-300 rounded-3xl shadow-xl md:w-7/12 md:ml-auto relative overflow-hidden min-h-[500px] flex items-center justify-center p-8">
              <div className="absolute top-0 right-0 w-full h-full bg-white/10 backdrop-blur-[2px]"></div>
              <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-500 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Upload your PDF</h3>
                    <p className="text-gray-600 mt-1">Drag and drop or browse your files</p>
                  </div>

                  <div className="border-2 border-dashed border-rose-300 rounded-xl p-8 flex flex-col items-center justify-center bg-white/50">
                    <input
                      type="file"
                      accept="application/pdf"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-rose-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-500">PDF files up to 4MB</span>
                      <UploadButton
                        appearance={{
                          allowedContent: {
                            display: "none", // Hides the allowed content
                          },
                          button : {
                            backgroundColor: "transparent"
                          }
                        }}
                        endpoint="pdfUploader"
                        onClientUploadComplete={async (res) => {
                          if (!res || !res[0]) return

                          const file = res[0]

                          if (!user || !isLoaded) {
                            console.error('User not loaded')
                            return
                          }

                          try {
                            const fileId = await saveFile({
                              fileName: file.name,
                              fileUrl: file.url,
                              clerkId: user.id,
                            })

                            router.push(`/chat/${fileId}`)
                          } catch (err) {
                            console.error('Failed to save file:', err)
                            alert('Something went wrong while saving the file.')
                          }
                        }}
                        onUploadError={(error) => {
                          console.error(error)
                          alert('Upload failed.')
                        }}
                        className="mt-2 px-6 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors duration-300 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <span className="text-xs text-gray-500">
                      By uploading, you agree to our{" "}
                      <a href="#" className="text-rose-500 hover:underline">
                        Terms of Service
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>      

      {/* Companies Marquee */}
      <div className="py-16 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Trusted by <span className="text-rose-500">Innovative</span> teams
          </h2>
        </div>

        <div className="relative overflow-hidden py-6 bg-white/30">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

          <div className="flex animate-marquee whitespace-nowrap">
            {[...companies1, ...companies1].map((company, i) => (
              <div key={i} className="flex items-center justify-center mx-8 h-16">
                <div className="flex items-center justify-center px-6 py-3 bg-white/70 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  <span className="text-lg font-semibold text-gray-700 tracking-wide hover:text-rose-500 transition-colors duration-300">
                    {company}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden py-6 bg-white/30 mt-4">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

          <div className="flex animate-marquee-reverse whitespace-nowrap">
            {[...companies2, ...companies2].map((company, i) => (
              <div key={i} className="flex items-center justify-center mx-8 h-16">
                <div className="flex items-center justify-center px-6 py-3 bg-white/70 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  <span className="text-lg font-semibold text-gray-700 tracking-wide hover:text-rose-500 transition-colors duration-300">
                    {company}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
