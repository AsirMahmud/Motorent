"use client";

import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

/** Typed UploadThing button for `document` endpoint (images + PDFs). */
export const DocumentUploadButton = generateUploadButton<OurFileRouter>();

/** Drag-and-drop area for the same endpoint (better UX than button-only). */
export const DocumentUploadDropzone = generateUploadDropzone<OurFileRouter>();
