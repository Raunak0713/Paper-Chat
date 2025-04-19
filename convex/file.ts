import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const saveFile = mutation({
  args: {
    fileName: v.string(),
    fileUrl: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
      .first()

    if (!user) {
      throw new Error('User not found')
    }

    const fileId = await ctx.db.insert('files', {
      fileName: args.fileName,
      fileUrl: args.fileUrl,
      fileOwner: user._id,
    })

    await ctx.db.patch(user._id, {
      filesUploaded: user.filesUploaded + 1,
    })

    return fileId
  },
})


export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.fileId)
  },
})

// Fetch file by ID
export const getFileById = query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId)
  },
})
