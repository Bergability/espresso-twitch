import fetch from 'node-fetch';
import { Espresso } from '../../../espresso/declarations/core/espresso';
import { clientId } from './tokens';
declare const espresso: Espresso;

interface Payload {
    method: string;
    headers: { [key: string]: string };
    body?: string;
}

const TwitchAPIFetch = async (url: string, method: string, body?: any, token?: string) => {
    try {
        const payload: Payload = {
            method,
            headers: {
                'Client-Id': clientId,
                Authorization: `Bearer ${token || espresso.tokens.get(espresso.store.get('twitch.main.token'))}`,
                'Content-Type': 'application/json',
            },
        };

        if (body) payload.body = JSON.stringify(body);

        const res = await fetch(url, payload);
        const json = await res.json();

        return json;
    } catch (e) {
        console.log(e);
        return e;
    }
};

export default TwitchAPIFetch;
