// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IStakingPool {
    function startStaking(address _staker, uint256 _tokenId) external;

    function stopStaking(address _staker, uint256 _tokenId) external;
}

contract Penguins is ERC721Enumerable, Ownable, ERC721Burnable, Pausable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;
    IStakingPool private _pool;

    uint256 public constant MAX_ELEMENTS = 1000;
    uint256 public constant PRICE = 0.25 ether;

    string public baseTokenURI;

    event CreatePenguin(uint256 indexed id);
    event PoolAddrSet(address addr);

    constructor(string memory baseURI, address _poolAddr)
        ERC721("Penguins", "PG")
    {
        setBaseURI(baseURI);
        pause(true);
        _pool = IStakingPool(_poolAddr);
    }

    modifier saleIsOpen() {
        require(_totalSupply() <= MAX_ELEMENTS, "Sale end");
        if (_msgSender() != owner()) {
            require(!paused(), "Pausable: paused");
        }
        _;
    }

    function _totalSupply() internal view returns (uint256) {
        return _tokenIdTracker.current();
    }

    function totalMint() public view returns (uint256) {
        return _totalSupply();
    }

    /**
     * @dev Mint the _amount of tokens
     * @param _amount is the token count
     */
    function mint(address _to, uint256 _amount) public payable saleIsOpen {
        uint256 total = _totalSupply();
        require(total + _amount <= MAX_ELEMENTS, "Max limit");
        require(total <= MAX_ELEMENTS, "Sale end");
        require(msg.value >= price(_amount), "Value below price");

        for (uint256 i = 0; i < _amount; i++) {
            _mintAnElement(_to);
        }
    }

    function _mintAnElement(address _to) private {
        uint256 id = _totalSupply();
        _tokenIdTracker.increment();
        _safeMint(_to, id);
        emit CreatePenguin(id);
    }

    function price(uint256 _count) public pure returns (uint256) {
        return PRICE.mul(_count);
    }

    /**
     * @dev set the _baseTokenURI
     * @param baseURI of the _baseTokenURI
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function walletOfOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(_owner);

        uint256[] memory tokensId = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokensId;
    }

    function pause(bool val) public onlyOwner {
        if (val == true) {
            _pause();
            return;
        }
        _unpause();
    }

    function withdraw() public payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0);
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed.");
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
        if (_msgSender() != owner()) {
            require(!paused(), "ERC721Pausable: token transfer while paused");
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /*******************************************************************************
     ***                            Staking Logic                                 ***
     ******************************************************************************** */

    function startStaking(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "Staking: owner not matched");

        _pool.startStaking(msg.sender, _tokenId);
        _safeTransfer(msg.sender, address(_pool), _tokenId, "");
    }

    function stopStaking(uint256 _tokenId) external {
        _pool.stopStaking(msg.sender, _tokenId);
        _safeTransfer(address(_pool), msg.sender, _tokenId, "");
    }

    function setStakingPool(address _addr) external onlyOwner {
        _pool = IStakingPool(_addr);
        emit PoolAddrSet(_addr);
    }
}
