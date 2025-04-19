'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'

export default function CheckPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const checkOrPutUser = useMutation(api.user.checkOrPutUser)

  useEffect(() => {
    if (!isLoaded) return

    const syncUser = async () => {
      if (!user) return router.push('/sign-in')

      await checkOrPutUser({
        name: user.fullName || 'Unnamed User',
        email: user.primaryEmailAddress?.emailAddress || '',
        clerkId: user.id,
      })

      router.push('/')
    }

    syncUser()
  }, [isLoaded, user, checkOrPutUser, router])

  return <p className="text-muted-foreground text-sm text-center mt-10">Just a sec, setting things up for you...</p>
}
