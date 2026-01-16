import Link from 'next/link';

interface HeroProps {
    title: string;
    subtitle: string;
    category: string;
    emoji: string;
    description: string;
    host: string;
    viewers: string;
    youtubeId: string;
    image: string;
}

export function HeroSection({ title, subtitle, category, emoji, description, host, viewers, youtubeId, image }: HeroProps) {
    return (
        <div className="relative w-full aspect-[4/5] md:aspect-[21/9] rounded-none md:rounded-3xl overflow-hidden group mt-4 md:mt-0">
            {/* Background Image */}
            <img
                src={image.replace('hqdefault', 'maxresdefault')}
                alt={`${subtitle} - ${title}`}
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
            />

            {/* Dark overlay - increased opacity for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40 z-10"></div>

            {/* Additional overlay for rounded container to prevent cut-off */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 md:from-black/30 to-transparent z-10"></div>

            {/* Decorative accent overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 via-transparent to-red-900/10 z-10"></div>

            {/* Content Overlay - positioned lower on desktop */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 flex flex-col items-start gap-3 md:gap-4">
                {/* Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        Live Now
                    </span>
                    <span className="text-white text-sm font-medium backdrop-blur-md bg-black/50 px-3 py-1 rounded-full border border-white/20">
                        {category}
                    </span>
                    <span className="hidden md:flex text-white/80 text-sm font-medium backdrop-blur-md bg-black/50 px-3 py-1 rounded-full border border-white/10 items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {viewers} watching
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight max-w-2xl drop-shadow-2xl">
                    {subtitle}: <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500">
                        {title}
                    </span>
                </h1>

                {/* Description */}
                <p className="text-gray-200 text-sm md:text-lg max-w-xl line-clamp-2 md:line-clamp-none drop-shadow-lg">
                    {description}
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-3 md:gap-4 mt-2">
                    <Link
                        href={`/watch/${youtubeId}?platform=youtube&title=${encodeURIComponent(subtitle + ': ' + title)}`}
                        className="gradient-gold px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-yellow-900/30 text-sm md:text-base"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                        Watch Now
                    </Link>
                    <button className="bg-white/10 backdrop-blur-md text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium border border-white/20 hover:bg-white/20 hover:border-white/40 transition-colors flex items-center gap-2 text-sm md:text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Follow
                    </button>
                </div>

                {/* Host Info */}
                <div className="flex items-center gap-3 mt-1 md:mt-2">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-yellow-500 overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${host.toLowerCase().replace(' ', '-')}`} alt={host} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <span className="text-white font-semibold text-sm md:text-base">{host}</span>
                        <span className="text-gray-400 text-xs md:text-sm ml-2">• Host</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
