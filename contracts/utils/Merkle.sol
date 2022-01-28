//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Merkle is Ownable {
    bytes32 private whitelist;
    bytes32 private freeClaim;

    constructor(bytes32 _whitelist, bytes32 _freeClaim) {
        whitelist = _whitelist;
        freeClaim = _freeClaim;
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

    function _claimLeaf(address account, uint256 count)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(count, account));
    }

    function _whitelistVerify(bytes32 leaf, bytes32[] memory proof)
        internal
        view
        returns (bool)
    {
        return MerkleProof.verify(proof, whitelist, leaf);
    }

    function _claimVerify(bytes32 leaf, bytes32[] memory proof)
        internal
        view
        returns (bool)
    {
        return MerkleProof.verify(proof, freeClaim, leaf);
    }

    function setWhitelistRoot(bytes32 _root) external onlyOwner {
        whitelist = _root;
    }

    function setFreeClaimRoot(bytes32 _root) external onlyOwner {
        freeClaim = _root;
    }
}
