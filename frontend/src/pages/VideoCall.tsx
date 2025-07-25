import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { videoCall } from "../services/sessionService";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const VideoCall = () => {
  const { id: sessionId } = useParams();
  const [joined, setJoined] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localTracks = useRef<any[]>([]);

  useEffect(() => {
    const initCall = async () => {
      if (!sessionId) return;
      try {
        const res = await videoCall(sessionId);

        console.log("Agora Token Response", res.data);

        const { appId, token, channelName, uid } = res.data;

        if (
          client.connectionState !== "CONNECTED" &&
          client.connectionState !== "CONNECTING"
        ) {
          await client.join(appId, channelName, token, uid);
        }
        localTracks.current = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracks.current[1].play(localVideoRef.current!);
        await client.publish(localTracks.current);
        setJoined(true);

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video" && user.videoTrack) {
            user.videoTrack.play(remoteVideoRef.current!);
          }
        });
      } catch (err) {
        console.error("Failed to join", err);
      }
    };

    initCall();

    return () => {
      if (joined) {
        localTracks.current.forEach((track) => track.close());
        client.leave();
      }
    };
  }, [sessionId]);

  return (
    <div className="flex gap-4">
      <div ref={localVideoRef} className="w-1/2 h-96 bg-black" />
      <div ref={remoteVideoRef} className="w-1/2 h-96 bg-black" />
    </div>
  );
};

export default VideoCall;
