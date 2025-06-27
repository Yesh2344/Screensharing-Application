import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createRoom = mutation({
  args: {
    name: v.string(),
    maxParticipants: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      createdBy: userId,
      isActive: true,
      maxParticipants: args.maxParticipants ?? 10,
    });

    // Add creator as host participant
    await ctx.db.insert("participants", {
      roomId,
      userId,
      role: "host",
      isConnected: true,
      lastSeen: Date.now(),
    });

    return roomId;
  },
});

export const joinRoom = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isActive) {
      throw new Error("Room not found or inactive");
    }

    // Check if user is already a participant
    const existingParticipant = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingParticipant) {
      // Update existing participant
      await ctx.db.patch(existingParticipant._id, {
        isConnected: true,
        lastSeen: Date.now(),
      });
    } else {
      // Add new participant as viewer
      await ctx.db.insert("participants", {
        roomId: args.roomId,
        userId,
        role: "viewer",
        isConnected: true,
        lastSeen: Date.now(),
      });
    }

    return args.roomId;
  },
});

export const leaveRoom = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        isConnected: false,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getRoomDetails = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) {
      return null;
    }

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const participantsWithUsers = await Promise.all(
      participants.map(async (participant) => {
        const user = await ctx.db.get(participant.userId);
        return {
          ...participant,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );

    return {
      ...room,
      participants: participantsWithUsers,
    };
  },
});

export const getUserRooms = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const userParticipations = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const rooms = await Promise.all(
      userParticipations.map(async (participation) => {
        const room = await ctx.db.get(participation.roomId);
        return room ? { ...room, role: participation.role } : null;
      })
    );

    return rooms.filter(Boolean);
  },
});
