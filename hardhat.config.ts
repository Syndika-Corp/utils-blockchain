import { HardhatUserConfig } from "hardhat/config";
import 'dotenv/config';
import { getEnvVar } from "./utils/env-validation";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      /*
        Local chain configuration
      */
      forking: {
        url: getEnvVar('FORK_PROVIDER'),
        blockNumber: 17335928
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
    }
  }
};

export default config;