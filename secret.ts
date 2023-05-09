import { config, env } from "./deps.ts";

if (!env.has("DENO_DEPLOY")) {
  config({
    export: true,
    path: "./.env.local",
  });
}

export const Secret = {
  DISCORD_TOKEN: Deno.env.get("DISCORD_TOKEN")!,
};
