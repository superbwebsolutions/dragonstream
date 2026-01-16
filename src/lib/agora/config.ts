export const agoraConfig = {
  appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
  appCertificate: process.env.AGORA_APP_CERTIFICATE || '',
  customerId: process.env.AGORA_API_KEY || '',
  customerSecret: process.env.AGORA_API_SECRET || '',
};

// Client configuration for broadcast streaming
export const clientConfig = {
  mode: 'live' as const,
  codec: 'vp8' as const,
};

// Audience latency levels
export const AudienceLatencyLevel = {
  AUDIENCE_LEVEL_LOW_LATENCY: 1,      // For broadcast streaming (low latency)
  AUDIENCE_LEVEL_ULTRA_LOW_LATENCY: 2, // For interactive live streaming
} as const;
