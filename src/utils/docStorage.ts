import * as Y from "yjs";
import { getNote, updateNote } from "./queries.js";
import { DocStorage } from "yjs-server";

const docStorage: DocStorage = {
  loadDoc: async (noteId: string, doc: Y.Doc) => {
    const { content } = await getNote(noteId);
    if (content && content.length > 0) Y.applyUpdate(doc, content);
  },
  storeDoc: async (noteId: string, doc: Y.Doc) => {
    const encodedUpdate = Y.encodeStateAsUpdate(doc);
    try {
      const currentNote = await getNote(noteId);
      if (!currentNote) throw new Error("Note not found");
      await updateNote(noteId, encodedUpdate);
    } catch (error) {
      console.log("Error persisting note to database: ", error);
    }
  },
  onUpdate: async (
    noteId: string,
    encodedUpdate: Uint8Array<ArrayBufferLike>,
    doc: Y.Doc
  ) => {
    Y.applyUpdate(doc, encodedUpdate);
    const fullState = Y.encodeStateAsUpdate(doc);
    try {
      const currentNote = await getNote(noteId);
      if (!currentNote) throw new Error("Note not found");
      await updateNote(noteId, fullState);
    } catch (error) {
      console.log("Error persisting note to database: ", error);
    }
  },
};

export default docStorage;
