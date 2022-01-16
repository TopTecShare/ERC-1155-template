const { network } = require("hardhat");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Penguins", {
    from: deployer,
    log: true,
    args: [
      "https://ipfs.io/ipfs/QmQtN81i9eNrD3wxcr67scDpLvZDDXxbmAvNXMaZh3D6tB/",
      "0x6F84Fa72Ca4554E0eEFcB9032e5A4F1FB41b726C",
    ],
  });
};
module.exports.tags = ["all", "Penguins"];
