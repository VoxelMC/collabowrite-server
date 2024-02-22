import { createClient } from '@supabase/supabase-js';
import type { Room } from 'partykit/server';

export function createSupabase(room: Room) {
    return createClient(
        room.env.SUPABASE_URL as string,
        room.env.SUPABASE_ANON as string
    );
}
