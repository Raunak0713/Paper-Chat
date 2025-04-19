'use client'

import { useEffect, useState, FormEvent, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

const ChatPage = () => {
  const { chatId } = useParams()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [loadingChunks, setLoadingChunks] = useState(false)
  const [chunksReady, setChunksReady] = useState(false)
  const [chunkData, setChunkData] = useState({ count: 0, expectedCount: 0 })
  const [hasStartedChunking, setHasStartedChunking] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPdf, setShowPdf] = useState(false) // State to toggle PDF view on mobile
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const createChunk = useMutation(api.chunk.createChunk)
  const file = useQuery(api.file.getFileById, {
    fileId: chatId as Id<'files'>,
  })

  const isLoading = file === undefined
  const error = file === null

  const fileEmbeddings = useQuery(api.chunk.getFileEmbeddings,
    file ? { fileId: file._id } : "skip"
  )

  const chunkCounter = useQuery(api.chunk.chunkCounter, {
    fileId: chatId as Id<'files'>,
  })

  // Progress-based loading messages
  const getLoadingMessage = (progress: number) => {
    if (progress < 10) return "Starting to process your document..."
    if (progress < 20) return "Parsing PDF content..."
    if (progress < 30) return "Breaking text into meaningful chunks..."
    if (progress < 40) return "Beginning to understand your document..."
    if (progress < 50) return "Creating semantic connections..."
    if (progress < 60) return "Enhancing document intelligence..."
    if (progress < 70) return "Processing complex sections..."
    if (progress < 80) return "Aligning knowledge vectors..."
    if (progress < 90) return "Finalizing neural embeddings..."
    return "Almost ready to chat with your document!"
  }

  // Calculate progress percentage
  const progressPercentage = chunkData.expectedCount > 0 
    ? Math.round((chunkData.count / chunkData.expectedCount) * 100) 
    : 0

  const generateEmbeddings = async (chunk: string) => {
    const res = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chunk }),
    })

    const data = await res.json()
    return data.embedding
  }

  const fetchChunks = async (url: string, name: string) => {
    const res = await fetch('/api/print', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfUrl: url, pdfName: name }),
    })
    return res.json()
  }

  // Start chunking process automatically when the page loads
  const startChunking = useCallback(async (url: string, name: string) => {
    if (chunkCounter && chunkCounter.count > 0) {
      setChunksReady(true)
      setLoadingChunks(false)
      return
    }
    
    setLoadingChunks(true)
    try {
      const { chunks } = await fetchChunks(url, name)
      const expectedCount = chunks.length
      setChunkData({ count: 0, expectedCount })

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const embed = await generateEmbeddings(chunk)
        await createChunk({
          chunkNumber: i + 1,
          chunkText: chunk,
          embeddingChunk: embed,
          fileId: file!._id,
        })

        setChunkData((prev) => ({
          ...prev,
          count: prev.count + 1,
        }))
      }

      setChunksReady(true)
    } catch (err) {
      console.error("Error during chunking:", err)
    }
    setLoadingChunks(false)
  }, [chunkCounter, createChunk, file])

  useEffect(() => {
    if (file && !isLoading && !error && !hasStartedChunking) {
      setPdfUrl(file.fileUrl)
      setFileName(file.fileName)
      setHasStartedChunking(true)
      startChunking(file.fileUrl, file.fileName)
    }
  }, [file, isLoading, error, hasStartedChunking, startChunking])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSubmitting) return
  
    const userMessage = { role: 'user' as const, content: message }
    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsSubmitting(true)
  
    try {
      const embedResponse = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunk: message }),
      })
  
      if (!embedResponse.ok) throw new Error('Failed to generate embedding for query')
  
      const embedData = await embedResponse.json()
      const userQueryEmbedding = embedData.embedding
  
      if (!fileEmbeddings || !Array.isArray(fileEmbeddings) || fileEmbeddings.length === 0) {
        throw new Error('Document embeddings not available')
      }
  
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQueryEmbedding,
          fileEmbeddings,
          userQuestion: message
        }),
      })
  
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to get response')
      }
  
      const data = await res.json()
      const aiMessage = {
        role: 'assistant' as const,
        content: data.answer || "I couldn't find relevant information in the document to answer your question."
      }
  
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('Error while processing the query:', err)
      const errorMessage = { 
        role: 'assistant' as const, 
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.` 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-r from-rose-100 to-rose-200 overflow-hidden">
      {/* Mobile Toggle Button */}
      <div className="md:hidden flex justify-center p-2 bg-rose-300/50">
        <button
          onClick={() => setShowPdf(!showPdf)}
          className="px-4 py-2 bg-rose-500 text-white rounded-full text-sm font-medium shadow-md"
        >
          {showPdf ? 'Show Chat' : 'Show Document'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Left Panel - PDF Viewer */}
        <div className={`${showPdf ? 'flex' : 'hidden'} md:flex w-full md:w-1/2 h-1/2 md:h-full p-2 md:p-4 flex-col`}>
          <div className="flex-grow flex flex-col overflow-hidden rounded-2xl md:rounded-3xl shadow bg-white/40 backdrop-blur-sm border border-white/20">
            <div className="p-3 border-b border-rose-200 bg-white/60">
              <h2 className="text-lg font-medium text-foreground truncate">
                {isLoading ? 'Loading...' : error ? 'Error' : fileName || 'No file name'}
              </h2>
            </div>
            <div className="flex-grow overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-lg text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-500 rounded-full animate-spin mb-3"></div>
                    <span>Loading PDF...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-lg text-destructive">
                  Failed to load file.
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title="PDF Viewer"
                  className="w-full h-full bg-white"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-lg text-muted-foreground">
                  No PDF found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Chat or Loader */}
        <div className={`${!showPdf ? 'flex' : 'hidden'} md:flex w-full md:w-1/2 h-1/2 md:h-full p-2 md:p-4 flex-col`}>
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 right-10 w-96 h-96 bg-rose-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-16 right-16 w-96 h-96 bg-rose-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-10 left-20 w-80 h-80 bg-rose-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          </div>

          <div className="relative z-10 w-full h-full rounded-2xl md:rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-rose-200 bg-rose-300/30">
              <h2 className="text-lg font-medium text-foreground">Chat</h2>
            </div>

            <div className="flex-grow overflow-auto p-2 md:p-4">
              {!chunksReady ? (
                <div className="flex flex-col items-center justify-center h-full text-lg text-foreground opacity-80 text-center">
                  <div className="w-10 h-10 border-4 border-rose-400 border-t-rose-600 rounded-full animate-spin mb-4"></div>
                  <p className="mb-4 font-medium text-rose-600">{getLoadingMessage(progressPercentage)}</p>
                  
                  <div className="w-48 md:w-64 bg-rose-100 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-rose-300 to-rose-500 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  
                  <p className="mt-3 text-sm font-medium text-rose-500 flex items-center">
                    <span className="bg-white/70 px-2 md:px-3 py-1 rounded-full shadow-sm border border-rose-200">
                      {chunkData.count} / {chunkData.expectedCount} chunks
                    </span>
                    <span className="ml-2 bg-rose-400 text-white px-2 py-1 rounded-full shadow-sm">
                      {progressPercentage}%
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 md:space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-48 md:h-64 text-lg text-foreground opacity-70 text-center">
                      Ask questions about your PDF document
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[90%] md:max-w-[80%] p-2 md:p-3 rounded-xl md:rounded-2xl ${
                            msg.role === 'user' 
                              ? 'bg-rose-400 text-white rounded-tr-none' 
                              : 'bg-white/60 backdrop-blur-sm text-gray-800 rounded-tl-none border border-rose-200'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            {chunksReady && (
              <div className="p-2 md:p-4 border-t border-rose-200 bg-white/40 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about your document..."
                    className="flex-grow p-2 md:p-3 rounded-full border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white/70 placeholder-rose-300/70 text-sm md:text-base"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className={`p-2 md:p-3 rounded-full bg-rose-400 hover:bg-rose-500 text-white transition-colors duration-200 ${
                      (isSubmitting || !message.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage