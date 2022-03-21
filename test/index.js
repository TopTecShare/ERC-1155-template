// We import Chai to use its asserting functions here.
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers } = require("hardhat");
const zeroAddress = "0x0000000000000000000000000000000000000000";

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` recieves the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("ShibeFace", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    contract = await ethers.getContractFactory("ShibeFace");
    contract2 = await ethers.getContractFactory("Skrll");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    hardhatToken = await contract.deploy(
      "0xa3fa8ecd3a22b3596a752b0c3984fe21c62aa4c8bb4bba2006ef049fb209d429",
      "https://ipfs.io/ipfs/QmQtN81i9eNrD3wxcr67scDpLvZDDXxbmAvNXMaZh3D6tB/"
    );

    // We can interact with the contract by calling `hardhatToken.method()`
    await hardhatToken.deployed();

    hardhatStake = await contract2.deploy(hardhatToken.address);
    await hardhatStake.deployed();

    await hardhatToken.setShib(hardhatStake.address);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an assertion objet. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Presale Mint with ETH", async function () {
      await hardhatToken.setPreSaleStart(1000000000);
      await hardhatToken.setPublicSaleStart(2000000000);
      let totalsupply = await hardhatToken.totalSupply();
      await expect(
        hardhatToken.preSaleMintWithEth(
          [
            "0xad1f48422681f391c3c6af9d4db2d97244fda2958680a699155b4340a530a1ff",
            "0x10fbfe543e515e20b8aec49acfafb7d97ad43a5586660010a21730e60e464606",
            "0x8f3ef021dfc9d72bfe3a53ff1ed7551f7a7de20b2ac6628d2cdc935e1834b2a6",
          ],
          {
            value: utils.parseEther("0.1554"),
          }
        )
      )
        .to.emit(hardhatToken, "CreateShib")
        .withArgs(owner.address, totalsupply);
    });

    it("Presale Mint with Shib", async function () {
      await hardhatToken.setPreSaleStart(1000000000);
      await hardhatToken.setPublicSaleStart(2000000000);
      let totalsupply = await hardhatToken.totalSupply();
      hardhatStake.approve(hardhatToken.address, "20000000000000000000000000");
      await expect(
        hardhatToken.preSaleMintWithShib([
          "0xad1f48422681f391c3c6af9d4db2d97244fda2958680a699155b4340a530a1ff",
          "0x10fbfe543e515e20b8aec49acfafb7d97ad43a5586660010a21730e60e464606",
          "0x8f3ef021dfc9d72bfe3a53ff1ed7551f7a7de20b2ac6628d2cdc935e1834b2a6",
        ])
      )
        .to.emit(hardhatToken, "CreateShib")
        .withArgs(owner.address, totalsupply);
    });

    it("Public Sale Mint with ETH", async function () {
      await hardhatToken.setPublicSaleStart(1000000000);
      let totalsupply = await hardhatToken.totalSupply();
      await expect(
        hardhatToken.publicSaleMintWithEth(2, {
          value: utils.parseEther("0.1998"),
        })
      )
        .to.emit(hardhatToken, "CreateShib")
        .withArgs(owner.address, totalsupply);
    });

    it("Public Sale Mint with Shib", async function () {
      hardhatStake.approve(hardhatToken.address, "20000000000000000000000000");
      await hardhatToken.setPublicSaleStart(1000000000);
      let totalsupply = await hardhatToken.totalSupply();
      await expect(hardhatToken.publicSaleMintWithShib(2))
        .to.emit(hardhatToken, "CreateShib")
        .withArgs(owner.address, totalsupply);
    });
  });

  describe("Staking", function () {
    it("Should receiver ERC1155 token", async function () {
      await hardhatToken.setPublicSaleStart(1000000000);
      let totalsupply = await hardhatToken.totalSupply();
      await expect(
        hardhatToken.publicSaleMintWithEth(2, {
          value: utils.parseEther("0.1998"),
        })
      )
        .to.emit(hardhatToken, "CreateShib")
        .withArgs(owner.address, totalsupply);
      await hardhatToken.safeTransferFrom(
        owner.address,
        hardhatStake.address,
        0,
        1,
        "0x00"
      );
    });

    xit("Should", async function () {});
  });

  describe("Reveal", function () {
    it("Should reveal by owner", async function () {
      await hardhatToken.setURI(
        "https://gateway.pinata.cloud/ipfs/QmQsL8LG1ghPMEKeWx9nCj1NWUjEppRkuhyUcnoR4sTBo5/"
      );

      const baseTokenURI = await hardhatToken.uri(1);
      await expect(baseTokenURI).to.be.eql(
        "https://gateway.pinata.cloud/ipfs/QmQsL8LG1ghPMEKeWx9nCj1NWUjEppRkuhyUcnoR4sTBo5/"
      );
    });
  });
  // describe("Pause", function () {
  //   it("Should fail burn when paused if not owner", async function () {
  //     await hardhatToken.pause(true);

  //     await expect(
  //       await hardhatToken.mint(3, {
  //         value: utils.parseEther("0.75"),
  //       })
  //     )
  //       .to.emit(hardhatToken, "CreatePenguin")
  //       .withArgs(0);

  //     await hardhatToken.transferFrom(owner.address, addr1.address, 1);

  //     await expect(hardhatToken.connect(addr1).burn(1)).to.be.revertedWith(
  //       "Pausable: paused"
  //     );
  //   });

  //   it("Should fail mint when paused if not owner", async function () {
  //     await hardhatToken.pause(true);

  //     await expect(
  //       hardhatToken.connect(addr1).mint(3, {
  //         value: utils.parseEther("0.75"),
  //       })
  //     ).to.be.revertedWith("Pausable: paused");
  //   });

  //   it("Should fail transfer when paused if not owner", async function () {
  //     await hardhatToken.pause(true);

  //     await expect(
  //       hardhatToken.mint(3, {
  //         value: utils.parseEther("0.75"),
  //       })
  //     )
  //       .to.emit(hardhatToken, "CreatePenguin")
  //       .withArgs(0);

  //     await hardhatToken.approve(addr1.address, 1);

  //     await expect(
  //       hardhatToken
  //         .connect(addr1)
  //         .transferFrom(owner.address, addr1.address, 1)
  //     ).to.be.revertedWith("ERC721Pausable: token transfer while paused");
  //   });

  //   it("Should burn when paused if owner", async function () {
  //     await expect(
  //       hardhatToken.mint(3, {
  //         value: utils.parseEther("0.75"),
  //       })
  //     )
  //       .to.emit(hardhatToken, "CreatePenguin")
  //       .withArgs(0);

  //     await hardhatToken.approve(addr1.address, 1);

  //     await hardhatToken.transferFrom(owner.address, addr1.address, 1);
  //   });

  //   it("Should mint when paused if owner", async function () {
  //     await expect(
  //       hardhatToken.mint(3, {
  //         value: utils.parseEther("0.75"),
  //       })
  //     )
  //       .to.emit(hardhatToken, "CreatePenguin")
  //       .withArgs(0);

  //     await hardhatToken.transferFrom(owner.address, addr1.address, 1);
  //   });

  //   it("Should transfer when paused if owner", async function () {
  //     await expect(
  //       hardhatToken.mint(3, {
  //         value: utils.parseEther("0.75"),
  //       })
  //     )
  //       .to.emit(hardhatToken, "CreatePenguin")
  //       .withArgs(0);

  //     await hardhatToken.approve(addr1.address, 1);

  //     await hardhatToken.transferFrom(owner.address, addr1.address, 1);
  //   });
  // });

  // describe("Burning", function () {
  //   it("Should burn token by owner when not paused", async function () {
  //     await expect(
  //       await hardhatToken.mint(3, {
  //         value: utils.parseEther("0.75"),
  //       })
  //     )
  //       .to.emit(hardhatToken, "CreatePenguin")
  //       .withArgs(0);

  //     await expect(hardhatToken.burn(0))
  //       .to.emit(hardhatToken, "Transfer")
  //       .withArgs(owner.address, zeroAddress, 0);
  //   });

  //   it("Should burn token by approver when not paused", async function () {
  //     await expect(
  //       await hardhatToken.mint(3, {
  //         value: utils.parseEther("0.75"),
  //       })
  //     )
  //       .to.emit(hardhatToken, "CreatePenguin")
  //       .withArgs(0);

  //     await hardhatToken.approve(addr1.address, 1);

  //     await expect(hardhatToken.connect(addr1).burn(1))
  //       .to.emit(hardhatToken, "Transfer")
  //       .withArgs(owner.address, zeroAddress, 1);
  //   });

  //   it("Should fail burn non existing token", async function () {
  //     await expect(hardhatToken.burn(1)).to.be.revertedWith(
  //       "ERC721: operator query for nonexistent token"
  //     );
  //   });

  //   it("Should fail burn token not by approver or owner", async function () {
  //     await expect(
  //       await hardhatToken.mint(3, {
  //         value: utils.parseEther("0.75"),
  //       })
  //     )
  //       .to.emit(hardhatToken, "CreatePenguin")
  //       .withArgs(0);

  //     await hardhatToken.transferFrom(owner.address, addr1.address, 1);

  //     await expect(hardhatToken.burn(1)).to.be.revertedWith(
  //       "ERC721Burnable: caller is not owner nor approved"
  //     );
  //   });
  // });
});
