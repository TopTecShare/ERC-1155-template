async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const NFTCollection = await ethers.getContractFactory("NFTCollection");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nFTCollection = await NFTCollection.deploy();
  await NFTMarketplace.deploy(nFTCollection.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
