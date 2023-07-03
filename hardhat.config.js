require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  defaultNetwork: "localhost",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_RPC_URL,
      accounts: [process.env.SEPOLIA_PRIV_KEY]
    },
    goerli: {
      url: process.env.ALCHEMY_GORLI_RPC_URL,
      accounts: [process.env.GORLI_PRIV_KEY]
    }
  },
  solidity: {
    version: "0.8.18"
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}