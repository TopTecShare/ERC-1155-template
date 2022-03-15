//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Merkle is Ownable {
    bytes32 private whitelist;

    constructor(bytes32 _whitelist) {
        whitelist = _whitelist;
    }

    function _whitelistLeaf(
        address account /*, uint256 tokenId*/
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    /*tokenId,*/
                    account
                )
            );
    }

    function _whitelistVerify(bytes32 leaf, bytes32[] memory proof)
        internal
        view
        returns (bool)
    {
        return MerkleProof.verify(proof, whitelist, leaf);
    }

    function setWhitelistRoot(bytes32 _root) external onlyOwner {
        whitelist = _root;
    }
}
