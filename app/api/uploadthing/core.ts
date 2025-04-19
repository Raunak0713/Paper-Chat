import { createUploadthing, type FileRouter } from "uploadthing/next";

// Initialize Uploadthing
const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define FileRoute for PDF uploads
  pdfUploader: f({
    pdf: {
      maxFileSize: "4MB",  // Set max file size to 4MB
      maxFileCount: 1,     // Allow only one file at a time
    },
  })
    // Remove the middleware to skip authentication checks
    .onUploadComplete(async ({ file }) => {
      // This code runs after the file upload completes
      console.log("Upload complete!");
      console.log("File URL:", file.ufsUrl);  // This is the URL to the uploaded file

      // Return metadata (you can include anything you need here)
      return { fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
