'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  scriptSrc?: string;
  customHtml?: string;
  className?: string;
  showLabel?: boolean;
}

export default function AdSlot({
  scriptSrc,
  customHtml,
  className = '',
  showLabel = true,
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scriptSrc && containerRef.current) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.onError = () => {
        console.error(`Failed to load script from ${scriptSrc}`);
      };
      containerRef.current.appendChild(script);
    }

    // Push to adsbygoogle for AdSense if available
    if (!scriptSrc && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (error) {
        console.error('AdSense trigger error:', error);
      }
    }
  }, [scriptSrc]);

  if (customHtml) {
    return (
      <div className={`ad-container ${className}`}>
        {showLabel && <span className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Advertisement</span>}
        <div dangerouslySetInnerHTML={{ __html: customHtml }} />
      </div>
    );
  }

  return (
    <div className={`ad-slot-wrapper my-6 text-center ${className}`}>
      {showLabel && <span className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Advertisement</span>}
      <div ref={containerRef} className="ad-network-wrapper w-full overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || 'ca-pub-XXXXXXXXXXXXXXX'}
          data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT || '1234567890'}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
