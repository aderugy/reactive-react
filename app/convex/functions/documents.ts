
import { v } from "convex/values";
import { mutation, action } from "../_generated/server";

// Store a document with its embedding
export const storeDocument = mutation({
    args: {
        content: v.string(),
        title: v.optional(v.string()),
        source: v.optional(v.string()),
        metadata: v.optional(v.object({
            page: v.optional(v.number()),
            section: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
        })),
        embedding: v.array(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("documents", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

// Search for similar documents using vector similarity
export const searchDocuments = action({
    args: {
        query: v.string(),
        limit: v.optional(v.number()),
        filter: v.optional(v.object({
            source: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
        })),
    },
    handler: async (ctx, args) => {
        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(args.query);

        // Search for similar documents (simplified without complex filters for now)
        const results = await ctx.vectorSearch("documents", "by_embedding", {
            vector: queryEmbedding,
            limit: args.limit ?? 5,
        });

        return results;
    },
});

// Helper function to generate embeddings
async function generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "text-embedding-ada-002",
            input: text,
        }),
    });

    const data = await response.json();
    return data.data[0].embedding;
}
