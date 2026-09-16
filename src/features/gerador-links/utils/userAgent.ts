export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";
export type BrowserType = "chrome" | "safari" | "firefox" | "edge" | "opera" | "samsung" | "unknown";
export type OSType = "android" | "ios" | "windows" | "mac" | "linux" | "unknown";

export type ParsedUA = {
  device: DeviceType;
  browser: BrowserType;
  os: OSType;
};

export function parseUA(ua: string | null): ParsedUA {
  if (!ua) return { device: "unknown", browser: "unknown", os: "unknown" };
  const s = ua.toLowerCase();

  // Device
  let device: DeviceType = "desktop";
  if (/android/i.test(s) && !/tablet/i.test(s)) device = "mobile";
  if (/ipad|tablet|playbook|silk/i.test(s)) device = "tablet";
  if (/iphone|ipod|mobile.*phone/i.test(s)) device = "mobile";
  if (/tablet|kindle|sm-t|kf/i.test(s)) device = "tablet";

  // Browser
  let browser: BrowserType = "unknown";
  if (/edg/i.test(s) && !/edge/i.test(s)) browser = "edge";
  if (/edge/i.test(s)) browser = "edge";
  if (/opr|opera/i.test(s)) browser = "opera";
  if (/chrome/i.test(s) && !/edg|opr/i.test(s)) browser = "chrome";
  if (/safari/i.test(s) && !/chrome|edg|opr/i.test(s) && !/crios/i.test(s)) browser = "safari";
  if (/firefox/i.test(s)) browser = "firefox";
  if (/samsung/i.test(s)) browser = "samsung";

  // OS
  let os: OSType = "unknown";
  if (/windows/i.test(s)) os = "windows";
  if (/mac os|macintosh/i.test(s) && !/iphone|ipad|ipod/i.test(s)) os = "mac";
  if (/android/i.test(s)) os = "android";
  if (/iphone|ipad|ipod|ios/i.test(s)) os = "ios";
  if (/linux/i.test(s) && !/android/i.test(s)) os = "linux";

  return { device, browser, os };
}
