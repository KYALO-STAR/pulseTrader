import React, { useState } from 'react';
import Tabs from '@/components/shared_ui/tabs/tabs';
import Matches from '../matches';
import Hyperbot from '../hyperbot';
import Diffbot from '../diffbot';
import SpeedBot from '../speedbot';
import { Localize } from '@deriv-com/translations';
import { LabelPairedPuzzlePieceTwoCaptionBoldIcon } from '@deriv/quill-icons/LabelPaired';
import './hybrid-bots.scss';

type HybridBotSubTab = 'matches' | 'diffbot' | 'hyperbot' | 'speedbot';

const HybridBots: React.FC = () => {
    const [active_subtab, setActiveSubtab] = useState<number>(0);

    const handleSubTabChange = (tab_index: number) => {
        setActiveSubtab(tab_index);
    };

    return (
        <div className='hybrid-bots'>
            <div className='hybrid-bots__submenu'>
                <Tabs
                    active_index={active_subtab}
                    className='hybrid-bots__tabs'
                    onTabItemClick={handleSubTabChange}
                    top
                >
                    <div
                        label={
                            <>
                                <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                    height='24px'
                                    width='24px'
                                    fill='var(--text-general)'
                                />
                                <Localize i18n_default_text='Matches' />
                            </>
                        }
                        id='id-hybrid-matches'
                    >
                        <Matches />
                    </div>
                    <div
                        label={
                            <>
                                <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                    height='24px'
                                    width='24px'
                                    fill='var(--text-general)'
                                />
                                <Localize i18n_default_text='Diffbot' />
                            </>
                        }
                        id='id-hybrid-diffbot'
                    >
                        <Diffbot />
                    </div>
                    <div
                        label={
                            <>
                                <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                    height='24px'
                                    width='24px'
                                    fill='var(--text-general)'
                                />
                                <Localize i18n_default_text='Hyperbot' />
                            </>
                        }
                        id='id-hybrid-hyperbot'
                    >
                        <Hyperbot />
                    </div>
                    <div
                        label={
                            <>
                                <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                    height='24px'
                                    width='24px'
                                    fill='var(--text-general)'
                                />
                                <span className='nav-speedbot-label'>
                                    <Localize i18n_default_text='SpeedBot' />
                                </span>
                                <span className='nav-rocket' aria-hidden='true'>
                                    🚀
                                </span>
                            </>
                        }
                        id='id-hybrid-speedbot'
                    >
                        <SpeedBot />
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default HybridBots;
