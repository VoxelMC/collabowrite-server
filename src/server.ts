import type * as Party from 'partykit/server';
import { onConnect } from 'y-partykit';
import { createSupabase } from './lib/supabase';
import { Doc } from 'yjs';
import { decodeDoc, encodeDoc } from './lib/ydoc-process';
import type { SupabaseClient } from '@supabase/supabase-js';

// const decoder = new TextDecoder();

export default class YjsServer implements Party.Server {
    readonly party: Party.Room;
    readonly supabase: SupabaseClient;
    constructor(party: Party.Room) {
        this.party = party;
        this.supabase = createSupabase(party);
    }
    async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
        let party = this.party;
        const supabase = this.supabase;
        // A websocket just connected!
        console.log(
            `Connected:
			  id: ${conn.id}
			  room: ${this.party.id}
			  url: ${new URL(ctx.request.url).pathname}`
        );

        const searchParams = new URL(conn.uri).searchParams;
        console.log(searchParams.get('userId'));

        return onConnect(conn, this.party, {
            // @ts-ignore
            async load(): Doc {
                // TODO: Fetch from database on load

                console.log('connected, db:', party.id);
                // console.log('connected, request: ', await ctx.request.text());

                const { data, error } = await supabase
                    .from('document')
                    .select('data')
                    .eq('uuid', party.id);

                console.log(data, error);
                if (!error && data?.length > 0)
                    return await decodeDoc(data[0]?.data);
                else {
                    console.log('doc');
                    const { data, error } = await supabase
                        .from('document')
                        .insert({
                            uuid: party.id,
                            data: await encodeDoc(new Doc()),
                            // owner: searchParams.get('userId'),
                            owner: 'a55b107a-8697-41a8-a943-804e3a60e956',
                            last_edited: new Date(Date.now()).toUTCString(),
                        });
                    console.log(data, error);
                }

                return new Doc();
            },
            callback: {
                async handler(yDoc) {
                    // TODO: Write to database every few seconds after edits
                    // console.log(await encodeDoc(yDoc));
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
                        await supabase.from('document').insert({
                            uuid: party.id,
                            data: await encodeDoc(new Doc()),
                            // owner: searchParams.get('userId'),
                            owner: 'a55b107a-8697-41a8-a943-804e3a60e956',
                            last_edited: new Date(Date.now()).toUTCString(),
                        });
                    }
                },
                timeout: 2000,
            },
        });
    }

    onMessage(message: Uint8Array, sender: Party.Connection) {
        // let's log the message
        // console.log(
        //     `connection ${sender.id} sent message: ${JSON.stringify(message)}`
        // );
        // console.log('message', decoder.decode(new Uint8Array(message)));
        // console.log(sender);
        console.log('Messaged received from ' + sender.id);
    }
}

YjsServer satisfies Party.Worker;
