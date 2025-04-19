import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userQueryEmbedding, fileEmbeddings, userQuestion  } = body;

    if (!fileEmbeddings || !Array.isArray(fileEmbeddings)) {
      return NextResponse.json({
        error: "Invalid document embeddings format. Expected an array.",
      }, { status: 400 });
    }

    const validChunks = fileEmbeddings.filter(item =>
      item?.text?.trim() &&
      Array.isArray(item.embedding) &&
      item.embedding.length > 0
    );

    if (validChunks.length === 0) {
      return NextResponse.json({
        error: "No valid document content found. Check if the document was properly processed.",
      }, { status: 400 });
    }

    let topChunks = [];

    if (userQueryEmbedding?.length && validChunks.some(c => c.embedding?.length === userQueryEmbedding.length)) {
      const results = validChunks
        .filter(item => item.embedding?.length === userQueryEmbedding.length)
        .map(item => ({
          ...item,
          similarity: cosineSimilarity(userQueryEmbedding, item.embedding),
        }))
        .sort((a, b) => b.similarity - a.similarity);

      topChunks = results.slice(0, 5);
    }

    if (topChunks.length === 0) {
      topChunks = validChunks.slice(0, 6);
    }

    if (topChunks.length === 0) {
      return NextResponse.json({
        error: "No usable content could be extracted. The document may be empty or corrupted.",
      }, { status: 400 });
    }

    const context = topChunks
      .map(chunk => chunk.text.trim())
      .filter(Boolean)
      .join("\n---\n");

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are PaperChat, a helpful assistant. Answer questions based on the context below. If unsure, say so.
        
Current time: ${new Date().toLocaleString()}`,
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${userQuestion || "What's this document about?"}`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.5,
      max_tokens: 1000,
    });

    const answer = completion.choices[0]?.message?.content || 
      "I couldn't generate an answer. Please try again.";

    return NextResponse.json({ 
      answer,
      debug: {
        chunksUsed: topChunks.length,
        contextLength: context.length,
        usedChunksPreview: topChunks.map(chunk => chunk.text.slice(0, 50))
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
