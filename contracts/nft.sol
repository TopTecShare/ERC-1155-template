/**
 *Submitted for verification at Etherscan.io on 2022-01-21
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

// Dev: 0x67145faCE41F67E17210A12Ca093133B3ad69592

contract DogeFace is ERC1155, Ownable {
    string public constant name = "DogeFace";
    string public constant symbol = "DOGE";

    uint32 public totalSupply = 0;
    uint256 public constant unitPrice = 0.0777 ether;

    uint32 public preSaleStart = 1638043200;
    uint32 public constant preSaleMaxSupply = 1000;

    uint32 public publicSaleStart = 1638054000;
    uint32 public constant publicSaleMaxSupply = 3333;

    address private signerAddress = 0xbc4f847004FA914F6Fe82BEa27A9dFBdbE295401;

    constructor(string memory uri) ERC1155(uri) {}

    function setURI(string memory uri) public onlyOwner {
        _setURI(uri);
    }

    function setSignerAddress(address addr) external onlyOwner {
        signerAddress = addr;
    }

    function setPreSaleStart(uint32 timestamp) public onlyOwner {
        preSaleStart = timestamp;
    }

    function setPublicSaleStart(uint32 timestamp) public onlyOwner {
        publicSaleStart = timestamp;
    }

    function preSaleIsActive() public view returns (bool) {
        return
            preSaleStart <= block.timestamp &&
            publicSaleStart >= block.timestamp;
    }

    function publicSaleIsActive() public view returns (bool) {
        return publicSaleStart <= block.timestamp;
    }

    function isValidAccessMessage(
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(msg.sender));
        return
            signerAddress ==
            ecrecover(
                keccak256(
                    abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
                ),
                v,
                r,
                s
            );
    }

    function mint(address to, uint32 count) internal {
        if (count > 1) {
            uint256[] memory ids = new uint256[](uint256(count));
            uint256[] memory amounts = new uint256[](uint256(count));

            for (uint32 i = 0; i < count; i++) {
                ids[i] = totalSupply + i;
                amounts[i] = 1;
            }

            _mintBatch(to, ids, amounts, "");
        } else {
            _mint(to, totalSupply, 1, "");
        }

        totalSupply += count;
    }

    function preSaleMint(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint32 count
    ) external payable {
        require(preSaleIsActive(), "Pre-sale is not active.");
        require(isValidAccessMessage(v, r, s), "Not whitelisted.");
        require(count > 0, "Count must be greater than 0.");
        require(
            totalSupply + count <= preSaleMaxSupply,
            "Count exceeds the maximum allowed supply."
        );
        require(msg.value >= unitPrice * count, "Not enough ether.");

        mint(msg.sender, count);
    }

    function publicSaleMint(uint32 count) external payable {
        require(publicSaleIsActive(), "Public sale is not active.");
        require(count > 0, "Count must be greater than 0.");
        require(
            totalSupply + count <= publicSaleMaxSupply,
            "Count exceeds the maximum allowed supply."
        );
        require(msg.value >= unitPrice * count, "Not enough ether.");

        mint(msg.sender, count);
    }

    function batchMint(address[] memory addresses) external onlyOwner {
        require(
            totalSupply + addresses.length <= publicSaleMaxSupply,
            "Count exceeds the maximum allowed supply."
        );

        for (uint256 i = 0; i < addresses.length; i++) {
            mint(addresses[i], 1);
        }
    }

    function withdraw() public payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0);
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed.");
    }
}
