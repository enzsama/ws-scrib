import { eq } from "drizzle-orm";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { db } from "../db/drizzle.js";
import { noteEmbedding } from "../db/schema/note-schema.js";
import { byteaToText } from "./byteaToText.js";

export const embedNote = async (
  byteaBuffer: Uint8Array<ArrayBufferLike>,
  noteId: string
) => {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
  });

  const contentText = byteaToText(byteaBuffer);
  const chunks = await splitter.splitText(contentText);
  const vectors = await embeddings.embedDocuments(chunks);

  await db.insert(noteEmbedding).values(
    chunks.map((chunk, i) => ({
      noteId,
      content: chunk,
      embedding: vectors[i],
      metadata: { chunkIndex: i },
    }))
  );
};

export const updateNoteEmbedding = async (
  byteaBuffer: Uint8Array<ArrayBufferLike>,
  noteId: string
) => {
  await db.delete(noteEmbedding).where(eq(noteEmbedding.noteId, noteId));
  await embedNote(byteaBuffer, noteId);
};
