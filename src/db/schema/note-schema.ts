import { sql } from "drizzle-orm";
import {
  bigserial,
  customType,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

const bytea = customType<{
  data: Uint8Array<ArrayBufferLike>;
  notNull: true;
  default: true;
}>({
  dataType() {
    return "bytea";
  },
  toDriver(value) {
    return value;
  },
  fromDriver(value) {
    return new Uint8Array<ArrayBufferLike>(value as ArrayBufferLike);
  },
});

const userRoleEnum = pgEnum("user_role", ["owner", "admin", "editor"]);

// TODO: NEED TO ADD A FIELD FOR NOTE TYPE: COLLABORATIVE OR PERSONAL, ALSO WHETHER IT'S PUBLIC OR PRIVATE
export const note = pgTable("note", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled"),
  content: bytea("content")
    .notNull()
    .default(sql`'\\x'`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const noteCollaborator = pgTable(
  "note_collaborator",
  {
    noteId: uuid("note_id")
      .notNull()
      .references(() => note.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.noteId, table.userId] }),
    uniqueIndex("unique_note_owner")
      .on(table.noteId)
      .where(sql`${table.role} = 'owner'`),
  ]
);

export const noteEmbedding = pgTable("note_embedding", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  noteId: uuid("note_id")
    .notNull()
    .references(() => note.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
