
// Authentic Chinese gambling content IDs
// Centralized data source for homepage and watch page
export interface StreamItem {
    id: string;
    title: string;
    host: string;
    viewers: string;
    thumbnail: string;
    avatar: string;
    category: string;
    youtubeId: string;
}

export const gamblingStreams: Record<string, StreamItem[]> = {
    mahjong: [
        {
            id: 'mahjong-1',
            title: 'High-Rank Riichi Match (Chinese)',
            host: 'Mahjong Soul Pro',
            viewers: '32.5K',
            thumbnail: 'https://img.youtube.com/vi/il_NHqQ5S70/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=mahjong-pro',
            category: 'Mahjong',
            youtubeId: 'il_NHqQ5S70'
        },
        {
            id: 'mahjong-2',
            title: 'Guobiao Chinese Mahjong',
            host: 'Master Chen',
            viewers: '28.2K',
            thumbnail: 'https://img.youtube.com/vi/BnJuBGBJEFI/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=master-chen',
            category: 'Mahjong',
            youtubeId: 'BnJuBGBJEFI'
        },
        {
            id: 'mahjong-3',
            title: 'Live Mahjong Session',
            host: 'Chengdu Legends',
            viewers: '45.1K',
            thumbnail: 'https://img.youtube.com/vi/XUNUIPmmqoQ/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=chengdu-legends',
            category: 'Mahjong',
            youtubeId: 'XUNUIPmmqoQ'
        },
        {
            id: 'mahjong-4',
            title: 'Competitive Mahjong Highlights',
            host: 'Dragon Streamer',
            viewers: '12.9K',
            thumbnail: 'https://img.youtube.com/vi/J5Uuia8q7zM/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=history-cn',
            category: 'Mahjong',
            youtubeId: 'J5Uuia8q7zM'
        },
        {
            id: 'mahjong-5',
            title: 'Traditional Social Play',
            host: 'Auntie Wang',
            viewers: '8.4K',
            thumbnail: 'https://img.youtube.com/vi/i_zvrIT5kP8/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=auntie-wang',
            category: 'Mahjong',
            youtubeId: 'i_zvrIT5kP8'
        }
    ],
    blackjack: [
        {
            id: 'blackjack-1',
            title: 'High Stakes Live Dealer',
            host: 'Macau VIP',
            viewers: '41.2K',
            thumbnail: 'https://img.youtube.com/vi/_6MMcabFGIA/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=macau-vip',
            category: 'Blackjack',
            youtubeId: '_6MMcabFGIA'
        },
        {
            id: 'blackjack-2',
            title: 'Mandarin Blackjack Gameplay',
            host: 'Professor Li',
            viewers: '15.6K',
            thumbnail: 'https://img.youtube.com/vi/Or2kRFUeJ7o/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=professor-li',
            category: 'Blackjack',
            youtubeId: 'Or2kRFUeJ7o'
        },
        {
            id: 'blackjack-3',
            title: 'Real Money Live Session',
            host: 'Golden Hand',
            viewers: '29.8K',
            thumbnail: 'https://img.youtube.com/vi/FbvsI7gxXRQ/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=golden-hand',
            category: 'Blackjack',
            youtubeId: 'FbvsI7gxXRQ'
        },
        {
            id: 'blackjack-4',
            title: 'Evolution Gaming Mandarin',
            host: 'Live Dealers CN',
            viewers: '62.4K',
            thumbnail: 'https://img.youtube.com/vi/Nq048zl8elw/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=live-dealers',
            category: 'Blackjack',
            youtubeId: 'Nq048zl8elw'
        },
        {
            id: 'blackjack-5',
            title: 'High Limit Vlogger Session',
            host: 'Vegas Andy',
            viewers: '38.1K',
            thumbnail: 'https://img.youtube.com/vi/XFW1u8nFBNw/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=vegas-andy',
            category: 'Blackjack',
            youtubeId: 'XFW1u8nFBNw'
        },
        {
            id: 'blackjack-6',
            title: 'Winning Streak Analysis',
            host: 'Card Counter',
            viewers: '22.7K',
            thumbnail: 'https://img.youtube.com/vi/cHEaC0IMGcw/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=card-counter',
            category: 'Blackjack',
            youtubeId: 'cHEaC0IMGcw'
        },
    ],
    poker: [
        {
            id: 'poker-1',
            title: 'High Stakes Poker Highlight',
            host: 'Poker King',
            viewers: '88.5K',
            thumbnail: 'https://img.youtube.com/vi/Ts8Yh2DZA1Y/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=hcl-cn',
            category: 'Poker',
            youtubeId: 'Ts8Yh2DZA1Y'
        },
        {
            id: 'poker-2',
            title: 'Pro Table Final Table',
            host: 'Big Boss Poker',
            viewers: '42.3K',
            thumbnail: 'https://img.youtube.com/vi/ZyDKC0mO4so/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=big-boss',
            category: 'Poker',
            youtubeId: 'ZyDKC0mO4so'
        },
        {
            id: 'poker-3',
            title: 'Live Cash Game Action',
            host: 'Poker Pro CN',
            viewers: '19.4K',
            thumbnail: 'https://img.youtube.com/vi/pxYGRXNoMpQ/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=poker-pro-cn',
            category: 'Poker',
            youtubeId: 'pxYGRXNoMpQ'
        },
        {
            id: 'poker-4',
            title: 'Heads-Up Championship',
            host: 'Pineapple King',
            viewers: '31.2K',
            thumbnail: 'https://img.youtube.com/vi/6KF1avwPydY/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=pineapple-king',
            category: 'Poker',
            youtubeId: '6KF1avwPydY'
        },
        {
            id: 'poker-5',
            title: 'High-Stakes Showdown',
            host: 'Challenger',
            viewers: '27.6K',
            thumbnail: 'https://img.youtube.com/vi/mmcKrIqLfrk/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=challenger',
            category: 'Poker',
            youtubeId: 'mmcKrIqLfrk'
        }
    ],
    baccarat: [
        {
            id: 'baccarat-1',
            title: 'Live Baccarat Gameplay',
            host: 'Baccarat Master',
            viewers: '51.8K',
            thumbnail: 'https://img.youtube.com/vi/xXj0ov83Wks/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=baccarat-master',
            category: 'Baccarat',
            youtubeId: 'xXj0ov83Wks'
        },
        {
            id: 'baccarat-2',
            title: 'High Limit Session',
            host: 'Vegas Whale',
            viewers: '39.2K',
            thumbnail: 'https://img.youtube.com/vi/5EXlrFDrjUk/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=vegas-whale',
            category: 'Baccarat',
            youtubeId: '5EXlrFDrjUk'
        },
        {
            id: 'baccarat-3',
            title: 'Macau Style Rules Explain',
            host: 'Macau Legend',
            viewers: '76.4K',
            thumbnail: 'https://img.youtube.com/vi/vOBtBZHWzA8/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=macau-legend',
            category: 'Baccarat',
            youtubeId: 'vOBtBZHWzA8'
        },
        {
            id: 'baccarat-4',
            title: 'Real-time Card Squeezing',
            host: 'Squeeze King',
            viewers: '48.9K',
            thumbnail: 'https://img.youtube.com/vi/S3w9Ah-0leQ/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=squeeze-king',
            category: 'Baccarat',
            youtubeId: 'S3w9Ah-0leQ'
        },
        {
            id: 'baccarat-5',
            title: 'Live Session Highlights',
            host: 'Analyst Wu',
            viewers: '25.3K',
            thumbnail: 'https://img.youtube.com/vi/h5NQgePA_5k/maxresdefault.jpg',
            avatar: 'https://i.pravatar.cc/150?u=analyst-wu',
            category: 'Baccarat',
            youtubeId: 'h5NQgePA_5k'
        }
    ],
};

// Flattened list for "Next" logic
export const allStreamsFlat = [
    ...gamblingStreams.mahjong,
    ...gamblingStreams.blackjack,
    ...gamblingStreams.baccarat,
    ...gamblingStreams.poker,
];
