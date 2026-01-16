import { NextRequest, NextResponse } from 'next/server';
import { ChatTokenBuilder } from 'agora-token';

/**
 * API to register a Chat user and return a token.
 * Agora Chat requires users to be registered before they can log in.
 */
export async function POST(request: NextRequest) {
    try {
        const { username, channelName } = await request.json();

        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;
        // Parse App Key to get Org and App names
        const appKey = process.env.NEXT_PUBLIC_AGORA_CHAT_APP_KEY || '611273786#1648138';
        const [orgName, appName] = appKey.split('#');
        const restApiHost = 'https://a61.chat.agora.io'; // From Agora Console

        if (!appId || !appCertificate || !orgName || !appName) {
            return NextResponse.json(
                { error: 'Agora credentials not configured correctly' },
                { status: 500 }
            );
        }

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // Generate App Token for REST API authentication
        const expirationTimeInSeconds = 3600;
        const appToken = ChatTokenBuilder.buildAppToken(
            appId,
            appCertificate,
            expirationTimeInSeconds
        );

        // 1. Ensure User Registration
        console.log('Ensuring Chat user registration:', username);
        const registerUrl = `${restApiHost}/${orgName}/${appName}/users`;
        try {
            const registerResponse = await fetch(registerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${appToken}`,
                },
                body: JSON.stringify({ username }),
            });

            const registerData = await registerResponse.json();
            if (!registerResponse.ok) {
                if (registerData.error === 'duplicate_unique_property_exists' ||
                    registerData.error_description?.includes('already exists')) {
                    console.log('User already exists:', username);
                } else {
                    console.error('Failed to register user:', registerData);
                }
            } else {
                console.log('User registered successfully:', username);
            }
        } catch (regErr) {
            console.error('Error during registration fetch:', regErr);
        }

        // 2. Ensure Chat Room existence for channelName
        let roomId = '';
        if (channelName) {
            console.log('Ensuring Chat Room for channel:', channelName);
            const roomsUrl = `${restApiHost}/${orgName}/${appName}/chatrooms`;

            try {
                // List rooms to see if it exists - increase limit to find older rooms
                const listRes = await fetch(`${roomsUrl}?limit=500`, {
                    headers: { 'Authorization': `Bearer ${appToken}` }
                });
                const listData = await listRes.json();

                // Find the existing room by name (channelName)
                // We pick the earliest one if multiple exist for consistency
                const existingRoom = listData.data?.find((r: any) => r.name === channelName);

                if (existingRoom) {
                    roomId = existingRoom.id;
                    console.log('Found existing room:', roomId, 'for channel:', channelName);
                } else {
                    // Create new room if none found
                    console.log('Creating new chat room for channel:', channelName);
                    const createRes = await fetch(roomsUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${appToken}`,
                        },
                        body: JSON.stringify({
                            name: channelName,
                            description: `Shared chat room for channel ${channelName}`,
                            owner: username,
                            maxusers: 5000
                        }),
                    });
                    const createData = await createRes.json();
                    if (createRes.ok && createData.data) {
                        roomId = createData.data.id;
                        console.log('Created room successfully:', roomId);
                    } else {
                        // If someone else created it in the few seconds between our check and create,
                        // retry finding it once.
                        const retryRes = await fetch(`${roomsUrl}?limit=500`, {
                            headers: { 'Authorization': `Bearer ${appToken}` }
                        });
                        const retryData = await retryRes.json();
                        const retryRoom = retryData.data?.find((r: any) => r.name === channelName);
                        if (retryRoom) {
                            roomId = retryRoom.id;
                        }
                    }
                }
            } catch (roomErr) {
                console.error('Error during room management:', roomErr);
            }
        }

        // Generate User Token for chat login
        const userToken = ChatTokenBuilder.buildUserToken(
            appId,
            appCertificate,
            username,
            expirationTimeInSeconds
        );

        return NextResponse.json({
            success: true,
            username,
            token: userToken,
            roomId: roomId || channelName, // Return roomId if we got one
        });
    } catch (error) {
        console.error('Chat registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register chat user' },
            { status: 500 }
        );
    }
}
