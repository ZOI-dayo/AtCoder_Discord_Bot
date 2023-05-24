import { DateTime } from "./datetime.ts";

const cache = new Map<string, {last_updated: number, response: string}>()

export const cache_fetch = async (url: string): Promise<string> => {
  if(cache[url] !== undefined) {
    if(cache[url].last_updated + 1000 * 60 * 60 > DateTime.now().localData) {
      return cache[url].response;
    }
  }
  cache[url] = {
    last_updated: DateTime.now().localData,
    response: await (await fetch(url)).text()
  }
  return cache[url].response;
}
