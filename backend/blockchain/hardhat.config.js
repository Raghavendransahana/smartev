require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true // Enable IR compiler to fix stack too deep issues
    }
  },
  networks: {
    10.10.40.174: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      chainId: 1337
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

//npx hardhat node

// npx hardhat run scripts/deploy.ts --network 10.10.40.174
// npx hardhat test --network 10.10.40.174
// npx hardhat node
//  
//npx hardhat verify --network <NETWORK_NAME> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>

