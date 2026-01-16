'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function MobileNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');

    // Hide on watch/broadcast pages
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-lg border-t border-yellow-600/20 z-50 pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 p-2 min-w-[64px] ${item.active ? 'text-yellow-400' : 'text-gray-500'
                            }`}
                    >
                        <span className={`text-xl ${item.active ? 'scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]' : ''} transition-all`}>
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
