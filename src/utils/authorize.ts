import { IncomingMessage } from "http";
import { WebSocket } from "ws";
import { defaultDocNameFromRequest } from "yjs-server";
import { getCollaborator, getNote, getSession } from "./queries.js";

const authorize = async (ws: WebSocket, request: IncomingMessage) => {
  const noteId = defaultDocNameFromRequest(request);
  if (!noteId) throw new Error("Note Id is not set");

  const currentNote = await getNote(noteId);
  if (!currentNote) throw new Error("Note does not exist");

  const url = new URL(request.url!, "http://localhost");
  const sessionToken = url.searchParams.get("token");
  if (!sessionToken) throw new Error("Session token is not set");

  const validSession = await getSession(sessionToken);
  if (!validSession || new Date() > validSession.expiresAt)
    throw new Error("Invalid or expired session");

  const isCollaborator = await getCollaborator(noteId, validSession.userId);
  if (!isCollaborator)
    throw new Error("User is not a collaborator of this note");

  return true;
};

export default authorize;
