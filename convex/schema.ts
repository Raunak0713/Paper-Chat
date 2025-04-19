import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    filesUploaded: v.number(),
    maxFilesLimit: v.number()
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"]),

  files: defineTable({
    fileName: v.string(),
    fileUrl: v.string(),
    fileOwner: v.id("users")
  })
    .index("by_fileOwner", ["fileOwner"]),

  chunks: defineTable({
    fileId: v.id("files"),
    chunkNumber: v.number(),
    chunkText: v.string(),
    embeddingChunk: v.array(v.float64())
  })
    .index("by_fileId", ["fileId"])
    .index("by_fileId_chunkNumber", ["fileId", "chunkNumber"])
    .vectorIndex("by_embedding", {
      vectorField: "embeddingChunk",
      dimensions: 1536,
      filterFields: ["fileId"]
    })
})