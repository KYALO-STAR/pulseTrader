import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Channels } from '@/contexts/ConfigContext';
import useThemeSwitcher from '@/hooks/useThemeSwitcher'; // New import for theme switcher hook
import { ToggleSwitch } from '@deriv-com/ui'; // New import for ToggleSwitch component
import {
    addAdminLogEntry,
    addBotEntry,
    deleteBotEntry,
    deleteBotXml,
    getAdminLogEntries,
    getAllBots,
    getAppConfig,
    SupabaseLogEntry,
    updateAppConfig,
    updateBotEntry,
    uploadBotXml,
    // SupabaseBot, // Not directly used here, mapped to local Bot
} from '@/services/adminSupabase';
import BotForm from './BotForm'; // Import the new BotForm component
import UserIdentificationModal from './UserIdentificationModal';
import './admin-panel.scss';
import './user-identification-modal.scss';
import './bot-form.scss'; // Import BotForm styles

// Local Bot interface for admin panel (includes xmlContent for upload handling)
export interface Bot {
    id?: string; // Optional for new bots before DB assignment
    name: string;
    description: string;
    icon?: string;
    file?: string; // Path to XML in Storage (optional initially for new bots)
    difficulty?: string;
    strategy?: string;
    features?: string[];
    xmlContent?: string; // Raw XML content for upload/editing locally
}

// AdminPanel's AppConfig (local state derived from SupabaseAppConfig)
interface AdminPanelAppConfig {
    channels: Channels;
    appName: string;
    supportEmail: string;
}

const BotCard: React.FC<{
    bot: Bot;
    onUpdate: (updates: Partial<Bot>) => void;
    onDelete: () => void;
    onEdit: (bot: Bot) => void; // New prop for editing
}> = ({ bot, onUpdate, onDelete, onEdit }) => (
    <div className='bot-card'>
        <input
            type='text'
            placeholder='Bot Name'
            value={bot.name}
            onChange={e => onUpdate({ name: e.target.value })}
            className='input-field'
        />
        <textarea
            placeholder='Description'
            value={bot.description}
            onChange={e => onUpdate({ description: e.target.value })}
            className='textarea-field'
        />
        <input
            type='text'
            placeholder='Icon URL'
            value={bot.icon || ''}
            onChange={e => onUpdate({ icon: e.target.value })}
            className='input-field'
        />
        <input
            type='text'
            placeholder='Difficulty'
            value={bot.difficulty || ''}
            onChange={e => onUpdate({ difficulty: e.target.value })}
            className='input-field'
        />
        <input
            type='text'
            placeholder='Strategy'
            value={bot.strategy || ''}
            onChange={e => onUpdate({ strategy: e.target.value })}
            className='input-field'
        />
        <input
            type='text'
            placeholder='Features (comma-separated)'
            value={(Array.isArray(bot.features) ? bot.features : []).join(', ') || ''}
            onChange={e => onUpdate({ features: e.target.value.split(',').map(f => f.trim()) })}
            className='input-field'
        />
        {(bot.xmlContent || bot.file) && (
            <div className='xml-content-preview'>
                <strong>XML Status:</strong> XML Attached ({bot.file || 'Local'})
            </div>
        )}
        <div className='bot-card-actions'>
            <button className='edit-btn' onClick={() => onEdit(bot)}>
                Edit
            </button>
            <button className='delete-btn' onClick={onDelete}>
                Delete
            </button>
        </div>
    </div>
);

const FormField: React.FC<{
    label: string;
    type?: string;
    value: string;
    placeholder?: string;
    onChange: (val: string) => void;
}> = ({ label, type = 'text', value, placeholder, onChange }) => (
    <div className='form-group'>
        <label>{label}</label>
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            className='input-field'
        />
    </div>
);

const AdminPanel: React.FC = () => {
    const { logout } = useAdminAuth();
    const { is_dark_mode_on, toggleTheme } = useThemeSwitcher(); // Use theme switcher hook
    const [activeTab, setActiveTab] = useState<'bots' | 'channels' | 'settings' | 'history'>('bots');
    const [config, setConfig] = useState<AdminPanelAppConfig>({
        channels: { whatsapp: '', telegram: '', email: '', discord: '' },
        appName: 'PulseTrader',
        supportEmail: 'support@pulsetrader.com',
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [uploadedXmlContent, setUploadedXmlContent] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    // Removed fileInputRef as it's now internal to BotForm

    const [isIdentificationModalOpen, setIsIdentificationModalOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [pendingConfigSave, setPendingConfigSave] = useState<AdminPanelAppConfig | null>(null);
    const [pendingBotAction, setPendingBotAction] = useState<{
        action: 'add' | 'update' | 'delete';
        bot?: Bot;
        updates?: Partial<Bot>;
        oldBot?: Bot; // For logging updates
    } | null>(null);

    const [historyLogs, setHistoryLogs] = useState<SupabaseLogEntry[]>([]);
    const [adminBots, setAdminBots] = useState<Bot[]>([]);

    // State for BotForm management
    const [editingBotId, setEditingBotId] = useState<string | null>(null);
    const [currentBotFormData, setCurrentBotFormData] = useState<Partial<Bot>>({
        name: '',
        description: '',
        icon: '',
        difficulty: '',
        strategy: '',
        features: [],
        xmlContent: '',
    });

    useEffect(() => {
        loadConfig();
    }, []);

    useEffect(() => {
        if (activeTab === 'history') {
            const fetchLogs = async () => {
                const logs = await getAdminLogEntries();
                setHistoryLogs(logs);
            };
            fetchLogs();
        }
    }, [activeTab]);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const appConfigData = await getAppConfig();
            if (appConfigData) {
                setConfig({
                    channels: appConfigData.channels || { whatsapp: '', telegram: '', email: '', discord: '' }, // Provide default if null
                    appName: appConfigData.app_name || 'PulseTrader', // Provide default if null
                    supportEmail: appConfigData.support_email || 'support@pulsetrader.com', // Provide default if null
                });
            } else {
                setMessage('⚠️ Failed to load app config from Supabase. Using default values.');
                // Fallback to initial default config if Supabase data is null
                setConfig({
                    channels: { whatsapp: '', telegram: '', email: '', discord: '' },
                    appName: 'PulseTrader',
                    supportEmail: 'support@pulsetrader.com',
                });
            }

            const allBotsData = await getAllBots();
            if (allBotsData) {
                const mappedBots: Bot[] = allBotsData.map(bot => ({
                    id: bot.id,
                    name: bot.name,
                    description: bot.description,
                    icon: bot.icon,
                    file: bot.file,
                    difficulty: bot.difficulty,
                    strategy: bot.strategy,
                    features: bot.features,
                }));
                setAdminBots(mappedBots);
            } else {
                setMessage('⚠️ Failed to load bots from Supabase.');
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
            setMessage('⚠️ Failed to load configuration due to an error.');
        } finally {
            setLoading(false);
        }
    };

    const executeSaveConfig = async (configToSave: AdminPanelAppConfig, editorName: string, editorEmail: string) => {
        setMessage('Saving...');
        try {
            const oldConfig = config; // Capture old config for logging
            const updatedConfig = await updateAppConfig({
                channels: configToSave.channels,
                app_name: configToSave.appName,
                support_email: configToSave.supportEmail,
            });

            if (updatedConfig) {
                setMessage('✅ Configuration saved!');
                await addAdminLogEntry({
                    editor_name: editorName,
                    editor_email: editorEmail,
                    change_description: `Updated app config (channels, appName, supportEmail).`,
                    affected_table: 'app_config',
                    affected_id: updatedConfig.id,
                    affected_record_name: updatedConfig.config_name,
                    old_value: {
                        channels: oldConfig.channels,
                        appName: oldConfig.appName,
                        supportEmail: oldConfig.supportEmail,
                    },
                    new_value: {
                        channels: updatedConfig.channels,
                        appName: updatedConfig.app_name,
                        supportEmail: updatedConfig.support_email,
                    },
                });
                setUserName('');
                setUserEmail('');
            } else {
                setMessage('⚠️ Error saving configuration');
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
            setMessage('⚠️ Error saving configuration');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const executeAddBot = async (botToAdd: Bot, editorName: string, editorEmail: string) => {
        setMessage(`Adding bot "${botToAdd.name}"...`);
        try {
            if (!botToAdd.xmlContent || !uploadedFileName) {
                setMessage('⚠️ Bot XML content or filename is missing for upload.');
                return;
            }
            const filePath = await uploadBotXml(uploadedFileName, botToAdd.xmlContent);

            if (filePath) {
                const newBotEntry = await addBotEntry({
                    name: botToAdd.name,
                    description: botToAdd.description,
                    icon: botToAdd.icon,
                    file: filePath,
                    difficulty: botToAdd.difficulty,
                    strategy: botToAdd.strategy,
                    features: botToAdd.features,
                });

                if (newBotEntry) {
                    setMessage(`✅ Bot "${newBotEntry.name}" added successfully!`);
                    setAdminBots(prev => [...prev, newBotEntry]);
                    await addAdminLogEntry({
                        editor_name: editorName,
                        editor_email: editorEmail,
                        change_description: `Added new bot: ${newBotEntry.name}.`,
                        affected_table: 'bots',
                        affected_id: newBotEntry.id,
                        affected_record_name: newBotEntry.name,
                        new_value: newBotEntry,
                    });
                    setUploadedXmlContent(null);
                    setUploadedFileName(null);
                    setUserName('');
                    setUserEmail('');
                    setCurrentBotFormData({
                        // Clear form data after successful add
                        name: '',
                        description: '',
                        icon: '',
                        difficulty: '',
                        strategy: '',
                        features: [],
                        xmlContent: '',
                    });
                } else {
                    setMessage('⚠️ Error adding bot entry to database.');
                    if (filePath) await deleteBotXml(filePath); // Clean up uploaded file if DB insert fails
                }
            } else {
                setMessage('⚠️ Error uploading bot XML file.');
            }
        } catch (error) {
            console.error('Error adding bot:', error);
            setMessage('⚠️ Error adding bot.');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const executeUpdateBot = async (
        botId: string,
        updates: Partial<Bot>,
        oldBot: Bot,
        editorName: string,
        editorEmail: string
    ) => {
        setMessage(`Updating bot "${oldBot.name}"...`);
        try {
            let filePath = updates.file || oldBot.file;
            let fileChanged = false;

            // Handle XML content update if provided
            if (updates.xmlContent && uploadedFileName) {
                // We always upsert, so simply upload the new one. No need to delete old unless filename changes
                const newFilePath = await uploadBotXml(uploadedFileName, updates.xmlContent);
                if (newFilePath) {
                    filePath = newFilePath;
                    fileChanged = true;
                    // Optionally delete old file if file path has changed and old file is no longer referenced
                    if (oldBot.file && oldBot.file !== newFilePath) {
                        await deleteBotXml(oldBot.file); // Consider carefully if you want to delete old versions
                    }
                } else {
                    setMessage('⚠️ Error uploading new bot XML file.');
                    return;
                }
            }

            const updatedBotResult = await updateBotEntry(botId, {
                name: updates.name,
                description: updates.description,
                icon: updates.icon,
                file: filePath, // Use updated path if XML was changed
                difficulty: updates.difficulty,
                strategy: updates.strategy,
                features: updates.features,
            });

            if (updatedBotResult) {
                setMessage(`✅ Bot "${updatedBotResult.name}" updated successfully!`);
                setAdminBots(prev => prev.map(bot => (bot.id === botId ? updatedBotResult : bot)));
                await addAdminLogEntry({
                    editor_name: editorName,
                    editor_email: editorEmail,
                    change_description: `Updated bot: ${updatedBotResult.name}. ${fileChanged ? '(XML file updated)' : ''}`,
                    affected_table: 'bots',
                    affected_id: updatedBotResult.id,
                    affected_record_name: updatedBotResult.name,
                    old_value: oldBot,
                    new_value: updatedBotResult,
                });
                setUploadedXmlContent(null); // Clear content after use
                setUploadedFileName(null);
                setUserName('');
                setUserEmail('');
                setEditingBotId(null); // Exit edit mode
                setCurrentBotFormData({
                    // Clear form data
                    name: '',
                    description: '',
                    icon: '',
                    difficulty: '',
                    strategy: '',
                    features: [],
                    xmlContent: '',
                });
            } else {
                setMessage('⚠️ Error updating bot.');
            }
        } catch (error) {
            console.error('Error updating bot:', error);
            setMessage('⚠️ Error updating bot.');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const executeDeleteBot = async (botToDelete: Bot, editorName: string, editorEmail: string) => {
        setMessage(`Deleting bot "${botToDelete.name}"...`);
        try {
            if (!botToDelete.id) {
                setMessage('⚠️ Bot ID is missing for deletion.');
                return;
            }
            // Delete XML file from storage
            if (botToDelete.file) {
                const fileDeleted = await deleteBotXml(botToDelete.file);
                if (!fileDeleted) {
                    setMessage('⚠️ Error deleting bot XML file from storage.');
                    // Decide if you want to proceed with DB deletion if file deletion fails
                    // For now, we return to prevent inconsistent state
                    return;
                }
            }

            // Delete bot entry from database
            const dbEntryDeleted = await deleteBotEntry(botToDelete.id);

            if (dbEntryDeleted) {
                setMessage(`✅ Bot "${botToDelete.name}" deleted successfully!`);
                setAdminBots(prev => prev.filter(bot => bot.id !== botToDelete.id));
                await addAdminLogEntry({
                    editor_name: editorName,
                    editor_email: editorEmail,
                    change_description: `Deleted bot: ${botToDelete.name}.`,
                    affected_table: 'bots',
                    affected_id: botToDelete.id,
                    affected_record_name: botToDelete.name,
                    old_value: botToDelete,
                });
                setUserName('');
                setUserEmail('');
                // Ensure edit mode is reset if the deleted bot was the one being edited
                if (editingBotId === botToDelete.id) {
                    setEditingBotId(null);
                    setCurrentBotFormData({
                        name: '',
                        description: '',
                        icon: '',
                        difficulty: '',
                        strategy: '',
                        features: [],
                        xmlContent: '',
                    });
                }
            } else {
                setMessage('⚠️ Error deleting bot entry from database.');
            }
        } catch (error) {
            console.error('Error deleting bot:', error);
            setMessage('⚠️ Error deleting bot.');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const onConfirmIdentification = (name: string, email: string) => {
        setUserName(name);
        setUserEmail(email);
        setIsIdentificationModalOpen(false);

        if (pendingConfigSave) {
            executeSaveConfig(pendingConfigSave, name, email);
            setPendingConfigSave(null);
        } else if (pendingBotAction) {
            if (pendingBotAction.action === 'add' && pendingBotAction.bot) {
                executeAddBot(pendingBotAction.bot, name, email);
            } else if (pendingBotAction.action === 'update' && pendingBotAction.bot && pendingBotAction.updates) {
                executeUpdateBot(pendingBotAction.bot.id!, pendingBotAction.updates, pendingBotAction.bot, name, email);
            } else if (pendingBotAction.action === 'delete' && pendingBotAction.bot) {
                executeDeleteBot(pendingBotAction.bot, name, email);
            }
            setPendingBotAction(null);
        }
    };

    const saveConfig = () => {
        if (!userName || !userEmail) {
            setPendingConfigSave(config);
            setIsIdentificationModalOpen(true);
            return;
        }
        executeSaveConfig(config, userName, userEmail);
    };

    const handleBotFormChange = (updates: Partial<Bot>) => {
        setCurrentBotFormData(prev => ({ ...prev, ...updates }));
    };

    const handleXmlUploadChange = (content: string, fileName: string) => {
        setUploadedXmlContent(content);
        setUploadedFileName(fileName);
        setCurrentBotFormData(prev => ({ ...prev, xmlContent: content })); // Update xmlContent in form data
    };

    const handleAddOrUpdateBotClick = () => {
        if (!currentBotFormData.name || !currentBotFormData.description) {
            setMessage('⚠️ Bot Name and Description are required.');
            return;
        }

        if (!uploadedXmlContent && !editingBotId) {
            // For new bots, XML is required
            setMessage('⚠️ Please upload an XML file for the new bot.');
            return;
        }

        if (editingBotId) {
            const oldBot = adminBots.find(b => b.id === editingBotId);
            if (!oldBot) {
                setMessage('⚠️ Bot not found for editing.');
                return;
            }
            // Trigger update
            updateBot(editingBotId, {
                ...currentBotFormData,
                xmlContent: uploadedXmlContent || undefined, // Pass new XML if uploaded
            });
        } else {
            // Trigger add
            addBot({
                ...currentBotFormData,
                xmlContent: uploadedXmlContent!, // XML is required for new bot
            });
        }
    };

    const addBot = (newBotData: Omit<Bot, 'id'>) => {
        if (!userName || !userEmail) {
            setPendingBotAction({ action: 'add', bot: newBotData as Bot });
            setIsIdentificationModalOpen(true);
            return;
        }
        executeAddBot(newBotData as Bot, userName, userEmail);
    };

    const updateBot = (id: string, updates: Partial<Bot>) => {
        const oldBot = adminBots.find(b => b.id === id);
        if (!oldBot) return;

        if (!userName || !userEmail) {
            setPendingBotAction({ action: 'update', bot: oldBot, updates });
            setIsIdentificationModalOpen(true);
            return;
        }
        executeUpdateBot(id, updates, oldBot, userName, userEmail);
    };

    const deleteBot = (id: string) => {
        const botToDelete = adminBots.find(b => b.id === id);
        if (!botToDelete) return;

        if (!userName || !userEmail) {
            setPendingBotAction({ action: 'delete', bot: botToDelete });
            setIsIdentificationModalOpen(true);
            return;
        }
        executeDeleteBot(botToDelete, userName, userEmail);
    };

    const handleEditBot = (bot: Bot) => {
        setEditingBotId(bot.id || null);
        setCurrentBotFormData({ ...bot });
        setUploadedXmlContent(null); // Clear pending XML upload when starting to edit a bot
        setUploadedFileName(null);
    };

    const handleCancelEdit = () => {
        setEditingBotId(null);
        setCurrentBotFormData({
            name: '',
            description: '',
            icon: '',
            difficulty: '',
            strategy: '',
            features: [],
            xmlContent: '',
        });
        setUploadedXmlContent(null);
        setUploadedFileName(null);
    };

    const updateChannel = (channel: keyof Channels, value: string) =>
        setConfig(prev => ({ ...prev, channels: { ...prev.channels, [channel]: value } }));

    if (loading)
        return (
            <div className='admin-panel'>
                <p>Loading...</p>
            </div>
        );

    return (
        <div className='admin-panel'>
            <div className='admin-header'>
                <h1>Admin Panel</h1>
                <div className='header-actions'>
                    <div className='theme-switcher-wrapper' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{is_dark_mode_on ? 'Dark Mode' : 'Light Mode'}</span>
                        <ToggleSwitch value={is_dark_mode_on} onChange={toggleTheme} />
                    </div>
                    <button className='save-btn' onClick={saveConfig}>
                        Save All Changes
                    </button>
                    <button className='logout-btn' onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>

            {message && <div className='message-banner'>{message}</div>}

            <div className='admin-tabs'>
                {['bots', 'channels', 'settings', 'history'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                    >
                        {tab === 'bots'
                            ? 'Bot Types'
                            : tab === 'channels'
                              ? 'Contact Channels'
                              : tab === 'settings'
                                ? 'Settings'
                                : 'History'}
                    </button>
                ))}
            </div>

            <div className='admin-content'>
                {activeTab === 'bots' && (
                    <div className='section'>
                        <h2>{editingBotId ? 'Edit Bot' : 'Add New Bot'}</h2>
                        <BotForm
                            bot={currentBotFormData}
                            onBotChange={handleBotFormChange}
                            onXmlFileChange={handleXmlUploadChange}
                            uploadedFileName={uploadedFileName}
                            isEditing={!!editingBotId}
                        />
                        <div className='form-actions'>
                            <button
                                className='add-btn' // Reusing add-btn style for save/update
                                onClick={handleAddOrUpdateBotClick}
                                disabled={loading || !currentBotFormData.name || !currentBotFormData.description}
                            >
                                {editingBotId ? 'Update Bot' : 'Add Bot'}
                            </button>
                            {editingBotId && (
                                <button className='cancel-btn' onClick={handleCancelEdit}>
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <h2 style={{ marginTop: '3rem' }}>Existing Bots</h2>
                        <div className='bots-list'>
                            {adminBots.length === 0 ? (
                                <p className='no-items-message'>No bots added yet. Add one using the form above!</p>
                            ) : (
                                adminBots.map(bot => (
                                    <BotCard
                                        key={bot.id}
                                        bot={bot}
                                        onUpdate={updates => updateBot(bot.id!, updates)}
                                        onDelete={() => deleteBot(bot.id!)}
                                        onEdit={handleEditBot}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'channels' && (
                    <div className='section'>
                        <h2>Contact Channels</h2>
                        <FormField
                            label='WhatsApp Number'
                            placeholder='e.g., +1234567890'
                            value={config.channels.whatsapp}
                            onChange={v => updateChannel('whatsapp', v)}
                        />
                        <FormField
                            label='Telegram Handle'
                            placeholder='e.g., @yourtelegram'
                            value={config.channels.telegram}
                            onChange={v => updateChannel('telegram', v)}
                        />
                        <FormField
                            label='Email'
                            type='email'
                            placeholder='e.g., support@example.com'
                            value={config.channels.email}
                            onChange={v => updateChannel('email', v)}
                        />
                        <FormField
                            label='Discord Server'
                            placeholder='e.g., https://discord.gg/yourserver'
                            value={config.channels.discord || ''}
                            onChange={v => updateChannel('discord', v)}
                        />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className='section settings-form'>
                        <h2>Application Settings</h2>
                        <FormField
                            label='App Name'
                            placeholder='e.g., PulseTrader'
                            value={config.appName}
                            onChange={v => setConfig(prev => ({ ...prev, appName: v }))}
                        />
                        <FormField
                            label='Support Email'
                            type='email'
                            placeholder='e.g., support@pulsetrader.com'
                            value={config.supportEmail}
                            onChange={v => setConfig(prev => ({ ...prev, supportEmail: v }))}
                        />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className='section'>
                        <h2>Change History</h2>
                        {historyLogs.length === 0 ? (
                            <p className='no-items-message'>No change history recorded yet.</p>
                        ) : (
                            <div className='history-logs-list'>
                                {historyLogs.map(log => (
                                    <div key={log.id} className='log-entry'>
                                        <p className='log-timestamp'>
                                            <strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}
                                        </p>
                                        <p className='log-editor'>
                                            <strong>Editor:</strong> {log.editor_name} ({log.editor_email})
                                        </p>
                                        <p className='log-description'>
                                            <strong>Change:</strong> {log.change_description}
                                        </p>
                                        {log.affected_table && log.affected_record_name && (
                                            <p className='log-affected'>
                                                <strong>Affected:</strong> {log.affected_record_name} (Table:{' '}
                                                {log.affected_table})
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <UserIdentificationModal
                isOpen={isIdentificationModalOpen}
                onClose={() => setIsIdentificationModalOpen(false)}
                onConfirm={onConfirmIdentification}
                defaultName={userName}
                defaultEmail={userEmail}
            />
        </div>
    );
};

export default AdminPanel;
