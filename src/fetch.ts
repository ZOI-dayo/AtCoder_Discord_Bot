import { DateTime } from "./datetime.ts";

const cache = new Map<string, {last_updated: number, response: string}>()

export const cache_fetch = async (url: string): Promise<string> => {
  if(cache.has(url)) {
    if(cache.get(url)!.last_updated + 1000 * 60 * 60 > DateTime.now().localData) {
      return cache.get(url)!.response;
    }
  }
  const content = {
    last_updated: DateTime.now().localData,
    response: await (await fetch(url)).text()
  };
  cache.set(url, content);
  return content.response;
}
