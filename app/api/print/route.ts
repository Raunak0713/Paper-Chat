import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import axios from "axios"
import fs from "fs"
import path from "path";

export async function POST(req : NextRequest){
  const data = await req.json()
  const { pdfUrl, pdfName } = data;

  const res = await axios(pdfUrl, { responseType : 'arraybuffer'})
  const filePath = path.join('/tmp', pdfName)
  fs.writeFileSync(filePath, res.data)

  const loader = new PDFLoader(filePath)
  const docs = await loader.load()

  const rawText = docs.map((doc) => doc.pageContent).join("\n\n")

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize : 1000,
    chunkOverlap : 200
  })

  const splitDocs = await splitter.createDocuments([rawText])
  const chunks =  splitDocs.map((doc) => doc.pageContent);

  return NextResponse.json({ 
    chunks : chunks
  })
}