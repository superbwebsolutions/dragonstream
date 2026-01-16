'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');

    // Hide sidebar on watch/broadcast pages
    if (pathname.startsWith('/watch') || pathname.startsWith('/broadcast')) {
        return null;
    }

    const navItems = [
        { label: 'For You', href: '/', icon: '🏠', active: pathname === '/' && !currentCategory },
        { label: 'Mahjong', href: '/?category=Mahjong', icon: '🀄', active: currentCategory === 'Mahjong' },
        { label: 'Baccarat', href: '/?category=Baccarat', icon: '🎴', active: currentCategory === 'Baccarat' },
        { label: 'Blackjack', href: '/?category=Blackjack', icon: '🃏', active: currentCategory === 'Blackjack' },
        { label: 'Poker', href: '/?category=Poker', icon: '♠️', active: currentCategory === 'Poker' },
    ];

    return (
        <aside className="w-64 bg-gray-950 border-r border-yellow-600/20 flex flex-col fixed inset-y-0 left-0 z-40 hidden md:flex">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
                    🐲
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-wide">Dragon Live</h1>
                    <p className="text-xl text-yellow-500 font-bold ml-0.5">龍播</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${item.active
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' // Active State
                                : 'text-gray-400 hover:bg-white/5 hover:text-white' // Inactive State
                            }`}
                    >
                        <span className={`text-xl transition-transform group-hover:scale-110 ${item.active ? 'scale-110' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                        {item.active && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Footer Info (Optional, keeping it simple as requested) */}
            <div className="p-6 text-xs text-gray-600/50 mt-auto">
                <p>&copy; 2026 Dragon Live 龍播</p>
            </div>
        </aside>
    );
}
