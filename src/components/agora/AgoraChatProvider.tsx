'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
// import type { Connection } from 'agora-chat'; // Skipping type import to avoid TS errors
const Connection: any = null;

interface AgoraChatContextType {
    isConnected: boolean;
    messages: any[];
    sendMessage: (text: string) => Promise<void>;
    username?: string;
}

const AgoraChatContext = createContext<AgoraChatContextType | undefined>(undefined);

interface AgoraChatProviderProps {
    appKey: string;
    token: string;
    username: string;
    channelName: string; // Original channel name
    roomId?: string; // New: Specific Agora Chat Room ID
    children: React.ReactNode;
}

export function AgoraChatProvider({ appKey, token, username, channelName, roomId, children }: AgoraChatProviderProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const clientRef = useRef<any>(null);
    const [AgoraChat, setAgoraChat] = useState<any>(null);

    // Initialize SDK
    useEffect(() => {
        const initSdk = async () => {
            console.log('Agora Chat: Initializing with appKey:', appKey);
            console.log('Agora Chat: Username:', username);
            console.log('Agora Chat: Token (first 20 chars):', token?.substring(0, 20) + '...');

            if (!appKey) {
                console.error('Agora Chat: No appKey provided!');
                return;
            }

            try {
                const mod = await import('agora-chat');
                setAgoraChat(mod.default);

                const client = new mod.default.connection({
                    appKey: appKey,
                });
                clientRef.current = client;



                client.addEventHandler('connection&message', {
                    onConnected: () => {
                        console.log('Agora Chat: Connected successfully!');
                        setIsConnected(true);
                    },
                    onDisconnected: () => {
                        console.log('Agora Chat: Disconnected');
                        setIsConnected(false);
                    },
                    onTextMessage: (message: any) => {
                        console.log('Agora Chat: Message received', message);
                        setMessages(prev => [...prev, {
                            user: message.from || 'Unknown',
                            text: message.msg,
                            color: 'text-white', // Default color
                            id: message.id
                        }]);
                    },
                    onError: (error: any) => {
                        // Type 206: "User logged in on another device". 
                        // In dev (HMR) or rapid re-mounts, this is common. We can ignore it if we just reconnected.
                        if (error.type === 206) {
                            console.warn('Agora Chat: 206 Warning (Duplicate Login - Expected in Dev)');
                            return;
                        }
                        console.error('Agora Chat Error:', JSON.stringify(error, null, 2));
                        if (error?.type === 1) console.error('Token expired or invalid');
                    }
                });

                // Login
                if (token && username) {
                    // Small delay to ensure previous instance (if any) is fully closed/logged out on server
                    await new Promise(r => setTimeout(r, 500));

                    console.log('Agora Chat: Attempting login...');
                    try {
                        await client.open({
                            user: username,
                            accessToken: token,
                        });
                        console.log('Agora Chat: Login call completed');

                        // Join the chat room
                        try {
                            const targetRoom = roomId || channelName;
                            if (targetRoom) {
                                await client.joinChatRoom({ roomId: targetRoom });
                                console.log(`Agora Chat: Joined room ${targetRoom}`);
                            }
                        } catch (joinErr: any) {
                            // Suppress "User already in room" or similar if it's fine
                            console.warn('Agora Chat: Join Room issue', joinErr);
                        }

                    } catch (err: any) {
                        // If 206 happens during OPEN, it throws. Catch it here too.
                        if (err.type === 206) {
                            console.warn('Agora Chat: Login 206 (Already logged in), proceeding as connected.');
                            setIsConnected(true);
                        } else {
                            console.error('Agora Chat Login Failed:', JSON.stringify(err, null, 2));
                        }
                    }
                } else {
                    console.warn('Agora Chat: Missing token or username for login');
                }
            } catch (error) {
                console.error('Failed to init Agora Chat:', error);
            }
        };

        if (appKey && token && username) {
            initSdk();
        } else {
            console.warn('Agora Chat: Missing required props - appKey:', !!appKey, 'token:', !!token, 'username:', !!username);
        }

        return () => {
            if (clientRef.current) {
                // leave room before closing?
                // clientRef.current.leaveChatRoom({ roomId: channelName });
                clientRef.current.close();
            }
        };
    }, [appKey, token, username, channelName]);

    // Cleanup messsages on channel/room change
    useEffect(() => {
        setMessages([]);
    }, [channelName, roomId]);

    const sendMessage = async (text: string) => {
        if (!clientRef.current || !isConnected) {
            console.warn('Chat not connected');
            return;
        }

        if (!AgoraChat) return;

        // Try to send to a chat room if we joined one, otherwise P2P or throw
        // For this demo, we assume we might need to join a room first. 
        // Since we don't have a roomId, we will simulate the behavior or try to send to "channelName" if it was a user? 
        // THIS IS A LIMITATION: We need a valid 'refresh' of the room strategy.

        // MVP: Just Local Echo + Console Log because we lack a real Room ID
        // But the user asked for "Real Integration".
        // I'll try to send a broadcast message? No.

        // Let's try to send to the roomId if available, otherwise fallback to channelName
        try {
            const target = roomId || channelName;
            const option = {
                chatType: 'chatRoom',
                type: 'txt',
                to: target,
                msg: text,
            };

            const msg = AgoraChat.message.create(option);
            await clientRef.current.send(msg);

            setMessages(prev => [...prev, {
                user: username,
                text: text,
                color: 'text-yellow-400',
                isSelf: true
            }]);
        } catch (e) {
            console.error('Send failed', e);
            // Fallback: Echo locally for demo feel even if network fails (so UI doesn't break)
            setMessages(prev => [...prev, {
                user: username,
                text: text,
                color: 'text-yellow-400',
                isSelf: true,
                error: true
            }]);
        }
    };

    return (
        <AgoraChatContext.Provider value={{ isConnected, messages, sendMessage, username }}>
            {children}
        </AgoraChatContext.Provider>
    );
}

export const useAgoraChat = () => {
    const context = useContext(AgoraChatContext);
    if (!context) throw new Error('useAgoraChat must be used within AgoraChatProvider');
    return context;
};
