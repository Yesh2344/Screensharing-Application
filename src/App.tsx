import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { Room } from "./components/Room";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [currentRoomId, setCurrentRoomId] = useState<Id<"rooms"> | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-primary">ScreenShare</h2>
          {currentRoomId && (
            <button
              onClick={() => setCurrentRoomId(null)}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1">
        <Content currentRoomId={currentRoomId} setCurrentRoomId={setCurrentRoomId} />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ 
  currentRoomId, 
  setCurrentRoomId 
}: { 
  currentRoomId: Id<"rooms"> | null;
  setCurrentRoomId: (id: Id<"rooms"> | null) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Authenticated>
        {currentRoomId ? (
          <Room roomId={currentRoomId} />
        ) : (
          <Dashboard onJoinRoom={setCurrentRoomId} />
        )}
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center h-full">
          <div className="w-full max-w-md mx-auto p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">ScreenShare</h1>
              <p className="text-xl text-secondary">Share your screen across devices</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
