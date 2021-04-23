import fetch from 'node-fetch';
import { clientId, bergsAccessToken } from './tokens';

interface Payload {
    method: string;
    headers: { [key: string]: string };
    body?: string;
}

const TwitchAPIFetch = async (url: string, method: string, body?: any) => {
    try {
        const payload: Payload = {
            method,
            headers: {
                'Client-Id': clientId,
                Authorization: `Bearer ${bergsAccessToken}`,
                'Content-Type': 'application/json',
            },
        };

        if (body) payload.body = JSON.stringify(body);

        const res = await fetch(url, payload);
        const json = await res.json();

        return json;
    } catch (e) {
        console.log(e);
    }
};

export default TwitchAPIFetch;
