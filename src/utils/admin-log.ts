// src/utils/admin-log.ts

export interface LogEntry {
    id: string;
    timestamp: string;
    editorName: string;
    editorEmail: string;
    changeDescription: string;
    // Potentially more details like 'oldValue', 'newValue', 'sectionChanged'
}

const LOCAL_STORAGE_KEY = 'admin_change_history';

/**
 * Retrieves the change history from local storage.
 * @returns {LogEntry[]} An array of log entries.
 */
export const getChangeHistory = (): LogEntry[] => {
    try {
        const historyString = localStorage.getItem(LOCAL_STORAGE_KEY);
        return historyString ? JSON.parse(historyString) : [];
    } catch (error) {
        console.error('Error reading change history from local storage:', error);
        return [];
    }
};

/**
 * Adds a new log entry to the change history in local storage.
 * @param {LogEntry} entry The log entry to add.
 */
export const addLogEntry = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const history = getChangeHistory();
    const newEntry: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...entry,
    };
    history.unshift(newEntry); // Add to the beginning for reverse chronological order
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error writing change history to local storage:', error);
    }
};

/**
 * Clears all change history from local storage.
 */
export const clearChangeHistory = () => {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing change history from local storage:', error);
    }
};
