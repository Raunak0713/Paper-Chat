"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isSignedIn } = useUser()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Default Navbar */}
      <div className={`${isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"} transition-opacity duration-300`}>
        <div className="flex h-16 items-center justify-between container mx-auto px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-rose-600 font-bold text-xl">
              <Sparkles className="h-6 w-6" />
              <span>PaperChat</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium">Features</Link>
            <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium">Pricing</Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-rose-600 font-medium">
                Solutions <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Link href="#" className="w-full">For Students</Link></DropdownMenuItem>
                <DropdownMenuItem><Link href="#" className="w-full">For Researchers</Link></DropdownMenuItem>
                <DropdownMenuItem><Link href="#" className="w-full">For Business</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium">About</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link href={"/dashboard"}>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">Dashboard</Button>
                </Link>
                <UserButton 
                  appearance={{
                    elements : {
                      avatarBox : {
                        height : "35px",
                        width : "35px"
                      },
                      userButtonPopoverCard : {
                        marginTop : "7.5px"
                      }
                    }
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton>
                  <Button variant="ghost" className="text-gray-700 hover:text-rose-600 hover:bg-rose-50">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">Get Started</Button>
                </SignUpButton>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Navbar */}
      <motion.div
        className="flex justify-center px-4 sm:px-6 lg:px-8"
        initial={false}
        animate={{ y: isScrolled ? 0 : -20, opacity: isScrolled ? 1 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
      >
        <motion.div
          className={`w-full max-w-7xl rounded-full backdrop-blur-lg ${
            isScrolled ? "bg-white/30 shadow-lg border border-white/20 opacity-100" : "opacity-0"
          }`}
          style={{ backdropFilter: "blur(8px)" }}
          initial={false}
          animate={{
            padding: isScrolled ? "0 1.5rem" : "0 0.5rem",
            marginTop: isScrolled ? "1rem" : "0",
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-rose-600 font-bold text-xl">
              <Sparkles className="h-6 w-6" />
              <span>PaperChat</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium">Features</Link>
              <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium">Pricing</Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-rose-600 font-medium">
                  Solutions <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><Link href="#" className="w-full">For Students</Link></DropdownMenuItem>
                  <DropdownMenuItem><Link href="#" className="w-full">For Researchers</Link></DropdownMenuItem>
                  <DropdownMenuItem><Link href="#" className="w-full">For Business</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium">About</Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <SignInButton>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">Dashboard</Button>
                </SignInButton>
                <UserButton 
                  appearance={{
                    elements : {
                      avatarBox : {
                        height : "35px",
                        width : "35px"
                      },
                      userButtonPopoverCard : {
                        marginTop : "7.5px"
                      }
                    }
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton>
                  <Button variant="ghost" className="text-gray-700 hover:text-rose-600 hover:bg-rose-50">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">Get Started</Button>
                </SignUpButton>
              </>
            )}
          </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white/80 backdrop-blur-lg border border-white/20 py-4 px-6 shadow-lg mt-5 mx-4 rounded-xl"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <nav className="flex flex-col space-y-4">
              <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium py-2">Features</Link>
              <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium py-2">Pricing</Link>
              <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium py-2">Solutions</Link>
              <Link href="#" className="text-gray-700 hover:text-rose-600 font-medium py-2">About</Link>
              <div className="pt-2 flex flex-col space-y-3">
                <SignInButton>
                  <Button variant="ghost" className="justify-start text-gray-700 hover:text-rose-600 hover:bg-rose-50">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white">Get Started</Button>
                </SignUpButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
