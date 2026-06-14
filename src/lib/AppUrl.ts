export function appUrl(pathname: string, request: Request): URL {
  const configured = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  const base = configured && isAbsoluteUrl(configured) ? configured : request.url;
  const url = new URL(pathname, base);

  if (url.hostname === "0.0.0.0" || url.hostname === "::") {
    url.hostname = "localhost";
  }

  return url;
}

function isAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
