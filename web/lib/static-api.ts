export const staticApi = (endpoint: string, options: RequestInit = {}) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};
