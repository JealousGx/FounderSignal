"use server";

/**
 *
 * @param params An object containing two arrays: `api` and `web`.
 * Each array should contain paths that you want to invalidate in the Cloudflare cache.
 * The paths should be relative to the base URLs of your API and web applications.
 * For example, if your API URL is `https://api.example.com` and you want to invalidate the cache for `https://api.example.com/api/v1/some/path`, you would pass `/api/v1/some/path` in the `api` array.
 * Similarly, if your web URL is `https://example.com` and you want to invalidate the cache for `https://example.com/some/path`, you would pass `/some/path` in the `web` array.
 * @returns
 */
export const revalidateCfCacheBatch = async ({
  api,
  web,
}: {
  api: string[];
  web: string[];
}) => {
  if (process.env.ENVIRONMENT === "local") {
    console.log("Skipping Cloudflare cache invalidation in local mode.");
    return;
  }

  const apiUrls = api.map(
    (path) => new URL(`${process.env.NEXT_PUBLIC_API_URL}${path}`)
  );
  const webUrls = web.map(
    (path) => new URL(`${process.env.NEXT_PUBLIC_APP_URL}${path}`)
  );

  const prefixes = [...apiUrls, ...webUrls].map(
    (url) => url.hostname + url.pathname
  );

  console.log(
    `Invalidating Cloudflare cache for (${apiUrls.length}) API URLs and (${webUrls.length}) Web URLs`
  );

  try {
    const res = await customFetch(
      JSON.stringify({
        prefixes,
      })
    );

    if (!res.ok) {
      const errorText = await res.text();

      console.error("Error invalidating cache:", errorText);

      throw new Error(`Failed to invalidate cache: ${errorText}`);
    }

    const data = await res.json();
    console.log("Cache invalidation response:", data);
  } catch (error) {
    console.error("Unhandled error during cache invalidation:", error);
  }
};

/**
 *
 * @param path The path to invalidate in the Cloudflare cache.
 * This should be the path relative to the base URL of your application.
 * For example, if your app URL is `https://example.com` and you want to
 * invalidate the cache for `https://example.com/some/path`, you would pass
 * `/some/path`.
 * @returns A promise that resolves when the cache invalidation is complete.
 * If the environment is set to "local", it will skip the cache invalidation
 * and log a message instead.
 */
export const revalidateCfCache = async (path: string) => {
  if (process.env.ENVIRONMENT === "local") {
    console.log("Skipping Cloudflare cache invalidation in local mode.");
    return;
  }

  const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL}${path}`);

  console.log("Invalidating Cloudflare cache for URL:", url.toString());

  try {
    const res = await customFetch(
      JSON.stringify({
        prefixes: [url.hostname + url.pathname],
      })
    );

    if (!res.ok) {
      const errorText = await res.text();

      console.error("Error invalidating cache:", errorText);

      throw new Error(`Failed to invalidate cache: ${errorText}`);
    }

    const data = await res.json();
    console.log("Cache invalidation response:", data);
    return data;
  } catch (error) {
    console.error("Unhandled error during cache invalidation:", error);
  }
};

/**
 *
 * @param path The API path to invalidate in the Cloudflare cache.
 * This should be the path relative to the base URL of your API.
 * For example, if your API URL is `https://api.example.com/api` and you want to
 * invalidate the cache for `https://example.com/api/v1/some/path`, you would pass
 * `/some/path`.
 * @returns A promise that resolves when the cache invalidation is complete.
 * If the environment is set to "local", it will skip the cache invalidation
 * and log a message instead.
 */
export const revalidateAPICfCache = async (path: string) => {
  if (process.env.ENVIRONMENT === "local") {
    console.log("Skipping API Cloudflare cache invalidation in local mode.");
    return;
  }

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${path}`);

  console.log("Invalidating API Cloudflare cache for URL:", url.toString());

  try {
    const res = await customFetch(
      JSON.stringify({
        prefixes: [url.hostname + url.pathname],
      })
    );

    if (!res.ok) {
      const errorText = await res.text();

      console.error("Error invalidating API cache:", errorText);

      throw new Error(`Failed to invalidate API cache: ${errorText}`);
    }

    const data = await res.json();
    console.log("API Cache invalidation response:", data);
    return data;
  } catch (error) {
    console.error("Unhandled error during API cache invalidation:", error);
  }
};

const customFetch = async (body: string, options?: RequestInit) => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      ...options,
      method: "POST",
      headers: {
        ...options?.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
      body,
    }
  );

  return res;
};
