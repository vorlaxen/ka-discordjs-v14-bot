import * as path from "path";
import * as dotenv from "dotenv";
import { mustParse } from "../utils/string";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const env = process.env;

import { botConfig } from "./botConfig";
import { databaseConfig } from "./databaseConfig";
import { redisClientConfig } from "./redisClientConfig";

export const RuntimeConfig = {
    environment: mustParse(env.NODE_ENV, 'NODE_ENV', String),
};

export {
    botConfig,
    databaseConfig,
    redisClientConfig
}