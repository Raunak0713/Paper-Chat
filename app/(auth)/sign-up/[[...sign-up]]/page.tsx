'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'

export default function SignUpPage() {
  return (
    <SignUp.Root>
      <SignUp.Step
        name="start"
        className="bg-background w-[22rem] md:w-[28rem] rounded-2xl px-8 mr-5 md:mr-0 py-10 shadow-xl border border-border space-y-6 backdrop-blur-md"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-1">Create Account</h1>
          <p className="text-sm text-muted-foreground">Sign up to access your personalized dashboard</p>
        </div>

        <div className="grid grid-cols-1">
          <Clerk.Connection
            name="google"
            className="flex items-center justify-center gap-x-3 bg-muted hover:bg-muted/80 text-sm font-medium border border-border py-2 rounded-lg transition-all"
          >
            <Clerk.Icon className="size-5" />
            Continue with Google
          </Clerk.Connection>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
            <span className="bg-background px-2">Or sign up with email</span>
          </div>
        </div>

        <Clerk.Field name="identifier" className="space-y-1">
          <Clerk.Label className="text-xs font-medium text-muted-foreground tracking-wide">
            Email address
          </Clerk.Label>
          <Clerk.Input
            placeholder="you@example.com"
            className="w-full mt-1 border border-border bg-muted/20 text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition placeholder:text-muted-foreground"
          />
          <Clerk.FieldError className="text-sm text-destructive" />
        </Clerk.Field>

        <Clerk.Field name="password" className="space-y-1">
          <Clerk.Label className="text-xs font-medium text-muted-foreground tracking-wide">
            Password
          </Clerk.Label>
          <Clerk.Input
            type="password"
            placeholder="Create a password"
            className="w-full mt-1 border border-border bg-muted/20 text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition placeholder:text-muted-foreground"
          />
          <Clerk.FieldError className="text-sm text-destructive" />
        </Clerk.Field>

        <SignUp.Action
          submit
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-lg py-2 font-medium text-sm"
        >
          Sign Up
        </SignUp.Action>
      </SignUp.Step>
    </SignUp.Root>
  )
}
