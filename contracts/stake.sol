// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// dev address: 0x01CB52008400316898535ef77d2844746Fdd90e5

pragma solidity ^0.8.4;

contract Skrll is IERC1155Receiver, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 200000000 * 1 ether;
    address public constant NFT_ADDRESS =
        0x01CB52008400316898535ef77d2844746Fdd90e5;
    bool public live = false;

    mapping(uint256 => uint256) internal NFTTimeStaked;
    mapping(uint256 => address) internal NFTStaker;
    mapping(address => uint256[]) internal stakerToNFT;

    IERC1155 private _NFTContract;

    constructor(address _contract) ERC20("Skrll", "Skrll") {
        _mint(msg.sender, 100000000 * 1 ether);
        _NFTContract = IERC1155(_contract);
    }

    modifier stakingEnabled() {
        require(live, "NOT_LIVE");
        _;
    }

    function getStakedNFT(address staker)
        public
        view
        returns (uint256[] memory)
    {
        return stakerToNFT[staker];
    }

    function getStakedAmount(address staker) public view returns (uint256) {
        return stakerToNFT[staker].length;
    }

    function getStaker(uint256 tokenId) public view returns (address) {
        return NFTStaker[tokenId];
    }

    function getAllRewards(address staker) public view returns (uint256) {
        uint256 totalRewards = 0;

        uint256[] memory NFTTokens = stakerToNFT[staker];
        for (uint256 i = 0; i < NFTTokens.length; i++) {
            totalRewards += getReward(NFTTokens[i]);
        }

        return totalRewards;
    }

    function stakeNFTById(uint256[] calldata tokenIds) external stakingEnabled {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 id = tokenIds[i];
            _NFTContract.safeTransferFrom(msg.sender, address(this), id, 1, "");

            stakerToNFT[msg.sender].push(id);
            NFTTimeStaked[id] = block.timestamp;
            NFTStaker[id] = msg.sender;
        }
    }

    function unstakeNFTByIds(uint256[] calldata tokenIds) external {
        uint256 totalRewards = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 id = tokenIds[i];
            require(NFTStaker[id] == msg.sender, "NEEDS_TO_BE_OWNER");
            _NFTContract.safeTransferFrom(address(this), msg.sender, id, 1, "");
            totalRewards += getReward(id);

            removeTokenIdFromArray(stakerToNFT[msg.sender], id);
            NFTStaker[id] = address(0);
        }

        uint256 remaining = MAX_SUPPLY - totalSupply();
        _mint(msg.sender, totalRewards > remaining ? remaining : totalRewards);
    }

    function unstakeAll() external {
        require(getStakedAmount(msg.sender) > 0, "NONE_STAKED");
        uint256 totalRewards = 0;

        for (uint256 i = stakerToNFT[msg.sender].length; i > 0; i--) {
            uint256 id = stakerToNFT[msg.sender][i - 1];
            _NFTContract.safeTransferFrom(address(this), msg.sender, id, 1, "");
            totalRewards += getReward(id);

            stakerToNFT[msg.sender].pop();
            NFTStaker[id] = address(0);
        }

        uint256 remaining = MAX_SUPPLY - totalSupply();
        _mint(msg.sender, totalRewards > remaining ? remaining : totalRewards);
    }

    function claimAll() external {
        uint256 totalRewards = 0;

        uint256[] memory NFTTokens = stakerToNFT[msg.sender];
        for (uint256 i = 0; i < NFTTokens.length; i++) {
            uint256 id = NFTTokens[i];

            totalRewards += getReward(id);
            NFTTimeStaked[id] = block.timestamp;
        }

        uint256 remaining = MAX_SUPPLY - totalSupply();
        _mint(msg.sender, totalRewards > remaining ? remaining : totalRewards);
    }

    function toggle() external onlyOwner {
        live = !live;
    }

    function getReward(uint256 tokenId) internal view returns (uint256) {
        return ((block.timestamp - NFTTimeStaked[tokenId]) / 86400) * 1 ether;
    }

    function removeTokenIdFromArray(uint256[] storage array, uint256 tokenId)
        internal
    {
        uint256 length = array.length;
        for (uint256 i = 0; i < length; i++) {
            if (array[i] == tokenId) {
                length--;
                if (i < length) {
                    array[i] = array[length];
                }
                array.pop();
                break;
            }
        }
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId)
        external
        pure
        override
        returns (bool)
    {
        return interfaceId == type(IERC1155).interfaceId;
    }
}
