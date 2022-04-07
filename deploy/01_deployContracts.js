const { network } = require("hardhat");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const shibNFT = await deploy("ShibeFace", {
    from: deployer,
    log: true,
    args: [
      "0xa3fa8ecd3a22b3596a752b0c3984fe21c62aa4c8bb4bba2006ef049fb209d429",
      "https://ipfs.io/ipfs/QmQtN81i9eNrD3wxcr67scDpLvZDDXxbmAvNXMaZh3D6tB/",
    ],
  });

  // await shibNFT.deployed();
  await deploy("Skrll", {
    from: deployer,
    log: true,
    args: [shibNFT.address],
  });
};
module.exports.tags = ["all", "ShibeFace"];
