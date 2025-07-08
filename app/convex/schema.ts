
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  documents: defineTable({
    content: v.string(),
    title: v.optional(v.string()),
    source: v.optional(v.string()),
    metadata: v.optional(v.object({
      page: v.optional(v.number()),
      section: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
    embedding: v.array(v.number()), // Vector embeddings
    createdAt: v.number(),
  })
      .index("by_created_at", ["createdAt"])
      .vectorIndex("by_embedding", {
        vectorField: "embedding",
        dimensions: 1536, // OpenAI embedding dimension
      }),
});
