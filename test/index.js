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
describe("Penguins", function () {
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
    contract = await ethers.getContractFactory("Penguins");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    hardhatToken = await contract.deploy(
      "https://ipfs.io/ipfs/QmQtN81i9eNrD3wxcr67scDpLvZDDXxbmAvNXMaZh3D6tB/",
      "0x6F84Fa72Ca4554E0eEFcB9032e5A4F1FB41b726C"
    );

    // We can interact with the contract by calling `hardhatToken.method()`
    await hardhatToken.deployed();
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
    it("Should mint tokens after unpaused", async function () {
      // await expect(hardhatToken.pause(false))
      //   .to.emit(hardhatToken, "Unpaused")
      //   .withArgs(owner.address);

      await expect(
        await hardhatToken.mint(3, {
          value: utils.parseEther("0.75"),
        })
      )
        .to.emit(hardhatToken, "CreatePenguin")
        .withArgs(0);
    });

    it("Should fail mint if it exceeds Max limit", async function () {
      await expect(
        hardhatToken.mint(3000, {
          value: utils.parseEther("750"),
        })
      ).to.be.revertedWith("Max limit");
    });

    it("Should fail mint if value is below price", async function () {
      await expect(
        hardhatToken.mint(1, {
          value: utils.parseEther("0.2"),
        })
      ).to.be.revertedWith("Value below price");
    });

    it("Should fail mint if sale ended", async function () {
      for (let i = 0; i < 10; i++)
        await hardhatToken.mint(100, {
          value: utils.parseEther("25"),
        });

      const totalSupply = Number(await hardhatToken.totalSupply());
      expect(totalSupply).to.be.eql(1000);

      const pause = await hardhatToken.paused();
      expect(pause).to.be.eql(true);

      await expect(
        hardhatToken.mint(1, {
          value: utils.parseEther("0.25"),
        })
      ).to.be.revertedWith("Sale end");
    });
  });

  describe("Burning", function () {
    it("Should burn token by owner when not paused", async function () {
      await expect(
        await hardhatToken.mint(3, {
          value: utils.parseEther("0.75"),
        })
      )
        .to.emit(hardhatToken, "CreatePenguin")
        .withArgs(0);

      await expect(hardhatToken.burn(0))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(owner.address, zeroAddress, 0);
    });

    it("Should burn token by approver when not paused", async function () {
      await expect(
        await hardhatToken.mint(3, {
          value: utils.parseEther("0.75"),
        })
      )
        .to.emit(hardhatToken, "CreatePenguin")
        .withArgs(0);

      await hardhatToken.approve(addr1.address, 1);

      await hardhatToken.pause(false);
      await expect(hardhatToken.connect(addr1).burn(1))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(owner.address, zeroAddress, 1);
    });

    it("Should fail burn non existing token", async function () {
      await expect(hardhatToken.burn(1)).to.be.revertedWith(
        "ERC721: operator query for nonexistent token"
      );
    });

    it("Should fail burn token not by approver or owner", async function () {
      await expect(
        await hardhatToken.mint(3, {
          value: utils.parseEther("0.75"),
        })
      )
        .to.emit(hardhatToken, "CreatePenguin")
        .withArgs(0);

      await hardhatToken.transferFrom(owner.address, addr1.address, 1);

      await expect(hardhatToken.burn(1)).to.be.revertedWith(
        "ERC721Burnable: caller is not owner nor approved"
      );
    });
  });

  describe("Pause", function () {
    it("Should fail burn when paused if not owner", async function () {
      await expect(
        await hardhatToken.mint(3, {
          value: utils.parseEther("0.75"),
        })
      )
        .to.emit(hardhatToken, "CreatePenguin")
        .withArgs(0);

      await hardhatToken.transferFrom(owner.address, addr1.address, 1);

      await expect(hardhatToken.connect(addr1).burn(1)).to.be.revertedWith(
        "Pausable: paused"
      );
    });

    it("Should fail mint when paused if not owner", async function () {
      await expect(
        hardhatToken.connect(addr1).mint(3, {
          value: utils.parseEther("0.75"),
        })
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should fail transfer when paused if not owner", async function () {
      await expect(
        hardhatToken.mint(3, {
          value: utils.parseEther("0.75"),
        })
      )
        .to.emit(hardhatToken, "CreatePenguin")
        .withArgs(0);

      await hardhatToken.approve(addr1.address, 1);

      await expect(
        hardhatToken
          .connect(addr1)
          .transferFrom(owner.address, addr1.address, 1)
      ).to.be.revertedWith("ERC721Pausable: token transfer while paused");
    });

    it("Should burn when paused if owner", async function () {
      await expect(
        hardhatToken.mint(3, {
          value: utils.parseEther("0.75"),
        })
      )
        .to.emit(hardhatToken, "CreatePenguin")
        .withArgs(0);

      await hardhatToken.approve(addr1.address, 1);

      await hardhatToken.transferFrom(owner.address, addr1.address, 1);
    });

    it("Should mint when paused if owner", async function () {
      await expect(
        hardhatToken.mint(3, {
          value: utils.parseEther("0.75"),
        })
      )
        .to.emit(hardhatToken, "CreatePenguin")
        .withArgs(0);

      await hardhatToken.transferFrom(owner.address, addr1.address, 1);
    });

    it("Should transfer when paused if owner", async function () {
      await expect(
        hardhatToken.mint(3, {
          value: utils.parseEther("0.75"),
        })
      )
        .to.emit(hardhatToken, "CreatePenguin")
        .withArgs(0);

      await hardhatToken.approve(addr1.address, 1);

      await hardhatToken.transferFrom(owner.address, addr1.address, 1);
    });
  });

  describe("Staking", function () {
    it("Should set staking contract address by owner", async function () {
      await expect(hardhatToken.setStakingPool(zeroAddress))
        .to.emit(hardhatToken, "PoolAddrSet")
        .withArgs(zeroAddress);
    });

    xit("Should", async function () {});

    xit("Should", async function () {});
  });

  describe("Reveal", function () {
    it("Should reveal by owner", async function () {
      await hardhatToken.setBaseURI(
        "https://gateway.pinata.cloud/ipfs/QmQsL8LG1ghPMEKeWx9nCj1NWUjEppRkuhyUcnoR4sTBo5/"
      );

      const baseTokenURI = await hardhatToken.baseTokenURI();
      await expect(baseTokenURI).to.be.eql(
        "https://gateway.pinata.cloud/ipfs/QmQsL8LG1ghPMEKeWx9nCj1NWUjEppRkuhyUcnoR4sTBo5/"
      );
    });
  });
});
