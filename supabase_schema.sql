-- Create ENUM for room mode
CREATE TYPE room_mode AS ENUM ('standard', 'blind_date');

-- Create rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    host_id UUID, -- Optional for anonymous MVP usage
    filters JSONB DEFAULT '{}'::jsonb,
    books JSONB[] DEFAULT '{}',
    winning_book_index INTEGER,
    mode room_mode DEFAULT 'standard',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Create room_members table
CREATE TABLE room_members (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    display_name TEXT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

-- MVP RLS Policies (Allow all for anonymous MVP usage)
CREATE POLICY "Allow anonymous read access on rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on rooms" ON rooms FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read access on room_members" ON room_members FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on room_members" ON room_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on room_members" ON room_members FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on room_members" ON room_members FOR DELETE USING (true);
