
const PAYMONGO_API_URL = "https://api.paymongo.com";

type PayMongoRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function getAuthorizationHeader() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PAYMONGO_SECRET_KEY is not configured.");
  }

  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export async function paymongoRequest<T>(
  path: string,
  init: PayMongoRequestOptions = {},
): Promise<T> {

  const requestBody =
  init.body !== undefined
    ? JSON.stringify(init.body)
    : undefined;
  console.log("PayMongo outgoing body:", requestBody);

  const response = await fetch(`${PAYMONGO_API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: getAuthorizationHeader(),
      ...(init.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
    body: requestBody,
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result?.errors
        ?.map((item: { detail?: string; code?: string }) =>
          [item.code, item.detail].filter(Boolean).join(": "),
        )
        .join("; ") ||
      `PayMongo request failed with HTTP ${response.status}.`;
  
    console.error("PayMongo API error:", {
      status: response.status,
      path,
      response: message,
    });


    throw new Error(message);
  }

  return result as T;
}
