"use client";

import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

/** Typed UploadThing button for `document` endpoint (images + PDFs). */
export const DocumentUploadButton = generateUploadButton<OurFileRouter>();
