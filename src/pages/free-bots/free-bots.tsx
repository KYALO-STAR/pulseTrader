import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Button from '@/components/shared_ui/button';
import Text from '@/components/shared_ui/text';
import { DBOT_TABS } from '@/constants/bot-contents';
import { useConfig } from '@/contexts/ConfigContext'; // New import
import { useStore } from '@/hooks/useStore';
import { fetchXmlWithCache } from '@/utils/freebots-cache';
import { localize } from '@deriv-com/translations';
import './free-bots.scss';

interface BotData {
    name: string;
    description: string;
    difficulty: string;
    strategy: string;
    features: string[];
    xml: string;
}

const DEFAULT_FEATURES = ['Automated Trading', 'Risk Management', 'Profit Optimization'];

const FreeBots = observer(() => {
    const { dashboard } = useStore();
    const { config, loading: isConfigLoading } = useConfig(); // Use useConfig hook
    const { active_tab, setActiveTab, setPendingFreeBot } = dashboard;
    const [availableBots, setAvailableBots] = useState<BotData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load bot into builder
    const loadBotIntoBuilder = async (bot: BotData) => {
        try {
            if (bot.xml) {
                console.log('Loading bot:', bot.name);
                console.log('Blockly workspace available:', !!window.Blockly?.derivWorkspace);

                // Flag the selected bot for the Bot Builder to load after navigation
                setPendingFreeBot({ name: bot.name, xml: bot.xml });

                // Navigate to Bot Builder; loading will be handled when workspace is ready
                setActiveTab(DBOT_TABS.BOT_BUILDER);

                console.log('Navigating to Bot Builder to load bot:', bot.name);
            }
        } catch (error) {
            console.error('Error loading bot:', error);
        }
    };

    // Load bots with instant UI and progressive loading from config.bots
    useEffect(() => {
        const loadBots = async () => {
            if (active_tab !== DBOT_TABS.FREE_BOTS) return;
            if (isConfigLoading) return; // Wait for config to load

            setError(null);
            setIsLoading(true);

            // Use config.bots as the source of truth
            if (!config.bots || config.bots.length === 0) {
                setIsLoading(false);
                return;
            }

            // Immediately render skeleton cards from config.bots
            const skeletonBots: BotData[] = config.bots.map(bot => ({
                name: bot.name || (bot.file ? bot.file.replace('.xml', '').replace(/[_-]/g, ' ') : 'Unnamed Bot'),
                description: bot.description || `Advanced trading bot: ${bot.name}`,
                difficulty: bot.difficulty || 'Intermediate',
                strategy: bot.strategy || 'Multi-Strategy',
                features: bot.features || DEFAULT_FEATURES,
                xml: '',
            }));
            setAvailableBots(skeletonBots);
            setIsLoading(false);

            // Load XMLs progressively in background
            const loadedBotsPromises = config.bots.map(async botConfig => {
                if (botConfig.file) {
                    try {
                        const xml = await fetchXmlWithCache(botConfig.file);
                        if (xml) {
                            return {
                                name: botConfig.name || botConfig.file.replace('.xml', '').replace(/[_-]/g, ' '),
                                description: botConfig.description || `Advanced trading bot: ${botConfig.name}`,
                                difficulty: botConfig.difficulty || 'Intermediate',
                                strategy: botConfig.strategy || 'Multi-Strategy',
                                features: botConfig.features || DEFAULT_FEATURES,
                                xml,
                            };
                        }
                    } catch (err) {
                        console.warn(`Failed to load ${botConfig.file}:`, err);
                    }
                }
                return null;
            });

            // Update state as each bot loads
            loadedBotsPromises.forEach(promise => {
                promise.then(loadedBot => {
                    if (loadedBot) {
                        setAvailableBots(prevBots =>
                            prevBots.map(prevBot =>
                                prevBot.name === loadedBot.name ? loadedBot : prevBot
                            )
                        );
                    }
                });
            });
        };

        loadBots();
    }, [active_tab, isConfigLoading, config.bots]);

    return (
        <div className='free-bots'>
            <div className='free-bots__container'>
                {isLoading ? (
                    <div className='free-bots__loading'>
                        <Text size='s' color='general'>
                            {localize('Loading free bots...')}
                        </Text>
                    </div>
                ) : error ? (
                    <div className='free-bots__error'>
                        <Text size='s' color='general'>
                            {error}
                        </Text>
                        <div style={{ marginTop: '20px' }}>
                            <Button onClick={() => window.location.reload()}>{localize('Retry')}</Button>
                        </div>
                    </div>
                ) : availableBots.length === 0 ? (
                    <div className='free-bots__empty'>
                        <Text size='s' color='general'>
                            {localize('No bots available at the moment.')}
                        </Text>
                    </div>
                ) : (
                    <div className='free-bots__grid'>
                        {availableBots.map((bot, index) => (
                            <div key={index} className='free-bot-card'>
                                <div className='free-bot-card__header'>
                                    <Text size='s' weight='bold' className='free-bot-card__title'>
                                        {bot.name}
                                    </Text>

                                    {/* Star Rating */}
                                    <div className='free-bot-card__rating'>
                                        <span className='star'>★</span>
                                        <span className='star'>★</span>
                                        <span className='star'>★</span>
                                        <span className='star'>★</span>
                                        <span className='star'>★</span>
                                    </div>
                                </div>

                                <Button
                                    className='free-bot-card__load-btn'
                                    onClick={() => loadBotIntoBuilder(bot)}
                                    primary
                                    has_effect
                                    type='button'
                                    disabled={!bot.xml} // Disable if XML not loaded yet
                                >
                                    {bot.xml ? 'LOAD PREMIUM BOT' : 'LOADING...'}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default FreeBots;
