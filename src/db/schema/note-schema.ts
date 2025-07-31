import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  customType,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
import { sql } from "drizzle-orm";

const bytea = customType<{ data: Uint8Array; notNull: true; default: true }>({
  dataType() {
    return "bytea";
  },
  toDriver(value) {
    return value;
  },
  fromDriver(value) {
    return new Uint8Array(value as ArrayBuffer);
  },
});

// TODO: AFTER SETUP WITH YDOC, BLOCKNOTE AND SOCKET.IO, NEED TO ADD A FIELD FOR NOTE TYPE: COLLABORATIVE OR PERSONAL, ALSO WHETHER IT'S PUBLIC OR PRIVATE
export const note = pgTable("note", {
  id: text()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull().default("Untitled"),
  content: bytea("content")
    .notNull()
    .default(sql`'\\x'`),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const noteCollaborator = pgTable(
  "note_collaborator",
  {
    noteId: text("note_id")
      .notNull()
      .references(() => note.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("editor").notNull(),
  },
  (table) => [primaryKey({ columns: [table.noteId, table.userId] })]
);
