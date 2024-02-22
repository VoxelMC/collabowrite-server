import * as Y from 'yjs';
export async function encodeDoc(yDoc: Y.Doc) {
    const update = Y.encodeStateAsUpdate(yDoc);
    const json = JSON.stringify([...update]);
    return json;
}

export async function decodeDoc(json: string): Promise<Y.Doc> {
    const update = Uint8Array.from(JSON.parse(json));
    const doc = new Y.Doc();
    Y.applyUpdate(doc, update);
    return doc;
}
