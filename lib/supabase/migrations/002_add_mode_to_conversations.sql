-- Add mode column to conversations table
-- This allows storing whether a conversation was created in simple or agent mode

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'agent'
CHECK (mode IN ('simple', 'agent'));

-- Add comment to document the column
COMMENT ON COLUMN conversations.mode IS 'The mode of the conversation: simple (basic chat) or agent (multi-agent system)';

-- Create index on mode for potential filtering
CREATE INDEX IF NOT EXISTS idx_conversations_mode ON conversations(mode);

-- Update existing conversations to have a default mode
-- Since we don't know the original mode, we'll set them to 'agent' (current default)
-- Users can update this through the UI if needed
UPDATE conversations SET mode = 'agent' WHERE mode IS NULL OR mode = '';
