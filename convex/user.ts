import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const checkOrPutUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first()

    if (user) return null

    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      filesUploaded: 0,
      email: args.email,
      name: args.name,
      maxFilesLimit: 6,
    })
  },
})

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first()
  },
})

export const getAllFilesOfUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first()

    return await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("fileOwner"), user?._id))
      .collect()
  },
})

export const incrementFilesUploaded = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first()

    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, {
      filesUploaded: user.filesUploaded + 1,
    })
  },
})

export const decrementFilesUploaded = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first()

    if (!user) throw new Error("User not found")

    await ctx.db.patch(user._id, {
      filesUploaded: Math.max(0, user.filesUploaded - 1),
    })
  },
})

export const hasUserExceededUploadLimit = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first()

    if (!user) throw new Error("User not found")

    return user.filesUploaded >= user.maxFilesLimit
  },
})
