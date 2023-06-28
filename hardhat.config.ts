import { HardhatUserConfig } from "hardhat/config";
import 'dotenv/config';

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      /*
        Local chain configuration
      */
      forking: {
        url: `${process.env.FORK_PROVIDER}`,
        blockNumber: 17335928
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
    }
  }
};

export default config;