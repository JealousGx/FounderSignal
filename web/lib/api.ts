import { auth } from "@clerk/nextjs/server";

export async function customFetch(path: string, options: RequestInit = {}) {
  "use server";

  const { getToken } = await auth();
  const token = await getToken();

  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}`;

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export const api = {
  get: (path: string, options?: RequestInit) =>
    customFetch(path, { method: "GET", ...options }),
  post: (path: string, body?: BodyInit | null) =>
    customFetch(path, { method: "POST", body }),
  put: (path: string, body?: BodyInit | null) =>
    customFetch(path, { method: "PUT", body }),
  delete: (path: string) => customFetch(path, { method: "DELETE" }),
};

export type QueryParams = {
  sortBy?: string;
  limit?: number;
  offset?: number;
  filterBy?: string;
  search?: string;

  lastCreatedAt?: string;
  lastId?: string;
};
