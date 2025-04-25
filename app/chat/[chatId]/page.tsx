'use client'

import { useEffect, useState, FormEvent, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { motion } from 'framer-motion'

const ChatPage = () => {
  const { chatId } = useParams()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPdf, setShowPdf] = useState(false) // State to toggle PDF view on mobile
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [fullText, setFullText] = useState<string | null>(null);
  const [loadingFullText, setLoadingFullText] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false); // State to indicate AI thinking

  const file = useQuery(api.file.getFileById, {
    fileId: chatId as Id<'files'>,
  })

  const isLoading = file === undefined
  const error = file === null

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const extractTextFromPdf = useCallback(async (url: string, name: string) => {
    setLoadingFullText(true);
    try {
      const res = await fetch('/api/extract-text', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl: url, pdfName: name }),
      });
      const data = await res.json();
      setFullText(data.rawText);
    } catch (err) {
      console.error("Error extracting text:", err);
      setFullText("Error extracting text from PDF.");
    } finally {
      setLoadingFullText(false);
    }
  }, []);

  useEffect(() => {
    if (file && !isLoading && !error) {
      setPdfUrl(file.fileUrl)
      setFileName(file.fileName)
      extractTextFromPdf(file.fileUrl, file.fileName);
    }
  }, [file, isLoading, error, extractTextFromPdf])


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSubmitting) return

    const userMessage = { role: 'user' as const, content: message }
    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsSubmitting(true)
    setIsAiThinking(true); // Show thinking bubble

    try {
      if (!fullText) {
        throw new Error('Document text not available');
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: message,
          context: fullText,
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
      setIsAiThinking(false); // Hide thinking bubble
    }
  }

  const AiThinkingBubble = () => (
    <div className="flex justify-start">
      <div className="max-w-[80%] p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/60 backdrop-blur-sm text-gray-800 rounded-tl-none border border-rose-200">
        <div className="flex items-center space-x-1">
          <motion.div
            animate={{
              y: [0, -8, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-2 h-2 rounded-full bg-rose-500"
          />
          <motion.div
            animate={{
              y: [0, -8, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
            className="w-2 h-2 rounded-full bg-rose-500"
          />
          <motion.div
            animate={{
              y: [0, -8, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
            className="w-2 h-2 rounded-full bg-rose-500"
          />
        </div>
      </div>
    </div>
  );

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
              {loadingFullText ? (
                <div className="flex flex-col items-center justify-center h-full text-lg text-foreground opacity-80 text-center">
                  <div className="w-10 h-10 border-4 border-rose-400 border-t-rose-600 rounded-full animate-spin mb-4"></div>
                  <p className="mb-4 font-medium text-rose-600">Extracting text from document...</p>
                </div>
              ) : !fullText ? (
                  <div className="flex flex-col items-center justify-center h-full text-lg text-foreground opacity-80 text-center">
                    <p className="mb-4 font-medium text-rose-600">Waiting for document to load...</p>
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
                  {isAiThinking && <AiThinkingBubble />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            {!loadingFullText && fullText && (
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
      <style jsx>{`
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .typing-indicator span {
    width: 10px;
    height: 10px;
    background-color: #f43f5e; /* rose-500 */
    border-radius: 50%;
    animation: bounce 1.2s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0.8) translateY(0);
    }
    40% {
      transform: scale(1.2) translateY(-6px);
    }
  }
`}</style>

    </div>
  )
}

export default ChatPage