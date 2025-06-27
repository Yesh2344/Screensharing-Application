import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  rooms: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    maxParticipants: v.number(),
  }).index("by_created_by", ["createdBy"]),

  participants: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    role: v.union(v.literal("host"), v.literal("viewer")),
    isConnected: v.boolean(),
    lastSeen: v.number(),
  }).index("by_room", ["roomId"])
    .index("by_user", ["userId"]),

  messages: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("file"), v.literal("system")),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
  }).index("by_room", ["roomId"]),

  signaling: defineTable({
    roomId: v.id("rooms"),
    fromUserId: v.id("users"),
    toUserId: v.optional(v.id("users")),
    type: v.union(
      v.literal("offer"),
      v.literal("answer"),
      v.literal("ice-candidate"),
      v.literal("join"),
      v.literal("leave")
    ),
    data: v.string(),
    processed: v.boolean(),
  }).index("by_room", ["roomId"])
    .index("by_to_user", ["toUserId", "processed"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
