import fetch from 'node-fetch';
import { Espresso } from '../../../espresso/declarations/core/espresso';
import { clientId } from './tokens';
declare const espresso: Espresso;

interface Payload {
    method: string;
    headers: { [key: string]: string };
    body?: string;
}

const TwitchAPIFetch = (url: string, method: string, body?: any, token?: string) => {
    const payload: Payload = {
        method,
        headers: {
            'Client-Id': clientId,
            Authorization: `Bearer ${token || espresso.tokens.get(espresso.store.get('twitch.main.token'))}`,
            'Content-Type': 'application/json',
        },
    };

    if (body) payload.body = JSON.stringify(body);

    return fetch(url, payload);
};

export default TwitchAPIFetch;
