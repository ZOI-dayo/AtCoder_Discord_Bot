import { config } from "./deps.ts"

config({
    export: true,
    path: "./.env.local",
})

export const Secret = {
    DISCORD_TOKEN: Deno.env.get("DISCORD_TOKEN")!,
}