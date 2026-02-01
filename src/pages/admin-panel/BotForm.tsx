import React from 'react';
import { Bot } from './admin-panel'; // Assuming Bot interface is exported from admin-panel

interface BotFormProps {
    bot: Partial<Bot>; // Bot data to pre-populate form
    onBotChange: (updatedBot: Partial<Bot>) => void; // Callback for form field changes
    onXmlFileChange: (fileContent: string, fileName: string) => void; // Callback for XML file upload
    uploadedFileName: string | null; // Name of XML file currently staged for upload
    isEditing: boolean; // Whether form is for editing an existing bot
}

const BotForm: React.FC<BotFormProps> = ({ bot, onBotChange, onXmlFileChange, uploadedFileName, isEditing }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/xml') {
            const reader = new FileReader();
            reader.onload = e => {
                onXmlFileChange(e.target?.result as string, file.name);
            };
            reader.readAsText(file);
        } else {
            // Clear current upload state if invalid file is selected
            onXmlFileChange('', '');
            alert('⚠️ Please upload a valid XML file.');
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input to allow re-uploading same file
        }
    };

    return (
        <div className='bot-form-container'>
            <div className='form-group'>
                <label htmlFor='botName'>Bot Name</label>
                <input
                    type='text'
                    id='botName'
                    placeholder='e.g., Daily Profit Bot'
                    value={bot.name || ''}
                    onChange={e => onBotChange({ name: e.target.value })}
                    className='input-field'
                />
            </div>
            <div className='form-group'>
                <label htmlFor='botDescription'>Description</label>
                <textarea
                    id='botDescription'
                    placeholder='A brief description of what the bot does.'
                    value={bot.description || ''}
                    onChange={e => onBotChange({ description: e.target.value })}
                    className='textarea-field'
                />
            </div>
            <div className='form-group'>
                <label htmlFor='botIcon'>Icon URL / Name</label>
                <input
                    type='text'
                    id='botIcon'
                    placeholder='e.g., LegacyMenuApps2pxIcon or a URL'
                    value={bot.icon || ''}
                    onChange={e => onBotChange({ icon: e.target.value })}
                    className='input-field'
                />
            </div>
            <div className='form-group'>
                <label htmlFor='botDifficulty'>Difficulty</label>
                <input
                    type='text'
                    id='botDifficulty'
                    placeholder='e.g., Beginner, Intermediate'
                    value={bot.difficulty || ''}
                    onChange={e => onBotChange({ difficulty: e.target.value })}
                    className='input-field'
                />
            </div>
            <div className='form-group'>
                <label htmlFor='botStrategy'>Strategy</label>
                <input
                    type='text'
                    id='botStrategy'
                    placeholder='e.g., Martingale, Trend Following'
                    value={bot.strategy || ''}
                    onChange={e => onBotChange({ strategy: e.target.value })}
                    className='input-field'
                />
            </div>
            <div className='form-group'>
                <label htmlFor='botFeatures'>Features (comma-separated)</label>
                <input
                    type='text'
                    id='botFeatures'
                    placeholder='e.g., Scalping, Hedging'
                    value={bot.features?.join(', ') || ''}
                    onChange={e => onBotChange({ features: e.target.value.split(',').map(f => f.trim()) })}
                    className='input-field'
                />
            </div>
            <div className='form-group'>
                <label htmlFor='botXmlFile'>Bot XML File</label>
                <input
                    type='file'
                    accept='.xml'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <button
                    type='button'
                    className='add-btn' // Reusing add-btn style
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploadedFileName ? `Change XML (${uploadedFileName})` : 'Upload XML File'}
                </button>
                {bot.file && !uploadedFileName && (
                    <p className='uploaded-file-info'>Currently: {bot.file} (To update, upload new file)</p>
                )}
                {uploadedFileName && (
                    <p className='uploaded-file-info'>
                        New XML: {uploadedFileName} ready for {isEditing ? 'update' : 'add'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default BotForm;
