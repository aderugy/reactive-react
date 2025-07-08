import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

export const ingestDocument = action({
    args: {
        content: v.string(),
        title: v.optional(v.string()),
        source: v.optional(v.string()),
        chunkSize: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const chunkSize = args.chunkSize || 1000;
        const chunks = chunkText(args.content, chunkSize);

        const results: any[] = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            // Generate embedding for each chunk
            const embedding = await generateEmbedding(chunk);

            // Store the document chunk
            const docId = await ctx.runMutation(api.functions.documents.storeDocument, {
                content: chunk,
                title: args.title ? `${args.title} (Part ${i + 1})` : undefined,
                source: args.source,
                metadata: {
                    page: i + 1,
                    section: `chunk_${i}`,
                },
                embedding,
            });

            results.push(docId);
        }

        return {
            message: `Successfully ingested ${chunks.length} chunks`,
            documentIds: results,
        };
    },
});

// Helper function to chunk text
function chunkText(text: string, chunkSize: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

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
