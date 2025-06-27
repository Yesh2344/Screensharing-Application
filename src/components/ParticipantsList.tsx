interface Participant {
  _id: string;
  role: "host" | "viewer";
  isConnected: boolean;
  user: {
    name?: string;
    email?: string;
  } | null;
}

interface ParticipantsListProps {
  participants: Participant[];
}

export function ParticipantsList({ participants }: ParticipantsListProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Participants:</span>
      <div className="flex -space-x-2">
        {participants.slice(0, 5).map((participant) => (
          <div
            key={participant._id}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white ${
              participant.role === "host" ? "bg-blue-500" : "bg-green-500"
            }`}
            title={`${participant.user?.name || participant.user?.email || "Unknown"} (${participant.role})`}
          >
            {participant.user?.name?.[0] || participant.user?.email?.[0] || "?"}
          </div>
        ))}
        {participants.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
            +{participants.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
