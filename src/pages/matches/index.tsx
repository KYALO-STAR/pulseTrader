import React from 'react';
import { observer } from 'mobx-react-lite';
import IframeWrapper from '@/components/iframe-wrapper';

const Matches = observer(() => {
    const matchesUrl = 'https://matches-sooty.vercel.app/';
    
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
                src={matchesUrl}
                title='Matches'
                className='matches-container'
            />
        </div>
    );
});

export default Matches;



