import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface FileShareProps {
  roomId: Id<"rooms">;
}

export function FileShare({ roomId }: FileShareProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = useQuery(api.messages.getRoomMessages, { roomId }) || [];
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const sendFileMessage = useMutation(api.messages.sendFileMessage);

  const fileMessages = messages.filter(msg => msg.type === "file");

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Generate upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Upload failed: ${result.statusText}`);
        }

        const { storageId } = await result.json();

        // Send file message
        await sendFileMessage({
          roomId,
          fileId: storageId,
          fileName: file.name,
        });

        toast.success(`${file.name} uploaded successfully!`);
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">File Sharing</h2>
        <p className="text-gray-600">Share files with other participants in this room</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-4xl mb-4">📁</div>
        <p className="text-lg font-medium mb-2">
          {isDragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-gray-500 mb-4">or</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Choose Files"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="font-medium mb-4">Shared Files ({fileMessages.length})</h3>
        {fileMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📂</div>
            <p>No files shared yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fileMessages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📄</span>
                    </div>
                    <div>
                      <p className="font-medium">{msg.fileName}</p>
                      <p className="text-sm text-gray-500">
                        Shared by {msg.user?.name || msg.user?.email || "Unknown"} •{" "}
                        {new Date(msg._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {msg.fileUrl && (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
