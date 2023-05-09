// discordeno
export * from "https://deno.land/x/discordeno@18.0.1/mod.ts";

// dotenv
export { config } from "https://deno.land/x/dotenv/mod.ts";

// env
import { Env } from "https://deno.land/x/env/env.js";
const env = new Env();
export { env }

// dom
export { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// datetime
/*
export {
  DateTime,
  datetime,
  diffInMillisec,
} from "https://deno.land/x/ptera/mod.ts";
*/

// 多分datetimeをLocaleで扱うやつ、自作ライブラリで作った方がいいな