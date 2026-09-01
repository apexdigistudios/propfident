'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  scriptSrc?: string;
  customHtml?: string;
  className?: string;
}

export default function AdSlot({ scriptSrc, customHtml, className = '' }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    if (customHtml) {
      target.innerHTML = customHtml;
      return;
    }

    if (scriptSrc) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => {
        console.error(`Failed to load script from ${scriptSrc}`);
      };
      target.appendChild(script);
      return;
    }

    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (error) {
        console.error('AdSense trigger error:', error);
      }
    }
  }, [customHtml, scriptSrc]);

  return <div ref={containerRef} className={`hidden ${className}`} aria-hidden="true" />;
}
