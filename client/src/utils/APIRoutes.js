export const host = process.env.REACT_APP_API_HOST || "http://localhost:5005";
export const loginRoute = `${host}/api/auth/login`;
export const registerRoute = `${host}/api/auth/register`;
export const logoutRoute = `${host}/api/auth/logout`;
export const allUsersRoute = `${host}/api/auth/allusers`;
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;
export const setAvatarRoute = `${host}/api/auth/setavatar`;
export const setPublicKeyRoute = `${host}/api/auth/publickey`;

export const verify2FALoginRoute = `${host}/api/auth/2fa/verify-login`;
export const generate2FARoute = `${host}/api/auth/2fa/generate`;
export const enable2FARoute = `${host}/api/auth/2fa/enable`;
export const disable2FARoute = `${host}/api/auth/2fa/disable`;
