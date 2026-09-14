import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className,
    priority = false,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Optimize Unsplash URLs
    const optimizedSrc = src.includes('unsplash.com')
        ? `${src.split('?')[0]}?auto=format&fit=crop&q=80&w=${priority ? 1600 : 800}`
        : src;

    return (
        <div className={cn(
            "relative overflow-hidden bg-cream/50",
            !isLoaded && "animate-pulse",
            className
        )}>
            <img
                src={optimizedSrc}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={priority ? "high" : "low"}
                onLoad={() => setIsLoaded(true)}
                onError={() => setError(true)}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-700",
                    isLoaded ? "opacity-100" : "opacity-0",
                    error && "hidden"
                )}
                {...props}
            />
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-cream text-mid text-[10px] uppercase tracking-widest">
                    Image failed to load
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
