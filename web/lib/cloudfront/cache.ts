"use server";

/**
 *
 * @param path The path to invalidate in the Cloudflare cache.
 * This should be the path relative to the base URL of your application.
 * For example, if your app URL is `https://example.com` and you want to
 * invalidate the cache for `https://example.com/some/path`, you would pass
 * `/some/path`.
 * @returns A promise that resolves when the cache invalidation is complete.
 * If the environment is set to "test", it will skip the cache invalidation
 * and log a message instead.
 */
export const revalidateCfCache = async (path: string) => {
  if (process.env.NODE_ENV === "test") {
    console.log("Skipping Cloudflare cache invalidation in development mode.");
    return;
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL}${path}`;

  try {
    const res = await customFetch(
      JSON.stringify({
        files: [url],
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
 * If the environment is set to "test", it will skip the cache invalidation
 * and log a message instead.
 */
export const revalidateAPICfCache = async (path: string) => {
  if (process.env.NODE_ENV === "test") {
    console.log(
      "Skipping API Cloudflare cache invalidation in development mode."
    );
    return;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`;

  try {
    const res = await customFetch(
      JSON.stringify({
        files: [url],
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
