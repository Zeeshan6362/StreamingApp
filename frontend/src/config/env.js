const getEnv = (key, fallback) => {
  return process.env[key] || fallback;
};

export const AUTH_API_URL = getEnv(
  'REACT_APP_AUTH_API_URL',
  '/api/auth'
);

export const STREAMING_API_URL = getEnv(
  'REACT_APP_STREAMING_API_URL',
  '/api/streaming'
);

export const STREAMING_PUBLIC_URL = getEnv(
  'REACT_APP_STREAMING_PUBLIC_URL',
  window.location.origin
);

export const ADMIN_API_URL = getEnv(
  'REACT_APP_ADMIN_API_URL',
  '/api/admin'
);

export const CHAT_API_URL = getEnv(
  'REACT_APP_CHAT_API_URL',
  '/api/chat'
);

export const CHAT_SOCKET_URL = getEnv(
  'REACT_APP_CHAT_SOCKET_URL',
  window.location.origin
);
