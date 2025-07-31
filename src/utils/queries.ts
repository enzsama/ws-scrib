import { and, eq } from "drizzle-orm";
import { db } from "../db/drizzle.js";
import { note, noteCollaborator } from "../db/schema/note-schema.js";
import { session } from "../db/schema/auth-schema.js";

export const getNote = async (noteId: string) => {
  const [currentNote] = await db
    .select({ content: note.content })
    .from(note)
    .where(eq(note.id, noteId))
    .limit(1);

  return currentNote;
};

export const getSession = async (sessionToken: string) => {
  const [currentSession] = await db
    .select({ userId: session.userId, expiresAt: session.expiresAt })
    .from(session)
    .where(eq(session.token, sessionToken))
    .limit(1);

  return currentSession;
};

export const getCollaborator = async (noteId: string, userId: string) => {
  const [collaborator] = await db
    .select()
    .from(noteCollaborator)
    .where(
      and(
        eq(noteCollaborator.noteId, noteId),
        eq(noteCollaborator.userId, userId)
      )
    )
    .limit(1);

  if (collaborator) return true;
  return false;
};

export const updateNote = async (
  noteId: string,
  newContent: Uint8Array<ArrayBufferLike>
) => {
  await db.update(note).set({ content: newContent }).where(eq(note.id, noteId));
};
