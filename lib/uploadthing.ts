import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  document: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
