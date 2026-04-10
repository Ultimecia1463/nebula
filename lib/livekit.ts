const getRequiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const getLiveKitConfig = () => ({
  apiKey: getRequiredEnv("LIVEKIT_API_KEY"),
  apiSecret: getRequiredEnv("LIVEKIT_API_SECRET"),
  serverUrl: getRequiredEnv("LIVEKIT_URL"),
});

export const getLiveKitRoomName = (channelId: string) => `channel-${channelId}`;
