import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface DashboardProps {
  onJoinRoom: (roomId: Id<"rooms">) => void;
}

export function Dashboard({ onJoinRoom }: DashboardProps) {
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const userRooms = useQuery(api.rooms.getUserRooms) || [];
  const createRoom = useMutation(api.rooms.createRoom);
  const joinRoom = useMutation(api.rooms.joinRoom);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setIsCreating(true);
    try {
      const roomId = await createRoom({ name: roomName.trim() });
      toast.success("Room created successfully!");
      setRoomName("");
      onJoinRoom(roomId);
    } catch (error) {
      toast.error("Failed to create room");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (roomId: Id<"rooms">) => {
    try {
      await joinRoom({ roomId });
      onJoinRoom(roomId);
    } catch (error) {
      toast.error("Failed to join room");
      console.error(error);
    }
  };

  const validRooms = userRooms.filter((room): room is NonNullable<typeof room> => room !== null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Screen Sharing Dashboard</h1>
        <p className="text-gray-600">Create or join a room to start sharing your screen</p>
      </div>

      {/* Create Room */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
        <form onSubmit={handleCreateRoom} className="flex gap-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={!roomName.trim() || isCreating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>

      {/* Your Rooms */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Your Rooms</h2>
        {validRooms.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No rooms yet. Create your first room above!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {validRooms.map((room) => (
              <div
                key={room._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{room.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    room.role === "host" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {room.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    room.isActive ? "text-green-600" : "text-gray-500"
                  }`}>
                    {room.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleJoinRoom(room._id)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
