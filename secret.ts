import { config } from "./deps.ts";

if (!Deno.env.has("DENO_DEPLOY")) {
  config({
    export: true,
    path: "./.env.local",
  });
}

export const Secret = {
  DISCORD_TOKEN: Deno.env.get("DISCORD_TOKEN")!,
};
