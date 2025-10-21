import * as path from "path";
import * as dotenv from "dotenv";
import { mustParse } from "../utils/string";

const envFile = process.env.NODE_ENV
    ? `.env.${process.env.NODE_ENV}`
    : ".env";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
const env = process.env;


import { botConfig } from "./botConfig";

export const RuntimeConfig = {
    environment: mustParse(env.NODE_ENV, 'NODE_ENV', String),
};

export {
    botConfig
}