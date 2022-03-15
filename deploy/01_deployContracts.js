const { network } = require("hardhat");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const shibNFT = await deploy("ShibeFace", {
    from: deployer,
    log: true,
    args: [
      "https://ipfs.io/ipfs/QmQtN81i9eNrD3wxcr67scDpLvZDDXxbmAvNXMaZh3D6tB/",
    ],
  });
  await deploy("Skrll", {
    from: deployer,
    log: true,
    args: [shibNFT.address],
  });
};
module.exports.tags = ["all", "ShibeFace"];
