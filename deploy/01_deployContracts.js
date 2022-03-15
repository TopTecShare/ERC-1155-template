const { network } = require("hardhat");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const shibNFT = await deploy("ShibeFace", {
    from: deployer,
    log: true,
    args: [
      "bcef84a3b38d1f4dad329532950aef851e42d982ab87d00b11cc8e241d61d074",
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
