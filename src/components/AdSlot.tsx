'use client';

import { useEffect } from 'react';

interface AdSlotProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  customHtml?: string;
  className?: string;
}

export default function AdSlot({
  client,
  slot,
  format = 'auto',
  customHtml,
  className = '',
}: AdSlotProps) {
  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (error) {
      console.error('AdSense trigger error:', error);
    }
  }, []);

  if (customHtml) {
    return <div className={`ad-container ${className}`} dangerouslySetInnerHTML={{ __html: customHtml }} />;
  }

  return (
    <div className={`ad-slot-wrapper my-6 text-center ${className}`}>
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client || process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || 'ca-pub-XXXXXXXXXXXXXXX'}
        data-ad-slot={slot || '1234567890'}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
