import { DateTime } from "./datetime.ts";

const cache = new Map<string, {last_updated: number, response: Response}>()

export const cache_fetch = async (url: string): Promise<Response> => {
  if(cache[url] !== undefined) {
    if(cache[url].last_updated + 1000 * 60 * 60 > DateTime.now().localData) {
      return cache[url].response;
    }
  }
  cache[url] = {
    last_updated: DateTime.now().localData,
    response: await fetch(url)
  }
  return cache[url].response;
}
