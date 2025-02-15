import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `${name}s`);

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = createTable(
  "user",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    clerkId: varchar("clerk_id", { length: 256 }),
    name: varchar("name", { length: 256 }),
    email: varchar("email", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => ({
    clerkIdIndex: index("clerk_id_idx").on(t.clerkId),
    emailIndex: index("email_idx").on(t.email),
  }),
);
