import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgoraRTC, {
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { getAgoraToken } from "../services/sessionService";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";

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
  const [_isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<
    Map<string, IAgoraRTCRemoteUser>
  >(new Map());

  const localVideoRef = useRef<HTMLDivElement>(null);
  const localTracks = useRef<{
    audioTrack: IMicrophoneAudioTrack | null;
    videoTrack: ICameraVideoTrack | null;
  }>({
    audioTrack: null,
    videoTrack: null,
  });

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
      setRemoteUsers(new Map());
    } catch (err) {
      console.error("Error during cleanup:", err);
    }
  }, [client]);

  const handleUserPublished = useCallback(
    async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      try {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && user.videoTrack) {
          setRemoteUsers((prev) => {
            const updated = new Map(prev);
            updated.set(user.uid.toString(), user);
            return updated;
          });
        }
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
      } catch (err) {
        console.error("Error handling user published:", err);
      }
    },
    [client]
  );

  const handleUserUnpublished = useCallback(
    (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      if (mediaType === "video") {
        setRemoteUsers((prev) => {
          const updated = new Map(prev);
          updated.delete(user.uid.toString());
          return updated;
        });
      }
    },
    []
  );

  const handleUserLeft = useCallback((user: IAgoraRTCRemoteUser) => {
    setRemoteUsers((prev) => {
      const updated = new Map(prev);
      updated.delete(user.uid.toString());
      return updated;
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
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost"
        ) {
          throw new Error(
            "Camera/Microphone access requires HTTPS or localhost."
          );
        }

        if (
          client.connectionState === "CONNECTED" ||
          client.connectionState === "CONNECTING"
        ) {
          await cleanup();
        }

        const response = await getAgoraToken(sessionId);
        const { appId, token, channelName, uid } = response.data;

        if (!appId || !token || !channelName) {
          throw new Error("Missing required connection parameters");
        }

        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        client.on("user-left", handleUserLeft);

        if (client.connectionState === "DISCONNECTED") {
          await client.join(appId, channelName, token, uid);
          if (isMounted) setJoined(true);
        }

        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack({
            encoderConfig: "720p_1",
            optimizationMode: "motion",
          }),
        ]);

        if (!isMounted) return;

        localTracks.current = { audioTrack, videoTrack };
        if (localVideoRef.current && videoTrack) {
          videoTrack.play(localVideoRef.current);
        }
        await client.publish([audioTrack, videoTrack]);
      } catch (err: any) {
        console.error("Failed to initialize call:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to join call");
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
    const videoTrack = localTracks.current.videoTrack;
    if (!videoTrack || !joined) return;

    if (isVideoOn) {
      await videoTrack.setEnabled(false);

      // IMPORTANT: clear last frame
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = "";
      }
    } else {
      await videoTrack.setEnabled(true);

      // replay video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }
    }

    setIsVideoOn((prev) => !prev);
  }, [isVideoOn, joined]);

  const toggleMic = useCallback(async () => {
    const audioTrack = localTracks.current.audioTrack;
    if (!audioTrack || !joined) return;

    if (isMicOn) {
      await audioTrack.setMuted(true);
    } else {
      await audioTrack.setMuted(false);
    }

    setIsMicOn((prev) => !prev);
  }, [isMicOn, joined]);

  const endCall = useCallback(async () => {
    await cleanup();
    navigate(-1);
  }, [cleanup, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-red-600 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Video Grid */}
      <div
        className="flex-1 gap-2 p-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        {/* Local video */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div ref={localVideoRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs">
            You {!isVideoOn && "(Video Off)"}
          </div>
        </div>

        {/* Remote users */}
        {Array.from(remoteUsers.values()).map((user) => (
          <div
            key={user.uid}
            className="relative bg-black rounded-lg overflow-hidden"
            ref={(el) => {
              if (el && user.videoTrack) user.videoTrack.play(el);
            }}
          >
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs">
              User {user.uid}
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-center gap-6 p-4 bg-gray-800">
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${
            isVideoOn
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-600 hover:bg-red-500"
          }`}
          title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
        >
          {isVideoOn ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full ${
            isMicOn
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-red-600 hover:bg-red-500"
          }`}
          title={isMicOn ? "Mute Mic" : "Unmute Mic"}
        >
          {isMicOn ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-700 hover:bg-red-600"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
