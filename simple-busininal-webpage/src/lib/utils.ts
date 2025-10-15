export const generateRandomString = (length: number = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const oidcKey = 'oidc.user:https://ap-northeast-1b01cpprgs.auth.ap-northeast-1.amazoncognito.com:2v9crk5htm82i6s6894iq746ht'

export const getAccessToken = () => {
  const stored = localStorage.getItem(oidcKey);
  if (!stored) return null;
  return JSON.parse(stored).access_token;
}
