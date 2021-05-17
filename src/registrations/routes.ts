import path from 'path';
import { clientId } from 'src/tokens';
import { Espresso } from '../../../../espresso/declarations/core/espresso';
import TwitchAPIFetch from '../api';
import Twitch from '../twitch';

declare const espresso: Espresso;

espresso.server.register({
    path: '/twitch/new-custom-reward',
    method: 'post',
    response: (req, res) => {
        const { name } = req.body;

        if (!name || Twitch.main === null) {
            res.status(500).send();
            return;
        }

        TwitchAPIFetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${Twitch.main.id}`, 'POST', {
            title: name,
            cost: 100,
            is_enabled: false,
        })
            .then((r) => {
                res.send();
            })
            .catch((e) => {
                console.log(e);
                res.status(500).send(e);
            });
    },
});

espresso.server.register({
    path: '/twitch',
    method: 'get',
    response: (req, res) => {
        const pluginDirPath = espresso.plugins.getPath('twitch');
        if (!pluginDirPath) {
            res.send('error file not found');
            return;
        }

        res.sendFile(path.join(pluginDirPath, 'public', 'dashboard.html'));
    },
});

espresso.server.register({
    path: '/twitch/auth/main',
    method: 'get',
    response: (req, res) => {
        const { error } = req.query;

        const pluginDirPath = espresso.plugins.getPath('twitch');
        if (!pluginDirPath) {
            res.send('error file not found');
            return;
        }

        if (error) {
            res.sendFile(path.join(pluginDirPath, 'public', 'auth-fail.html'));
            return;
        }

        res.sendFile(path.join(pluginDirPath, 'public', 'auth-success.html'));
    },
});

espresso.server.register({
    path: '/twitch/auth/bot',
    method: 'get',
    response: (req, res) => {
        const { error } = req.query;

        const pluginDirPath = espresso.plugins.getPath('twitch');
        if (!pluginDirPath) {
            res.send('error file not found');
            return;
        }

        if (error) {
            res.sendFile(path.join(pluginDirPath, 'public', 'auth-fail.html'));
            return;
        }

        res.sendFile(path.join(pluginDirPath, 'public', 'auth-success.html'));
    },
});

espresso.server.register({
    path: '/api/twitch/auth',
    method: 'post',
    response: (req, res) => {
        const { token, account } = req.body;

        if (!token || !account) {
            res.status(400);
            res.json({});
            return;
        }

        if (account !== 'main' && account !== 'bot') {
            res.status(400);
            res.json({});
            return;
        }

        Twitch.updateUser(account, token).catch((e) => {
            console.log(e);
        });
    },
});

espresso.server.register({
    path: '/api/twitch/auth/disconnect',
    method: 'post',
    response: async (req, res) => {
        const { account } = req.body;

        if (!account) {
            res.status(400);
            res.json({
                message: 'Account not specified',
            });
            return;
        }

        if (account !== 'main' && account !== 'bot') {
            res.status(400);
            res.json({
                message: 'Invalid account type',
            });
            return;
        }

        try {
            const success = await Twitch.invalidateUser(account);
            res.json({
                disconnected: success,
            });
        } catch (e) {
            res.status(500).send(e);
        }
    },
});

espresso.server.register({
    path: '/api/twitch/status',
    method: 'get',
    response: async (req, res) => {
        try {
            // Check validity of accounts
            const main = await Twitch.validateUser('main');
            const bot = await Twitch.validateUser('bot');

            // Check connection status of chat bot and pubsub
            const chat = Twitch.chatClient !== null && Twitch.chatClient.client.readyState() === 'OPEN';
            const pubsub = Twitch.pubsubClient !== null && Twitch.pubsubClient.ws.readyState === 1;

            res.json({ main, bot, chat, pubsub });
        } catch (e) {
            res.status(500);
            res.send(e);
        }
    },
});
