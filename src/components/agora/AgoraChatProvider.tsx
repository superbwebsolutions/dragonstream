'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

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
    channelName: string;
    roomId?: string;
    children: React.ReactNode;
}

// Module-level singleton to prevent React Strict Mode double initialization
let globalClient: any = null;
let globalClientId: number = 0;
let globalInitPromise: Promise<void> | null = null;

export function AgoraChatProvider({ appKey, token, username, channelName, roomId, children }: AgoraChatProviderProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isRoomJoined, setIsRoomJoined] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [AgoraChat, setAgoraChat] = useState<any>(null);

    // Instance tracking
    const instanceId = useRef(++globalClientId);
    const mountedRef = useRef(true);

    // Target room ID
    const targetRoom = roomId || channelName;

    // Initialize SDK - singleton approach to handle React Strict Mode
    useEffect(() => {
        mountedRef.current = true;
        const myInstanceId = instanceId.current;

        if (!appKey || !token || !username) {
            return;
        }

        const initSdk = async () => {
            // If already initializing or initialized, just attach to existing client
            if (globalInitPromise) {
                await globalInitPromise;
                if (globalClient && mountedRef.current) {
                    console.log(`Agora Chat [${myInstanceId}]: Reusing existing connection`);
                    // Check if already connected
                    if (globalClient.isOpened?.()) {
                        setIsConnected(true);
                        setIsRoomJoined(true);
                    }
                }
                return;
            }

            console.log(`Agora Chat [${myInstanceId}]: Initializing with appKey:`, appKey);
            console.log(`Agora Chat [${myInstanceId}]: Username:`, username);
            console.log(`Agora Chat [${myInstanceId}]: Target Room:`, targetRoom);

            globalInitPromise = (async () => {
                try {
                    const mod = await import('agora-chat');
                    if (!mountedRef.current) return;

                    setAgoraChat(mod.default);

                    // Close any existing client first
                    if (globalClient) {
                        try {
                            globalClient.close();
                        } catch (e) {
                            // Ignore
                        }
                    }

                    const client = new mod.default.connection({
                        appKey: appKey,
                    });
                    globalClient = client;

                    // Set up event handlers
                    client.addEventHandler('connection&message', {
                        onConnected: async () => {
                            if (!mountedRef.current) return;
                            console.log(`Agora Chat [${myInstanceId}]: WebSocket Connected - Now joining room...`);
                            setIsConnected(true);

                            // JOIN ROOM HERE - after connection is fully established
                            if (targetRoom) {
                                console.log(`Agora Chat [${myInstanceId}]: Joining room: ${targetRoom}`);

                                try {
                                    await client.joinChatRoom({ roomId: targetRoom });
                                    if (!mountedRef.current) return;
                                    console.log(`Agora Chat [${myInstanceId}]: Successfully joined room ${targetRoom}`);
                                    setIsRoomJoined(true);
                                } catch (joinErr: any) {
                                    if (joinErr.type === 17 || joinErr.message?.includes('already')) {
                                        console.log(`Agora Chat [${myInstanceId}]: User already in room - OK`);
                                        if (mountedRef.current) setIsRoomJoined(true);
                                    } else {
                                        console.error(`Agora Chat [${myInstanceId}]: Join Room Failed:`, joinErr);
                                        // Retry once after a short delay
                                        setTimeout(async () => {
                                            if (!mountedRef.current) return;
                                            try {
                                                await client.joinChatRoom({ roomId: targetRoom });
                                                if (mountedRef.current) {
                                                    console.log(`Agora Chat [${myInstanceId}]: Retry join successful`);
                                                    setIsRoomJoined(true);
                                                }
                                            } catch (retryErr) {
                                                console.error(`Agora Chat [${myInstanceId}]: Retry join also failed:`, retryErr);
                                            }
                                        }, 1000);
                                    }
                                }
                            }
                        },
                        onDisconnected: () => {
                            // Only reset state if this is still the active instance and mounted
                            if (!mountedRef.current) return;
                            console.log(`Agora Chat [${myInstanceId}]: Disconnected`);
                            // Don't reset state immediately - might be a temporary disconnect
                            // The 206 duplicate login causes a disconnect but then reconnects
                        },
                        onTextMessage: (message: any) => {
                            if (!mountedRef.current) return;
                            console.log(`Agora Chat [${myInstanceId}]: Message received:`, message);
                            // Accept all chatRoom messages
                            if (message.chatType === 'chatRoom') {
                                // Add message if it's not from self (self messages added on send)
                                if (message.from !== username) {
                                    setMessages(prev => [...prev, {
                                        user: message.from || 'Unknown',
                                        text: message.msg,
                                        color: 'text-white',
                                        id: message.id,
                                        isSelf: false,
                                        timestamp: Date.now()
                                    }]);
                                }
                            }
                        },
                        onChatroomEvent: (event: any) => {
                            console.log(`Agora Chat [${myInstanceId}] Room Event:`, event);
                        },
                        onError: (error: any) => {
                            if (error.type === 206) {
                                // Duplicate login - this is expected with React Strict Mode
                                console.warn(`Agora Chat [${myInstanceId}]: 206 Warning (Duplicate Login) - Ignored`);
                                return;
                            }
                            console.error(`Agora Chat [${myInstanceId}] Error:`, error);
                        }
                    });

                    // Open connection (login)
                    console.log(`Agora Chat [${myInstanceId}]: Opening connection for ${username}...`);
                    try {
                        await client.open({
                            user: username,
                            accessToken: token,
                        });
                        console.log(`Agora Chat [${myInstanceId}]: Login/Open completed`);
                    } catch (err: any) {
                        if (err.type === 206) {
                            console.warn(`Agora Chat [${myInstanceId}]: Already logged in (206), setting connected state`);
                            if (mountedRef.current) {
                                setIsConnected(true);
                                // Try to join room anyway
                                if (targetRoom) {
                                    try {
                                        await client.joinChatRoom({ roomId: targetRoom });
                                        if (mountedRef.current) setIsRoomJoined(true);
                                    } catch (e) {
                                        // Might already be in room
                                        if (mountedRef.current) setIsRoomJoined(true);
                                    }
                                }
                            }
                        } else {
                            console.error(`Agora Chat [${myInstanceId}] Login Failed:`, err);
                        }
                    }
                } catch (error) {
                    console.error(`Agora Chat [${myInstanceId}]: Failed to init:`, error);
                }
            })();

            await globalInitPromise;
        };

        initSdk();

        return () => {
            mountedRef.current = false;
            // Don't close the global client on unmount - it's a singleton
            // Only reset the init promise so a fresh mount can reinitialize if needed
            // This handles the React Strict Mode double mount/unmount cycle
        };
    }, [appKey, token, username, targetRoom]);

    // Cleanup on full unmount (not just Strict Mode remount)
    useEffect(() => {
        return () => {
            // Clear messages on true unmount
            setMessages([]);
        };
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!globalClient) {
            console.warn('Chat client not initialized - showing message locally');
            setMessages(prev => [...prev, {
                user: username,
                text: text,
                color: 'text-gray-400',
                isSelf: true,
                pending: true,
                timestamp: Date.now()
            }]);
            return;
        }

        if (!isConnected || !isRoomJoined) {
            console.warn('Chat not fully connected or room not joined. Connected:', isConnected, 'Room joined:', isRoomJoined);
            // Try to send anyway if we have a client
            try {
                const mod = await import('agora-chat');
                const option = {
                    chatType: 'chatRoom' as const,
                    type: 'txt' as const,
                    to: targetRoom,
                    msg: text,
                };
                const msg = mod.default.message.create(option);
                await globalClient.send(msg);
                console.log('Agora Chat: Message sent despite state mismatch');
                setMessages(prev => [...prev, {
                    user: username,
                    text: text,
                    color: 'text-yellow-400',
                    isSelf: true,
                    timestamp: Date.now()
                }]);
                // Fix the state since send succeeded
                setIsConnected(true);
                setIsRoomJoined(true);
                return;
            } catch (e) {
                console.warn('Send attempt failed:', e);
            }

            setMessages(prev => [...prev, {
                user: username,
                text: text,
                color: 'text-gray-400',
                isSelf: true,
                pending: true,
                timestamp: Date.now()
            }]);
            return;
        }

        if (!AgoraChat) {
            console.warn('AgoraChat SDK not loaded');
            return;
        }

        try {
            const option = {
                chatType: 'chatRoom' as const,
                type: 'txt' as const,
                to: targetRoom,
                msg: text,
            };

            console.log('Agora Chat: Sending message to room:', targetRoom);
            const msg = AgoraChat.message.create(option);
            await globalClient.send(msg);
            console.log('Agora Chat: Message sent successfully');

            // Add own message to the list
            setMessages(prev => [...prev, {
                user: username,
                text: text,
                color: 'text-yellow-400',
                isSelf: true,
                timestamp: Date.now()
            }]);
        } catch (e) {
            console.error('Agora Chat: Send failed', e);
            // Still show the message locally but mark as error
            setMessages(prev => [...prev, {
                user: username,
                text: text,
                color: 'text-red-400',
                isSelf: true,
                error: true,
                timestamp: Date.now()
            }]);
        }
    }, [isConnected, isRoomJoined, AgoraChat, targetRoom, username]);

    return (
        <AgoraChatContext.Provider value={{ isConnected: isConnected && isRoomJoined, messages, sendMessage, username }}>
            {children}
        </AgoraChatContext.Provider>
    );
}

export const useAgoraChat = () => {
    const context = useContext(AgoraChatContext);
    if (!context) throw new Error('useAgoraChat must be used within AgoraChatProvider');
    return context;
};
