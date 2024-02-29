import type * as Party from 'partykit/server';
import { onConnect } from 'y-partykit';
import { createSupabase } from './lib/supabase';
import { Doc } from 'yjs';
import { decodeDoc, encodeDoc } from './lib/ydoc-process';
import type { SupabaseClient } from '@supabase/supabase-js';
// import kittylog from 'kittylog';
import * as k from './lib/logger';

export default class YjsServer implements Party.Server {
    readonly party: Party.Room;
    readonly supabase: SupabaseClient;
    constructor(party: Party.Room) {
        this.party = party;
        this.supabase = createSupabase(party);
    }

    async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
        // const k = kittylog;
        let party = this.party;
        const supabase = this.supabase;
        const searchParams = new URL(conn.uri).searchParams;

        console.log('%c' + 'Test Message', 'color: #420690');
        k.success(`┏━ Client Connected: ${conn.id}`);
        k.info(`┣━━━ room: ${this.party.id}`);
        k.info(`┣━━━ user: ${searchParams.get('userId')}`);
        k.info(`┗━━━ url: ${new URL(ctx.request.url).pathname}`);

        return onConnect(conn, this.party, {
            async load(): Promise<Doc> {
                k.success(`START @ load(): ${party.id}`);

                const { data, error } = await supabase
                    .from('document')
                    .select('data')
                    .eq('uuid', party.id);

                data && k.info(JSON.stringify({ data }, null, 2));
                error && k.error(JSON.stringify({ error }, null, 2));

                if (!error && data?.length > 0) {
                    k.success(`SEND @ load(): ${party.id} :: document found`);
                    return await decodeDoc(data[0]?.data);
                } else {
                    const { data, error } = await supabase
                        .from('document')
                        .insert({
                            uuid: party.id,
                            data: await encodeDoc(new Doc()),
                            owner: searchParams.get('userId'),
                            last_edited: new Date(Date.now()).toUTCString(),
                        });

                    data && k.info(JSON.stringify({ data }, null, 2));
                    error && k.error(JSON.stringify({ error }, null, 2));

                    const newData = (await supabase
                        .from('document')
                        .select('data')
                        .eq('uuid', party.id)) ?? { data: [{ data: '' }] };

                    if (error || !newData.data) {
                        k.warning(
                            `SEND @ load(): ${party.id} :: new blank document from scratch`
                        );
                        return decodeDoc('[0,0]');
                    }

                    k.warning(
                        `SEND @ load(): ${party.id} :: new blank document from database`
                    );
                    return decodeDoc(newData.data[0]?.data);
                }
            },
            callback: {
                async handler(yDoc) {
                    const { error } = await supabase
                        .from('document')
                        .update({
                            last_edited: new Date(
                                Date.now() - 2000
                            ).toUTCString(),
                            data: await encodeDoc(yDoc),
                        })
                        .eq('uuid', party.id);

                    if (error) {
                        k.error(
                            `SAVE @ handler(): ${party.id} :: save failure; inserting empty row.`
                        );
                        await supabase.from('document').insert({
                            uuid: party.id,
                            data: await encodeDoc(new Doc()),
                            owner: searchParams.get('userId'),
                            last_edited: new Date(Date.now()).toUTCString(),
                        });
                    } else {
                        party.broadcast('Saved.');
                        k.success(
                            `SAVE @ handler(): ${party.id} :: saved document`
                        );
                    }
                },
                timeout: 2000,
            },
            persist: {
                mode: 'history',
                maxBytes: 10_000_000,
                maxUpdates: 10_00,
            },
        });
    }

    onMessage(message: Uint8Array, sender: Party.Connection) {
        // const k = kittylog;
        k.message(`Fr: ${sender.id}`);
    }
}

YjsServer satisfies Party.Worker;
