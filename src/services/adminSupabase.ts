// src/services/adminSupabase.ts
import { Channels } from '@/contexts/ConfigContext'; // Using interfaces from ConfigContext
import { supabase } from '@/utils/supabaseClient'; // Ensure this path is correct

// --- Interfaces for Supabase Data Models ---
// These should mirror your Supabase table schemas
export interface SupabaseAppConfig {
    id: string;
    config_name: string;
    channels: Channels;
    app_name: string;
    support_email: string;
    created_at: string;
    updated_at: string;
}

export interface SupabaseBot {
    id: string;
    name: string;
    description: string;
    icon?: string;
    file: string; // Path to XML in Storage
    difficulty?: string;
    strategy?: string;
    features?: string[]; // Assuming TEXT[] in DB, but JSONB could also work
    created_at: string;
    updated_at: string;
}

export interface SupabaseLogEntry {
    id: string;
    timestamp: string; // ISO string
    editor_name: string;
    editor_email: string;
    change_description: string;
    affected_table: string;
    affected_id?: string; // UUID
    affected_record_name?: string;
    old_value?: any; // JSONB
    new_value?: any; // JSONB
}

// --- App Config Operations ---

/**
 * Fetches the main application configuration from Supabase.
 * @returns {Promise<SupabaseAppConfig | null>} The application config or null if not found.
 */
export const getAppConfig = async (): Promise<SupabaseAppConfig | null> => {
    const { data, error } = await supabase.from('app_config').select('*').eq('config_name', 'main_config').single();

    if (error) {
        console.error('Error fetching app config:', error);
        return null;
    }
    return data;
};

/**
 * Updates the main application configuration in Supabase.
 * @param {Partial<SupabaseAppConfig>} updates The fields to update.
 * @returns {Promise<SupabaseAppConfig | null>} The updated config or null if error.
 */
export const updateAppConfig = async (updates: Partial<SupabaseAppConfig>): Promise<SupabaseAppConfig | null> => {
    // Exclude fields that should not be updated directly (like id, timestamps)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _created_at, updated_at: _updated_at, ...updatePayload } = updates;

    const { data, error } = await supabase
        .from('app_config')
        .update(updatePayload)
        .eq('config_name', 'main_config')
        .select() // Use select() to return the updated row
        .single();

    if (error) {
        console.error('Error updating app config:', error);
        return null;
    }
    return data;
};

// --- Bot Operations ---

/**
 * Fetches all bot metadata from Supabase.
 * @returns {Promise<SupabaseBot[]>} An array of bot metadata.
 */
export const getAllBots = async (): Promise<SupabaseBot[]> => {
    const { data, error } = await supabase.from('bots').select('*');

    if (error) {
        console.error('Error fetching all bots:', error);
        return [];
    }
    return data as SupabaseBot[]; // Cast to SupabaseBot[]
};

/**
 * Adds a new bot entry to the database.
 * @param {Omit<SupabaseBot, 'id' | 'created_at' | 'updated_at'>} botData The bot data to insert.
 * @returns {Promise<SupabaseBot | null>} The new bot or null if error.
 */
export const addBotEntry = async (
    botData: Omit<SupabaseBot, 'id' | 'created_at' | 'updated_at'>
): Promise<SupabaseBot | null> => {
    const { data, error } = await supabase.from('bots').insert(botData).select().single();

    if (error) {
        console.error('Error adding bot entry:', error);
        return null;
    }
    return data;
};

/**
 * Updates an existing bot entry in the database.
 * @param {string} botId The ID of the bot to update.
 * @param {Partial<Omit<SupabaseBot, 'id' | 'created_at' | 'updated_at'>>} updates The fields to update.
 * @returns {Promise<SupabaseBot | null>} The updated bot or null if error.
 */
export const updateBotEntry = async (
    botId: string,
    updates: Partial<Omit<SupabaseBot, 'id' | 'created_at' | 'updated_at'>>
): Promise<SupabaseBot | null> => {
    const { data, error } = await supabase.from('bots').update(updates).eq('id', botId).select().single();

    if (error) {
        console.error('Error updating bot entry:', error);
        return null;
    }
    return data;
};

/**
 * Deletes a bot entry from the database.
 * @param {string} botId The ID of the bot to delete.
 * @returns {Promise<boolean>} True if successful, false if error.
 */
export const deleteBotEntry = async (botId: string): Promise<boolean> => {
    const { error } = await supabase.from('bots').delete().eq('id', botId);

    if (error) {
        console.error('Error deleting bot entry:', error);
        return false;
    }
    return true;
};

// --- Storage Operations ---

/**
 * Uploads an XML file to Supabase Storage.
 * @param {string} filename The desired filename in storage.
 * @param {string | File | Blob} fileContent The XML content or File/Blob object.
 * @returns {Promise<string | null>} The file path in storage or null if error.
 */
export const uploadBotXml = async (filename: string, fileContent: string | File | Blob): Promise<string | null> => {
    const { data, error } = await supabase.storage.from('bot-xml-files').upload(filename, fileContent, {
        contentType: 'text/xml',
        upsert: true, // Overwrite if file exists
    });

    if (error) {
        console.error('Error uploading bot XML:', error);
        return null;
    }
    return data.path; // Return the path within the bucket
};

/**
 * Deletes an XML file from Supabase Storage.
 * @param {string} filePath The full path of the file in storage (e.g., 'folder/filename.xml').
 * @returns {Promise<boolean>} True if successful, false if error.
 */
export const deleteBotXml = async (filePath: string): Promise<boolean> => {
    const { error } = await supabase.storage.from('bot-xml-files').remove([filePath]);

    if (error) {
        console.error('Error deleting bot XML:', error);
        return false;
    }
    return true;
};

/**
 * Gets the public URL for a bot XML file.
 * @param {string} filePath The path of the file in storage.
 * @returns {string | null} The public URL or null if error.
 */
export const getBotXmlPublicUrl = (filePath: string): string | null => {
    const { data } = supabase.storage.from('bot-xml-files').getPublicUrl(filePath);

    return data?.publicUrl || null;
};

// --- Admin Log Operations ---

/**
 * Adds a new log entry to the admin_logs table.
 * @param {Omit<SupabaseLogEntry, 'id' | 'timestamp'>} logData The log data to insert.
 * @returns {Promise<SupabaseLogEntry | null>} The new log entry or null if error.
 */
export const addAdminLogEntry = async (
    logData: Omit<SupabaseLogEntry, 'id' | 'timestamp'>
): Promise<SupabaseLogEntry | null> => {
    const { data, error } = await supabase.from('admin_logs').insert(logData).select().single();

    if (error) {
        console.error('Error adding admin log entry:', error);
        return null;
    }
    return data;
};

/**
 * Fetches all admin log entries.
 * @returns {Promise<SupabaseLogEntry[]>} An array of log entries, ordered by timestamp descending.
 */
export const getAdminLogEntries = async (): Promise<SupabaseLogEntry[]> => {
    const { data, error } = await supabase.from('admin_logs').select('*').order('timestamp', { ascending: false });

    if (error) {
        console.error('Error fetching admin log entries:', error);
        return [];
    }
    return data as SupabaseLogEntry[];
};
