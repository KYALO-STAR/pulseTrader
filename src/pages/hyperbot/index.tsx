import React from 'react';
import { observer } from 'mobx-react-lite';
import IframeWrapper from '@/components/iframe-wrapper';

const Hyperbot = observer(() => {
    // Try different URL variations if the base URL doesn't work
    // The site might need specific routing or parameters
    const hyperbotUrl = 'https://hyperbot-indol.vercel.app/';
    
    // Alternative URLs to try if the base doesn't work:
    // const hyperbotUrl = 'https://hyperbot-indol.vercel.app/index.html';
    // const hyperbotUrl = 'https://hyperbot-indol.vercel.app/?embed=true';
    
    return (
        <div style={{ 
            width: '100%', 
            height: '100%',
            minHeight: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            pointerEvents: 'auto',
            zIndex: 1
        }}>
            <IframeWrapper
                src={hyperbotUrl}
                title='Hyperbot'
                className='hyperbot-container'
            />
        </div>
    );
});

export default Hyperbot;



