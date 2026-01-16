'use client';

import { HeroSection } from '@/components/ui/HeroSection';
import { StreamRow } from '@/components/ui/StreamRow';
import { useSearchParams } from 'next/navigation';
import { gamblingStreams, StreamItem } from '@/lib/streamData';
import { Suspense } from 'react';

// Hero content for each category
const heroContent = {
  'For You': {
    title: 'High-Rank Mahjong',
    subtitle: 'Official Match Replay',
    category: 'Mahjong / Competitive',
    emoji: '麻',
    description: 'Professional high-rank Riichi Mahjong match with Chinese commentary.',
    host: 'Mahjong Soul Pro',
    viewers: '32.5K',
    youtubeId: 'il_NHqQ5S70', // Updated to verified ID from streamData logic
    image: 'https://img.youtube.com/vi/il_NHqQ5S70/maxresdefault.jpg'
  },
  'Mahjong': {
    title: 'Szechuan Mahjong',
    subtitle: 'Bloody End Rules',
    category: 'Mahjong / Live',
    emoji: '麻',
    description: 'Experience the fast-paced action of Chengdu-style "Bloody End" Mahjong with live table talk.',
    host: 'Chengdu Legends',
    viewers: '45.1K',
    youtubeId: 'XUNUIPmmqoQ',
    image: 'https://img.youtube.com/vi/XUNUIPmmqoQ/maxresdefault.jpg'
  },
  'Baccarat': {
    title: 'Macau VIP Room',
    subtitle: 'Pattern Reading Masterclass',
    category: 'Baccarat / Strategy',
    emoji: '🎴',
    description: 'Learn how pros read the roads and squeeze cards in this authentic Macau-style session.',
    host: 'Macau Legend',
    viewers: '76.4K',
    youtubeId: 'vOBtBZHWzA8',
    image: 'https://img.youtube.com/vi/vOBtBZHWzA8/maxresdefault.jpg'
  },
  'Blackjack': {
    title: 'Evolution Gaming',
    subtitle: 'Mandarin Live Dealer',
    category: 'Blackjack / Live',
    emoji: '🃏',
    description: 'Interact with Mandarin-speaking live dealers in this premium Evolution Gaming lounge.',
    host: 'Live Dealers CN',
    viewers: '62.4K',
    youtubeId: 'Nq048zl8elw',
    image: 'https://img.youtube.com/vi/Nq048zl8elw/maxresdefault.jpg'
  },
  'Poker': {
    title: 'Chinese Poker Heads-Up',
    subtitle: '13-Card Strategy',
    category: 'Poker / 13-Card',
    emoji: '♠️',
    description: 'Watch the Pineapple King take on challengers in high-stakes Open Face Chinese Poker.',
    host: 'Pineapple King',
    viewers: '31.2K',
    youtubeId: '6KF1avwPydY',
    image: 'https://img.youtube.com/vi/6KF1avwPydY/maxresdefault.jpg'
  },
};

function HomeContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  // Normalize category: Sidebar sends 'Mahjong', 'Baccarat'. 
  // We want to map to 'For You' if null.
  const activeCategory = categoryParam || 'For You';
  const dataKey = categoryParam ? categoryParam.toLowerCase() : 'foryou';

  // Get all streams for "For You" tab - Curated Unique Mix
  const allStreams = [
    gamblingStreams.mahjong[0],
    gamblingStreams.blackjack[0],
    gamblingStreams.mahjong[2],
    gamblingStreams.baccarat[0],
    gamblingStreams.poker[0],
    gamblingStreams.blackjack[3],
    gamblingStreams.poker[3],
    gamblingStreams.mahjong[1],
    gamblingStreams.baccarat[2],
    gamblingStreams.blackjack[5],
    gamblingStreams.poker[1],
    gamblingStreams.baccarat[3],
  ];

  // Determine Hero Content
  const currentHero = heroContent[activeCategory as keyof typeof heroContent] || heroContent['For You'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 px-0 md:px-8 pb-10 space-y-2 md:space-y-8 pt-4 md:pt-8">
      {/* Dynamic Hero Section based on active category */}
      <HeroSection {...currentHero} />

      {/* Stream Rows based on active category */}
      <div className="mt-4 md:mt-8 space-y-6">
        {activeCategory === 'For You' && (
          <>
            <StreamRow title="🔥 Hot Tables" streams={allStreams} />
            <StreamRow title="Mahjong 麻將" streams={gamblingStreams.mahjong} />
            <StreamRow title="🎴 Baccarat" streams={gamblingStreams.baccarat} />
            <StreamRow title="🃏 Blackjack" streams={gamblingStreams.blackjack} />
            <StreamRow title="♠️ Poker" streams={gamblingStreams.poker} />
          </>
        )}
        {activeCategory === 'Mahjong' && (
          <StreamRow title="Mahjong 麻將" streams={gamblingStreams.mahjong} />
        )}
        {activeCategory === 'Baccarat' && (
          <StreamRow title="🎴 Baccarat" streams={gamblingStreams.baccarat} />
        )}
        {activeCategory === 'Blackjack' && (
          <StreamRow title="🃏 Blackjack" streams={gamblingStreams.blackjack} />
        )}
        {activeCategory === 'Poker' && (
          <StreamRow title="♠️ Poker" streams={gamblingStreams.poker} />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin text-yellow-500 text-2xl">🐲</div></div>}>
      <HomeContent />
    </Suspense>
  );
}
