import fetch from 'node-fetch';
import { clientId } from './tokens';
import TwitchAPIFetch from './api';
import { Espresso } from '../../../espresso/declarations/core/espresso';
// import Bot from './bot';
// import PubSub from './pubsub';

declare const espresso: Espresso;

type UserType = 'main' | 'bot';

interface UserData {
    id: string;
    token: string;
    username: string;
}

interface Settings {
    main: UserData | null;
    bot: UserData | null;
    version: string;
}

class Twitch {
    public version: string;
    private main: UserData | null;
    private bot: UserData | null;

    constructor() {
        let settings = espresso.store.get('twitch') as Settings | undefined;

        if (settings === undefined) {
            settings = this.setDefaultSettings();
        }

        // Set the internal settings
        this.version = settings.version;
        this.main = settings.main;
        this.bot = settings.bot;
    }

    private setDefaultSettings() {
        const defaultSettings: Settings = {
            main: null,
            bot: null,
            version: '1.0.0',
        };
        espresso.store.set('twitch', defaultSettings);
        return defaultSettings;
    }

    public async updateUser(type: UserType, token: string, dryRun: boolean = false): Promise<boolean> {
        try {
            const json = await TwitchAPIFetch('https://api.twitch.tv/helix/users', 'get', undefined, token);
            if (json.data[0] && dryRun === false) {
                const userData = espresso.store.get(`twitch.${type}`) as null | UserData;
                const username = json.data[0].display_name;
                const userId = json.data[0].id;
                let tokenId: string;

                // If user data is null, no user has been setup
                if (userData === null) {
                    tokenId = espresso.tokens.set(token);
                } else {
                    tokenId = userData.token;
                    espresso.tokens.update(userData.token, token);
                }

                // Check if a token has already been created for this user

                const user: UserData = { id: userId, username, token: tokenId };

                this[type] = user;
                espresso.store.set(`twitch.${type}`, user);
                return true;
            } else if (json.data[0] && dryRun === true) {
                return true;
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    public async validateUser(type: UserType): Promise<boolean> {
        const user = this[type];
        if (user === null) return false;

        try {
            return await this.updateUser(type, espresso.tokens.get(user.token) as string, true);
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    public async invalidateUser(type: UserType): Promise<boolean> {
        const user = this[type];

        // If no user is set we can't invalidate it
        if (user === null) return false;

        const token = espresso.tokens.get(user.token);

        try {
            const res = await fetch(`https://id.twitch.tv/oauth2/revoke?client_id=${clientId}&token=${token}`, { method: 'post' });
            if (res.status === 200) {
                this[type] = null;
                espresso.store.set(`twitch.${type}`, null);
                espresso.tokens.delete(user.token);
                return true;
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

const twitch = new Twitch();

export default twitch;