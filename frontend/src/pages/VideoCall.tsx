import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgoraRTC, {
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { getAgoraToken } from "../services/sessionService";

const VideoCall = () => {
  const { id: sessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  }

  const client = clientRef.current;
  const [joined, setJoined] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Set<string>>(new Set());

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localTracks = useRef<{
    audioTrack: IMicrophoneAudioTrack | null;
    videoTrack: ICameraVideoTrack | null;
  }>({ audioTrack: null, videoTrack: null });

  // cleanup function
  const cleanup = useCallback(async () => {
    try {
      if (localTracks.current.audioTrack) {
        localTracks.current.audioTrack.stop();
        localTracks.current.audioTrack.close();
        localTracks.current.audioTrack = null;
      }
      if (localTracks.current.videoTrack) {
        localTracks.current.videoTrack.stop();
        localTracks.current.videoTrack.close();
        localTracks.current.videoTrack = null;
      }
      if (
        client.connectionState === "CONNECTED" ||
        client.connectionState === "CONNECTING"
      ) {
        await client.leave();
      }
      client.removeAllListeners();
      setJoined(false);
      setRemoteUsers(new Set());
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }, [client]);

  const handleUserPublished = useCallback(
    async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      try {
        await client.subscribe(user, mediaType);
        if (
          mediaType === "video" &&
          user.videoTrack &&
          remoteVideoRef.current
        ) {
          user.videoTrack.play(remoteVideoRef.current);
          setRemoteUsers((prev) => new Set(prev).add(user.uid.toString()));
        }
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
      } catch (error) {
        console.error("Error handling user published:", error);
      }
    },
    []
  );

  const handleUserUnpublished = useCallback(
    (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      if (mediaType === "video") {
        setRemoteUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(user.uid.toString());
          return newSet;
        });
      }
    },
    []
  );

  const handleUserLeft = useCallback((user: IAgoraRTCRemoteUser) => {
    setRemoteUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(user.uid.toString());
      return newSet;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initCall = async () => {
      if (!sessionId) {
        if (isMounted) {
          setError("Session ID not found");
          setIsLoading(false);
        }
        return;
      }
      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
        }
        if (
          client.connectionState === "CONNECTED" ||
          client.connectionState === "CONNECTING"
        ) {
          await cleanup();
        }
        const response = await getAgoraToken(sessionId);
        const { appId, token, channelName, uid } = response.data;
        if (!appId || !token || !channelName)
          throw new Error("Missing required connection parameters");

        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        client.on("user-left", handleUserLeft);

        if (client.connectionState === "DISCONNECTED") {
          await client.join(appId, channelName, token, uid);
          if (isMounted) setJoined(true);
        }

        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: "music_standard",
          }),
          AgoraRTC.createCameraVideoTrack({
            optimizationMode: "motion",
            encoderConfig: "720p_1",
          }),
        ]);
        if (!isMounted) return;

        localTracks.current = { audioTrack, videoTrack };
        if (localVideoRef.current && videoTrack) {
          videoTrack.play(localVideoRef.current);
        }
        await client.publish([audioTrack, videoTrack]);
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : "Failed to join call"
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    initCall();
    return () => {
      isMounted = false;
      cleanup();
    };
  }, [
    sessionId,
    handleUserPublished,
    handleUserUnpublished,
    handleUserLeft,
    cleanup,
  ]);

  const toggleVideo = useCallback(async () => {
    if (!localTracks.current.videoTrack || !joined) return;
    await localTracks.current.videoTrack.setEnabled(!isVideoOn);
    setIsVideoOn(!isVideoOn);
  }, [isVideoOn, joined]);

  const toggleMic = useCallback(async () => {
    if (!localTracks.current.audioTrack || !joined) return;
    await localTracks.current.audioTrack.setEnabled(!isMicOn);
    setIsMicOn(!isMicOn);
  }, [isMicOn, joined]);

  const endCall = useCallback(async () => {
    await cleanup();
    navigate(-1);
  }, [cleanup, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-black text-white">
        <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 shadow-lg">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center p-6 min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-black text-white">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl justify-center">
        {/* Local Video */}
        <div className="relative flex-1 shadow-xl rounded-2xl overflow-hidden border border-blue-600/60">
          <div
            ref={localVideoRef}
            className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-blue-950"
          />
          <div className="absolute top-3 left-3 bg-blue-800/70 backdrop-blur-md px-3 py-1 rounded text-sm">
            You {!isVideoOn && "(Video Off)"}
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative flex-1 shadow-xl rounded-2xl overflow-hidden border border-blue-400/60">
          <div
            ref={remoteVideoRef}
            className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-blue-950"
          />
          <div className="absolute top-3 left-3 bg-blue-800/70 backdrop-blur-md px-3 py-1 rounded text-sm">
            {remoteUsers.size > 0
              ? `Remote User (${remoteUsers.size})`
              : "Waiting for others..."}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={toggleVideo}
          disabled={!joined || isLoading}
          className={`px-6 py-3 rounded-lg font-semibold shadow-md transition ${
            isVideoOn
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          } disabled:opacity-40`}
        >
          {isVideoOn ? "Turn Video Off" : "Turn Video On"}
        </button>

        <button
          onClick={toggleMic}
          disabled={!joined || isLoading}
          className={`px-6 py-3 rounded-lg font-semibold shadow-md transition ${
            isMicOn
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          } disabled:opacity-40`}
        >
          {isMicOn ? "Mute Mic" : "Unmute Mic"}
        </button>

        <button
          onClick={endCall}
          disabled={isLoading}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow-md transition disabled:opacity-40"
        >
          End Call
        </button>
      </div>

      {/* Status */}
      <div className="flex flex-col items-center gap-2 mt-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting to call...</span>
          </div>
        )}
        {joined && !isLoading && (
          <div className="flex items-center gap-6 text-sm">
            <span
              className={`flex items-center gap-2 ${
                joined ? "text-green-400" : "text-red-400"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  joined ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              {joined ? "Connected" : "Disconnected"}
            </span>
            <span
              className={`flex items-center gap-2 ${
                isVideoOn ? "text-green-400" : "text-red-400"
              }`}
            >
              📹 {isVideoOn ? "Video On" : "Video Off"}
            </span>
            <span
              className={`flex items-center gap-2 ${
                isMicOn ? "text-green-400" : "text-red-400"
              }`}
            >
              🎤 {isMicOn ? "Mic On" : "Mic Off"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
