import { v } from "convex/values";
import { action, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

type Chunk = {
  _id: Id<"chunks">;
  _creationTime: number;
  fileId: Id<"files">;
  chunkNumber: number;
  chunkText: string;
  embeddingChunk: number[];
};

export const createChunk = mutation({
  args: {
    fileId: v.id("files"),
    chunkNumber: v.number(),
    chunkText: v.string(),
    embeddingChunk: v.array(v.float64())
  },
  handler: async(ctx, args) => {
    await ctx.db.insert("chunks", {
      fileId: args.fileId,
      chunkNumber: args.chunkNumber,
      chunkText: args.chunkText,
      embeddingChunk: args.embeddingChunk,
    })
  }
})

export const chunkCounter = query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("chunks")
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .collect()

    return { count: chunks.length }
  },
})

// Create a separate query function to fetch chunks by IDs
export const fetchChunksByIds = internalQuery({
  args: { ids: v.array(v.id("chunks")) },
  handler: async (ctx, args) => {
    const chunks = [];
    for (const id of args.ids) {
      const chunk = await ctx.db.get(id);
      if (chunk) chunks.push(chunk);
    }
    return chunks;
  },
});

export const searchChunks = action({
  args: {
    embedding: v.array(v.number()),
    fileId: v.id("files"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("chunks", "by_embedding", {
      vector: args.embedding,
      limit: args.limit ?? 5,
      filter: (q) => q.eq("fileId", args.fileId),
    });
    
    //@ts-ignore
    const chunks: Chunk[] = await ctx.runQuery(internal.chunk.fetchChunksByIds, {
      ids: results.map(result => result._id)
    });
    
    return chunks;
  },
});

export const getFileEmbeddings = query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("chunks")
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .collect();

    return chunks.map(chunk => ({
      text: chunk.chunkText,
      embedding: chunk.embeddingChunk
    }));
  },
});