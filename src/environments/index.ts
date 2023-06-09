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
  SALT_ROUNDS: Number(env.SALT_ROUNDS) ?? 10,
  JWT_SECRET: env.JWT_SECRET ?? "jXn2r5u8x/A?D*G-KaPdSgVkYp3s6v9y",
  TWOFA_ENCRYPT_KEY: env.TWOFA_ENCRYPT_KEY ?? "E(G+KbPeShVmYq3t6w9z$C&F)J@McQfT"
}

for (let env of Object.keys(environments)) {
  if (environments[env] == undefined) {
    console.log(`${env} is missing in environments`);
    process.exit(0);
  }
}

export default environments;
