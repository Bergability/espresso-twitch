export const trimUsername = (username: string): string => {
    if (username.startsWith('@')) return username.substr(1);
    return username;
};
