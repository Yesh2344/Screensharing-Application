import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ScreenShare } from "./ScreenShare";
import { Chat } from "./Chat";
import { FileShare } from "./FileShare";
import { ParticipantsList } from "./ParticipantsList";

interface RoomProps {
  roomId: Id<"rooms">;
}

export function Room({ roomId }: RoomProps) {
  const [activeTab, setActiveTab] = useState<"screen" | "chat" | "files">("screen");
  
  const roomDetails = useQuery(api.rooms.getRoomDetails, { roomId });
  const leaveRoom = useMutation(api.rooms.leaveRoom);

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      leaveRoom({ roomId });
    };
  }, [roomId, leaveRoom]);

  if (!roomDetails) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const connectedParticipants = roomDetails.participants.filter(p => p.isConnected);

  return (
    <div className="h-full flex flex-col">
      {/* Room Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{roomDetails.name}</h1>
            <p className="text-sm text-gray-600">
              {connectedParticipants.length} participant{connectedParticipants.length !== 1 ? 's' : ''} connected
            </p>
          </div>
          <ParticipantsList participants={connectedParticipants} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8 px-6">
          {[
            { id: "screen", label: "Screen Share", icon: "🖥️" },
            { id: "chat", label: "Chat", icon: "💬" },
            { id: "files", label: "Files", icon: "📁" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "screen" && <ScreenShare roomId={roomId} />}
        {activeTab === "chat" && <Chat roomId={roomId} />}
        {activeTab === "files" && <FileShare roomId={roomId} />}
      </div>
    </div>
  );
}
