import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("messages", {
      roomId: args.roomId,
      userId,
      content: args.content,
      type: args.type ?? "text",
    });
  },
});

export const sendFileMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    fileId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("messages", {
      roomId: args.roomId,
      userId,
# Added comment
      content: `Shared file: ${args.fileName}`,
      type: "file",
      fileId: args.fileId,
      fileName: args.fileName,
    });
  },
});

export const getRoomMessages = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(50);

    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        const fileUrl = message.fileId ? await ctx.storage.getUrl(message.fileId) : null;
        
        return {
          ...message,
          user: user ? { name: user.name, email: user.email } : null,
          fileUrl,
        };
      })
    );

    return messagesWithUsers.reverse();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});
