export const botOauth = 'oauth:teevb9iq9rfis1s7fina8sx61payov';
export const clientId = 'kybgbb011cg2tnx6z1tjckxdutfkmu';
export const bergsAccessToken = 'hakfzfy7t93561nqoz41oiae04kqwc';
export const bergsId = '113128856';

const scopes = [
    'bits:read',
    'channel:edit:commercial',
    'channel:manage:broadcast',
    'channel:manage:redemptions',
    'channel:manage:videos',
    'channel:read:editors',
    'channel:read:hype_train',
    'channel:read:redemptions',
    'clips:edit',
    'moderation:read',
    'user:edit',
    'user:edit:follows',
    'user:manage:blocked_users',
    'user:read:blocked_users',
    'user:read:broadcast',
    'user:read:follows',
    'user:read:subscriptions',
];

export const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost:23167/&response_type=token&scope=${scopes.join(
    '%20'
)}`;
