const { network } = require("hardhat");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  let NFTCollection = await deploy("NFTCollection", {
    from: deployer,
    log: true,
  });

  console.log(NFTCollection.address);
  await deploy("NFTMarketplace", {
    from: deployer,
    log: true,
    args: [NFTCollection.address],
  });

};
module.exports.tags = ["all", "Auction"];
