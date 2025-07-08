import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

export const ragQuery = action({
    args: {
        question: v.string(),
        systemPrompt: v.optional(v.string()),
        maxTokens: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 1. Search for relevant documents
        const relevantDocs: any = await ctx.runAction(api.functions.documents.searchDocuments, {
            query: args.question,
            limit: 3,
        });

        // 2. Prepare context from retrieved documents
        const context: string = relevantDocs
            .map((doc: any) => `Source: ${doc.source || "Unknown"}\n${doc.content}`)
            .join("\n\n---\n\n");

        // 3. Generate response using OpenAI
        const systemPrompt = args.systemPrompt ||
            "You are a helpful assistant. Use the provided context to answer questions accurately. If the answer isn't in the context, say so.";

        const response: any = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: `Context:\n${context}\n\nQuestion: ${args.question}`
                    },
                ],
                max_tokens: args.maxTokens || 500,
            }),
        });

        const data: any = await response.json();

        return {
            answer: data.choices[0].message.content,
            sources: relevantDocs.map((doc: any) => ({
                title: doc.title,
                source: doc.source,
                snippet: doc.content.substring(0, 200) + "...",
            })),
        };
    },
});
