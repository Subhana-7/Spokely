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
  const isInitializingRef = useRef(false);

  const [joined, setJoined] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Set<string>>(new Set());

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);
  const localTracks = useRef<{
    audioTrack: IMicrophoneAudioTrack | null;
    videoTrack: ICameraVideoTrack | null;
  }>({ audioTrack: null, videoTrack: null });

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

      if (clientRef.current) {
        if (
          clientRef.current.connectionState === "CONNECTED" ||
          clientRef.current.connectionState === "CONNECTING"
        ) {
          await clientRef.current.leave();
        }
        clientRef.current.removeAllListeners();
        clientRef.current = null; // ensure fresh client next time
      }

      setJoined(false);
      setRemoteUsers(new Set());
    } catch (error) {
      console.error("Error during cleanup:", error);
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  const handleUserPublished = useCallback(
    async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      const client = clientRef.current;
      if (!client) return;

      try {
        await client.subscribe(user, mediaType);

        if (mediaType === "video" && user.videoTrack) {
          let remoteContainer = document.getElementById(
            `remote-user-${user.uid}`
          );
          if (!remoteContainer) {
            remoteContainer = document.createElement("div");
            remoteContainer.id = `remote-user-${user.uid}`;
            remoteContainer.className =
              "w-full h-[200px] sm:h-[250px] lg:h-[300px] bg-black rounded-lg overflow-hidden";
            if (remoteVideoContainerRef.current) {
              remoteVideoContainerRef.current.appendChild(remoteContainer);
            }
          }
          user.videoTrack.play(remoteContainer);
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
        const remoteEl = document.getElementById(`remote-user-${user.uid}`);
        if (remoteEl) remoteEl.remove();
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
    const remoteEl = document.getElementById(`remote-user-${user.uid}`);
    if (remoteEl) remoteEl.remove();
    setRemoteUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(user.uid.toString());
      return newSet;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initCall = async () => {
      if (isInitializingRef.current) return;
      if (!sessionId) {
        if (isMounted) {
          setError("Session ID not found");
          setIsLoading(false);
        }
        return;
      }

      try {
        isInitializingRef.current = true;
        if (isMounted) {
          setIsLoading(true);
          setError(null);
        }

        await cleanup();
        await new Promise((resolve) => setTimeout(resolve, 800));

        // always recreate a fresh client
        clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        const client = clientRef.current;
        AgoraRTC.setLogLevel(4);

        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        client.on("user-left", handleUserLeft);

        const response = await getAgoraToken(sessionId);
        const { appId, token, channelName, uid } = response.data;

        if (!appId || !token || !channelName) {
          throw new Error("Missing required connection parameters");
        }

        await client.join(appId, channelName, token, uid);
        if (!isMounted) return;

        setJoined(true);

        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack(),
        ]);

        if (!isMounted) {
          audioTrack.stop();
          audioTrack.close();
          videoTrack.stop();
          videoTrack.close();
          return;
        }

        localTracks.current = { audioTrack, videoTrack };
        if (localVideoRef.current && videoTrack) {
          videoTrack.play(localVideoRef.current);
        }

        await client.publish([audioTrack, videoTrack]);
      } catch (error) {
        console.error("Error in initCall:", error);
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : "Failed to join call"
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
        isInitializingRef.current = false;
      }
    };

    initCall();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [sessionId, cleanup, handleUserPublished, handleUserUnpublished, handleUserLeft]);

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
        <div className="relative flex-1 shadow-xl rounded-2xl overflow-hidden border border-blue-600/60">
          <div
            ref={localVideoRef}
            className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-blue-950"
          />
          <div className="absolute top-3 left-3 bg-blue-800/70 backdrop-blur-md px-3 py-1 rounded text-sm">
            You {!isVideoOn && "(Video Off)"}
          </div>
        </div>

        <div className="relative flex-1 shadow-xl rounded-2xl overflow-hidden border border-blue-400/60">
          <div
            ref={remoteVideoContainerRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-blue-950 p-2 overflow-auto"
          />
          <div className="absolute top-3 left-3 bg-blue-800/70 backdrop-blur-md px-3 py-1 rounded text-sm">
            {remoteUsers.size > 0
              ? `Remote Users (${remoteUsers.size})`
              : "Waiting for others..."}
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default VideoCall;