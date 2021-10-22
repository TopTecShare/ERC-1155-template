require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
const {
  privateKey,
  mainnetUrl,
  ropstenUrl,
  rinkebyUrl,
  etherscanApiKey,
  coinmarketCapKey,
} = require("./secretsManager.js");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 30,
    coinmarketcap: coinmarketCapKey,
  },
  namedAccounts: {
    deployer: 0,
  },

  // uncomment this and run: yarn deploy-rinkeby
  networks: {
    rinkeby: {
      url: rinkebyUrl,
      accounts: [`0x${privateKey}`],
    },
    ropsten: {
      url: ropstenUrl,
      accounts: [`0x${privateKey}`],
    },
    mainnet: {
      url: mainnetUrl,
      accounts: [`0x${privateKey}`],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: etherscanApiKey,
  },
};
