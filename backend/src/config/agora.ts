import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const APP_ID = process.env.AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export const generateAgoraToken = (
  channelName: string,
  userAccount: string
) => {
  try {
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithAccount(
  APP_ID,
  APP_CERTIFICATE,
  channelName,
  userAccount,          
  RtcRole.PUBLISHER,
  privilegeExpiredTs
);


    return token;
  } catch (error) {
    console.log("error connecting agora", error);
  }
};
