import type { WrapperFormat } from './db';

export async function requestWrapper(dest: string, request: WrapperFormat): Promise<Response> {
    return await fetch(dest, {
        method: 'POST',
        body: JSON.stringify(request)
    });
}
