# Design Document: Supabase Integration for Admin Panel Persistence

## I. Introduction

### Context

The existing admin panel, designed to manage bot types, contact channels, and application settings, currently lacks a robust and persistent backend. Configuration is theoretically stored in `public/config.json`, but no server-side mechanism exists to update this file, leading to non-persistence of changes. Bot XML files are handled as static assets referenced by a `bots.json` manifest.

### Problem Statement

1.  **Lack of Persistence:** Changes made in the admin panel are not saved permanently; they are lost upon application restart or server redeployment.
2.  **No Audit Trail:** There's no persistent record of who made what changes and when, hindering accountability and debugging.
3.  **Scalability Limitations:** Relying on a static `config.json` is not scalable for dynamic configuration management or a growing number of bots/users.
4.  **Security Vulnerabilities:** Direct file manipulation from a frontend is insecure and requires a robust backend.
5.  **Usability Gaps:** The previous bot management and configuration experience was not user-friendly for non-technical users.

### Goal

To implement a robust, scalable, and secure persistence layer for the admin panel using Supabase, addressing current limitations and preparing for future enhancements. This includes migrating configuration data, bot metadata, and bot XML files to Supabase, and integrating Supabase Authentication for administrative actions.

## II. Solution Overview: Supabase Integration

### Why Supabase?

Supabase is chosen as the Backend-as-a-Service (BaaS) solution due to its ability to provide:

- A managed PostgreSQL database for structured data.
- Object storage for file-like assets (bot XMLs).
- Built-in authentication and Row Level Security (RLS) for robust access control.
- Real-time capabilities for instant UI updates.
- A clear path to replace custom backend logic with managed services, significantly reducing development effort for persistence.

### High-Level Architecture

The current static `public/config.json` and implicit file storage will be replaced by:

1.  **Supabase Database:** Stores structured data (global application settings in `app_config` table, bot metadata in `bots` table, and audit logs in `admin_logs` table).
2.  **Supabase Storage:** Stores actual bot XML files in a dedicated bucket (`bot-xml-files`).
3.  **Supabase Authentication:** Secures access to admin panel operations.

The frontend (`AdminPanel`, `ConfigProvider`, `freebots-cache.ts`) will be modified to interact directly with Supabase APIs.

## III. Detailed Development Plan

### Phase 1: Supabase Setup & Data Modeling

1.  **Create Supabase Project:**
    - Go to [supabase.com](https://supabase.com/) and create a new project (e.g., `kptrader-admin`).
    - **Note down your Project URL and `anon` public key** from `Project Settings -> API`. These will be used in your frontend environment variables.

2.  **Define `app_config` Table Schema (Global Application Settings):**
    - **Purpose:** Stores single-instance global settings (channels, app name, support email).
    - **Table Name:** `app_config`
    - **Columns:**
        - `id` (UUID, Primary Key, Default Value: `gen_random_uuid()`)
        - `config_name` (TEXT, **UNIQUE**, Default Value: `'main_config'`) - Ensures only one global config row exists.
        - `channels` (JSONB) - Stores the contact channels object (e.g., `{ "whatsapp": "+123...", "telegram": "@user" }`).
        - `app_name` (TEXT)
        - `support_email` (TEXT)
        - `created_at` (TIMESTAMP WITH TIME ZONE, Default Value: `now()`)
        - `updated_at` (TIMESTAMP WITH TIME ZONE, Default Value: `now()`, **Enable "Is Updateable"** in Supabase UI).
    - **Initial Data:** Insert **one row** with `config_name = 'main_config'` and copy existing values for `channels`, `app_name`, and `support_email` from your `public/config.json`.

3.  **Define `bots` Table Schema (Bot Metadata):**
    - **Purpose:** Stores metadata for each bot, including a reference to its XML file in Storage. Replaces entries from `bots.json`.
    - **Table Name:** `bots`
    - **Columns:**
        - `id` (UUID, Primary Key, Default Value: `gen_random_uuid()`)
        - `name` (TEXT, **UNIQUE**)
        - `description` (TEXT)
        - `icon` (TEXT)
        - `file` (TEXT, **UNIQUE**) - Stores the _path or filename_ of the associated XML file within the `bot-xml-files` Supabase Storage bucket. This matches `TBotsManifestItem['file']`.
        - `difficulty` (TEXT) - (From `TBotsManifestItem`)
        - `strategy` (TEXT) - (From `TBotsManifestItem`)
        - `features` (TEXT[]) - (From `TBotsManifestItem`, e.g., an array of strings).
        - `created_at` (TIMESTAMP WITH TIME ZONE, Default Value: `now()`)
        - `updated_at` (TIMESTAMP WITH TIME ZONE, Default Value: `now()`, **Enable "Is Updateable"**).
    - **Initial Data:** For each bot in your current `public/xml/bots.json` (or `public/config.json`), insert a corresponding row into this `bots` table. Initially, the `file` column can be left empty for existing bots until XMLs are uploaded to Storage.

4.  **Define `admin_logs` Table Schema (Persistent Audit Trail):**
    - **Purpose:** Stores a persistent record of all significant changes made via the admin panel.
    - **Table Name:** `admin_logs`
    - **Columns:**
        - `id` (UUID, Primary Key, Default Value: `gen_random_uuid()`)
        - `timestamp` (TIMESTAMP WITH TIME ZONE, Default Value: `now()`)
        - `editor_name` (TEXT)
        - `editor_email` (TEXT)
        - `change_description` (TEXT)
        - `affected_table` (TEXT) - _Name of the table that was affected (e.g., 'app_config', 'bots')._
        - `affected_id` (UUID, optional) - _The ID of the specific row in `affected_table` that was changed._
        - `affected_record_name` (TEXT, optional) - _The name of the affected record (e.g., bot name, 'main_config') for easier readability in the logs._
        - `old_value` (JSONB, optional) - _Stores previous state for detailed change tracking._
        - `new_value` (JSONB, optional) - _Stores new state for detailed change tracking._
    - **Note on Foreign Keys:** Due to the polymorphic nature of `affected_id` (it can reference either `app_config.id` or `bots.id`), a direct database-level foreign key constraint is not feasible for `affected_id`. Integrity will be enforced by the application logic when logging changes.

5.  **Set Up Supabase Storage Bucket (`bot-xml-files` for XML files):**
    - Navigate to `Storage` in Supabase Studio.
    - Create a new bucket named `bot-xml-files`.
    - **Upload Existing XMLs:** Manually upload all your existing bot XML files (e.g., from your `public/xml` directory) into this `bot-xml-files` bucket. Ensure filenames are consistent with what you'll use in the `bots.file` column.
    - **Update `bots` table `file` column:** After uploading, go back to the `bots` table and update the `file` column for each bot with the exact path/filename of its corresponding XML file in the `bot-xml-files` bucket.

6.  **Configure Row Level Security (RLS) & Storage Policies:**
    - **For Tables (`app_config`, `bots`, `admin_logs`):**
        - Enable RLS for all three tables.
        - **`app_config` & `bots` Tables (Read Access - Public Visibility):**
            - Create `SELECT` policies allowing the **`anon` (unauthenticated) role**. (Allows non-logged-in users to see bot lists and global config).
        - **`app_config` & `bots` Tables (Admin Write Access):**
            - Create `INSERT`, `UPDATE`, `DELETE` policies allowing only `authenticated` users who are designated as 'admin' (requires setting up Supabase Auth and roles).
        - **`admin_logs` Table:**
            - Create `INSERT` policy for `authenticated` 'admin' role only.
            - Create `SELECT` policy for `authenticated` 'admin' role.
    - **For Storage Bucket (`bot-xml-files`):**
        - Set up Storage Policies for your `bot-xml-files` bucket:
            - Allow `anon` (public) users to `SELECT` (read/download) files. (Allows non-logged-in users to download bot XMLs via URL).
            - Allow `authenticated` 'admin' users to `INSERT` (upload), `UPDATE` (overwrite), and `DELETE` files.

### Phase 2: Frontend Code Integration

1.  **Install Supabase Client Library:**
    - Run `npm install @supabase/supabase-js` in your project's root.

2.  **Initialize Supabase Client:**
    - Create a new file: `src/utils/supabaseClient.ts`
    - **Content:**
        ```typescript
        import { createClient } from '@supabase/supabase-js';
        const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Supabase URL or ANON Key missing. Check your environment variables.');
        }
        export const supabase = createClient(supabaseUrl, supabaseAnonKey);
        ```
    - **Important:** Move `SUPABASE_URL` and `SUPABASE_ANON_KEY` to your project's environment variables (e.g., `.env` file, `rsbuild.config.ts` for build-time injection, or `vercel.json`).

3.  **Update `ConfigProvider` (`src/contexts/ConfigContext.tsx`):**
    - **Import `supabase`:** `import { supabase } from '@/utils/supabaseClient';`
    - **Modify `Bot` Interface:** Remove `xmlContent?: string;`.
    - **Modify `AppConfig` Interface:** Remove `bots: Bot[]`. (The `ConfigProvider` will now _only_ manage `channels`, `appName`, `supportEmail` from `app_config` table).
    - **Update `defaultConfig`:** Adjust to reflect the `AppConfig` structure without the `bots` array.
    - **Update `refreshConfig`:**
        - Fetch the single `app_config` row: `const { data: configData, error: configError } = await supabase.from('app_config').select('*').eq('config_name', 'main_config').single();`
        - Handle errors and loading states.
    - **Implement Real-time Subscription (Recommended):** Use `supabase.from('app_config').on('UPDATE', payload => ...).subscribe();` to update the config state in real-time, removing `setInterval` polling for global settings.

4.  **Update `AdminPanel` (`src/pages/admin-panel/admin-panel.tsx`):**
    - **Import `supabase`:** `import { supabase } from '@/utils/supabaseClient';`
    - **Modify `AppConfig` Interface:** Update to remove `bots: Bot[]`.
    - **Modify `Bot` Interface:** Update to use `file: string;` for the storage path (replacing `xmlContent?: string;`). This `Bot` interface in `AdminPanel` will represent the _admin's view_ of a bot before it's saved/updated.
    - **State for Admin Bots:** Introduce a separate `useState<Bot[]>` (e.g., `adminBots`) to manage the list of bots displayed and editable in the admin panel.
    - **Modify `loadConfig`:**
        - Fetch `app_config` data from Supabase.
        - **Fetch all bots from the `bots` table separately:** `const { data: botsData, error: botsError } = await supabase.from('bots').select('*');`
        - Update the `config` state's global fields and `setAdminBots(botsData)`.
    - **Modify `saveConfig`:** This function will now _only_ update the `app_config` table for global settings:
        - `await supabase.from('app_config').update({ channels: configToSave.channels, app_name: configToSave.appName, support_email: configToSave.supportEmail }).eq('config_name', 'main_config');`
        - **Log to `admin_logs` table:** After successful save, `await supabase.from('admin_logs').insert({ editor_name, editor_email, change_description, affected_table: 'app_config', affected_id: configToSave.id, new_value: configToSave });` (Consider storing `old_value` for full audit).
    - **Modify `addBot`:**
        - **Upload XML to Storage:** `const { data: storageData, error: storageError } = await supabase.storage.from('bot-xml-files').upload(filename, uploadedXmlContent, { contentType: 'text/xml' });`
        - **Insert into `bots` table:** `await supabase.from('bots').insert({ name: newBot.name, description: newBot.description, icon: newBot.icon, file: storageData.path, difficulty: newBot.difficulty, strategy: newBot.strategy, features: newBot.features });`
        - Update `adminBots` state.
        - Log to `admin_logs` table.
    - **Modify `updateBot`:**
        - If a new `xmlContent` is provided (meaning a new XML file is uploaded), upload it to Storage (consider replacing or versioning the old one) and get the new file path.
        - Update the corresponding row in the `bots` table using `supabase.from('bots').update(...)`.
        - Update `adminBots` state. Log to `admin_logs` table.
    - **Modify `deleteBot`:**
        - First, `DELETE` the file from Supabase Storage: `await supabase.storage.from('bot-xml-files').remove([bot.file]);`
        - Then, `DELETE` the row from the `bots` table: `await supabase.from('bots').delete().eq('id', bot.id);`
        - Update `adminBots` state. Log to `admin_logs` table.
    - **Integrate Supabase Authentication:** Replace the simple password check in `AdminAuthContext` or `AdminLogin` with Supabase Auth (e.g., `supabase.auth.signInWithPassword()`).

5.  **Adapt `freebots-cache.ts` (`src/utils/freebots-cache.ts`):**
    - **Import `supabase`:** `import { supabase } from '@/utils/supabaseClient';`
    - **Modify `getBotsManifest()`:** This function will no longer fetch `bots.json`. Instead, it will query the **Supabase `bots` table** to retrieve all bots. It should filter for `file` not null and other criteria and return an array of objects conforming to `TBotsManifestItem`.
        - `const { data: botsData, error } = await supabase.from('bots').select('id, name, description, icon, file, difficulty, strategy, features');`
    - **Modify `fetchXmlWithCache()`:**
        - Instead of `fetch('/xml/...')`, it will construct a Supabase Storage URL using the `file` property obtained from `getBotsManifest()`.
        - `const { data: publicUrlData } = supabase.storage.from('bot-xml-files').getPublicUrl(file);`
        - Then `fetch` the XML content from `publicUrlData.publicUrl`.

6.  **Enhanced Frontend Error Handling:**
    - Integrate `react-toastify` (already in project) or similar for user-friendly error messages upon failed Supabase operations (e.g., failed save, failed upload).

### Phase 3: Cleanup and Refinement

1.  **Remove Obsolete Files:**
    - `public/config.json`
    - `public/xml/bots.json` (or any static bot manifests).
2.  **Remove `admin-log.ts`:** This file can be removed as logging will be handled directly by inserting into the `admin_logs` Supabase table.
3.  **Testing:** Thoroughly test all functionalities:
    - Admin login/logout.
    - CRUD operations for global config and bots (add, edit, delete).
    - XML file uploads and deletions.
    - Admin change logging in `admin_logs` table.
    - Real-time updates in `ConfigProvider`.
    - Main application's ability to load bot lists and run bots.
    - RLS and Storage Policies enforcement.

## IV. Security Considerations

- **Supabase Authentication:** Implement proper user registration/login for admin users.
- **Row Level Security (RLS):** Crucial for fine-grained access control on database tables.
- **Storage Policies:** Essential for securing file uploads, downloads, and deletions.
- **Environment Variables:** Store Supabase URL and keys securely as environment variables, not hardcoded in client-side code.
- **Input Validation:** Continue to validate input on the frontend. While Supabase provides some database-level validation, client-side validation enhances user experience.

## V. Redundancy & Failure Handling

- **Supabase Managed Services:** Supabase handles database replication, backups, and high availability, significantly improving data redundancy compared to a single static file.
- **Persistent Audit Log:** Moving `admin_logs` to a Supabase table provides a centralized, persistent, and redundant audit trail, protecting against `localStorage` loss.
- **Frontend Caching:** `freebots-cache.ts` already uses `localforage`. This can be extended to cache `app_config` and `bots` metadata, improving perceived availability during temporary network issues.
- **Error Reporting:** Enhanced UI error feedback will provide better user experience during failures.

## VI. Limitations & Future Work

- **`public/config.json` Sync:** This plan completely replaces `public/config.json`. If an external system absolutely requires a physical `config.json` file, a separate mechanism (e.g., a Supabase Function triggering a file generation/upload to a CDN or webhook to a build process) would be needed. This is out of scope for the current plan.
- **Advanced Logging Details:** The `admin_logs` table can be expanded to store more granular `old_value` and `new_value` (as JSONB) for detailed change tracking, beyond just descriptions.
- **Admin Role Management:** Currently assumes a single 'admin' role. Future work might involve more complex role-based access control.

## VII. Next Steps for Implementation

1.  **Review and Confirm this Plan.**
2.  **Begin Phase 1: Supabase Setup & Data Modeling.** This involves creating your Supabase project, setting up the `app_config`, `bots`, and `admin_logs` tables, configuring the `bot-xml-files` Storage bucket, and manually migrating your initial data.
