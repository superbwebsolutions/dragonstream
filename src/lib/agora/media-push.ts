import { agoraConfig } from './config';

const REGION = 'na'; // Default region: North America
const BASE_URL = `https://api.agora.io/${REGION}/v1/projects`;

/**
 * Creates a basic Authorization header for Agora REST API
 */
const getAuthHeader = () => {
    const { customerId, customerSecret } = agoraConfig;
    const auth = Buffer.from(`${customerId}:${customerSecret}`).toString('base64');
    return {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
    };
};

export interface StartMediaPushParams {
    channelName: string;
    rtmpUrl: string;
    // Width/height/fps defaults will be handled if not provided
    width?: number;
    height?: number;
    fps?: number;
}

export async function startMediaPush({
    channelName,
    rtmpUrl,
    width = 1280,
    height = 720,
    fps = 15,
}: StartMediaPushParams) {
    const appId = agoraConfig.appId;
    const url = `${BASE_URL}/${appId}/rtmp-converters`;

    // We use a converter name based on channel to ensure uniqueness/traceability
    // Agora recommends using unique names.
    const converterName = `push_${channelName}_${Date.now()}`;

    const body = {
        converter: {
            name: converterName,
            transcodeOptions: {
                rtcChannel: channelName,
                audioOptions: {
                    codecProfile: 'LC-AAC',
                    sampleRate: 48000,
                    bitrate: 128,
                    audioChannels: 2,
                },
                videoOptions: {
                    canvas: {
                        width,
                        height,
                        color: 0x000000,
                    },
                    layout: [
                        {
                            rtcStreamUid: 0, // 0 usually captures the mixed stream or primary host if single host
                            region: {
                                xPos: 0,
                                yPos: 0,
                                width,
                                height,
                                zIndex: 1,
                            },
                            fillMode: 'fit',
                        },
                    ],
                    codecProfile: 'High',
                    frameRate: fps,
                    gop: 30,
                    bitrate: 1000,
                },
            },
            rtmpUrl,
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Media Push Start Error:', errorText);
        throw new Error(`Failed to start media push: ${response.status} ${response.statusText}`);
    }

    // Returns the converter which contains the ID needed to stop it
    return response.json();
}

export async function stopMediaPush(channelName: string) {
    const appId = agoraConfig.appId;

    // First, we need to find the running converter for this channel
    // In a real app, you should save the converterName/ID in your database when you start it.
    // For this demo, we'll list converters and find the one for the channel.

    const listUrl = `https://api.agora.io/v1/projects/${appId}/rtmp-converters`;

    const listResponse = await fetch(listUrl, {
        method: 'GET',
        headers: getAuthHeader(),
    });

    if (!listResponse.ok) {
        throw new Error('Failed to list converters');
    }

    const data = await listResponse.json();
    const converters = data.converters || [];

    // Find converter matching our channel
    // Note: transcodeOptions.rtcChannel is where we look
    const targetConverter = converters.find(
        (c: any) => c.transcodeOptions?.rtcChannel === channelName
    );

    if (!targetConverter) {
        // If no converter found, maybe it's already stopped
        return { message: 'No active converter found for channel' };
    }

    // Delete the converter
    const deleteUrl = `${BASE_URL}/${appId}/rtmp-converters/${targetConverter.name}`;

    const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });

    if (!deleteResponse.ok) {
        const err = await deleteResponse.text();
        console.error('Media Push Stop Error:', err);
        throw new Error('Failed to stop media push');
    }

    return await deleteResponse.json();
}
