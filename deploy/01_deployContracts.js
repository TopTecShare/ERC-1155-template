const { network } = require("hardhat");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("ShibeFace", {
    from: deployer,
    log: true,
    args: [
      "https://ipfs.io/ipfs/QmQtN81i9eNrD3wxcr67scDpLvZDDXxbmAvNXMaZh3D6tB/",
    ],
  });
};
module.exports.tags = ["all", "ShibeFace"];
