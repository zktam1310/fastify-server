import dotenv from 'dotenv';
import { env } from 'process'

if (env.ENV_NODE !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const environments = {
  PORT: env.PORT ?? 8080,
  MONGO_URI: env.MONGO_URI,
  PG_URI: env.PG_URI
}

export default environments;
