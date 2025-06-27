import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface ScreenShareProps {
  roomId: Id<"rooms">;
}

export function ScreenShare({ roomId }: ScreenShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const signals = useQuery(api.signaling.getSignals, { roomId });
  const sendSignal = useMutation(api.signaling.sendSignal);
  const markSignalProcessed = useMutation(api.signaling.markSignalProcessed);
  const roomDetails = useQuery(api.rooms.getRoomDetails, { roomId });

  const isHost = roomDetails?.participants.find(p => p.isConnected)?.role === "host";

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Initialize peer connection
  const initializePeerConnection = () => {
    const pc = new RTCPeerConnection(rtcConfig);
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          roomId,
          type: "ice-candidate",
          data: JSON.stringify(event.candidate),
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsConnecting(false);
        toast.success("Connected to peer!");
      } else if (pc.connectionState === "failed") {
        setError("Connection failed");
        setIsConnecting(false);
      }
    };

    return pc;
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = initializePeerConnection();
      peerConnectionRef.current = pc;

      // Add stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create offer if host
      if (isHost) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        await sendSignal({
          roomId,
          type: "offer",
          data: JSON.stringify(offer),
        });
      }

      setIsSharing(true);

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

    } catch (err) {
      console.error("Error starting screen share:", err);
      setError("Failed to start screen sharing. Please check permissions.");
      setIsConnecting(false);
    }
  };

  // Stop screen sharing
  const stopScreenShare = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsSharing(false);
    setIsConnecting(false);
    setError(null);
  };

  // Handle signaling messages
  useEffect(() => {
    if (!signals || !peerConnectionRef.current) return;

    signals.forEach(async (signal) => {
      try {
        const data = JSON.parse(signal.data);
        const pc = peerConnectionRef.current!;

        switch (signal.type) {
          case "offer":
            if (!isHost) {
              await pc.setRemoteDescription(data);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              
              await sendSignal({
                roomId,
                type: "answer",
                data: JSON.stringify(answer),
              });
            }
            break;

          case "answer":
            if (isHost) {
              await pc.setRemoteDescription(data);
            }
            break;

          case "ice-candidate":
            await pc.addIceCandidate(data);
            break;
        }

        await markSignalProcessed({ signalId: signal._id });
      } catch (err) {
        console.error("Error handling signal:", err);
      }
    });
  }, [signals, isHost, roomId, sendSignal, markSignalProcessed]);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Screen Sharing</h2>
        <div className="flex gap-3">
          {!isSharing ? (
            <button
              onClick={startScreenShare}
              disabled={isConnecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Start Sharing"}
            </button>
          ) : (
            <button
              onClick={stopScreenShare}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Stop Sharing
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Local Video (Your Screen) */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-800 text-white text-sm font-medium">
            Your Screen
          </div>
          <div className="aspect-video relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            {!isSharing && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🖥️</div>
                  <p>Click "Start Sharing" to share your screen</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remote Video (Shared Screen) */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-800 text-white text-sm font-medium">
            Shared Screen
          </div>
          <div className="aspect-video relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">👀</div>
                <p>Waiting for screen share...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>💡 <strong>Tip:</strong> Make sure to allow screen sharing permissions when prompted.</p>
        <p>🔒 All connections are peer-to-peer and encrypted for your security.</p>
      </div>
    </div>
  );
}
