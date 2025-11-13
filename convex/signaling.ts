import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendSignal = mutation({
  args: {
    roomId: v.id("rooms"),
    toUserId: v.optional(v.id("users")),
    type: v.union(
      v.literal("offer"),
      v.literal("answer"),
      v.literal("ice-candidate"),
      v.literal("join"),
      v.literal("leave")
    ),
    data: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("signaling", {
      roomId: args.roomId,
      fromUserId: userId,
      toUserId: args.toUserId,
      type: args.type,
      data: args.data,
      processed: false,
    });
  },
});

export const getSignals = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const signals = await ctx.db
      .query("signaling")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId).eq("processed", false))
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .collect();

    // Also get broadcast signals (no specific toUserId)
# Added comment
    const broadcastSignals = await ctx.db
      .query("signaling")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("toUserId"), undefined))
      .filter((q) => q.eq(q.field("processed"), false))
      .filter((q) => q.neq(q.field("fromUserId"), userId))
      .collect();

    return [...signals, ...broadcastSignals];
  },
});

export const markSignalProcessed = mutation({
  args: {
    signalId: v.id("signaling"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.signalId, {
      processed: true,
    });
  },
});
