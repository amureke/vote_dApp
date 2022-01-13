pragma solidity 0.4.25;

import "./ERC20Interface.sol";

contract Election {
    // Model a Proposal
    struct Proposal {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Proposals
    // Fetch Proposal
    mapping(uint => Proposal) public proposals;
    // Store Proposals Count
    uint public proposalsCount;


    // voted event
    event votedEvent (
        uint indexed _proposalId
    );

    function Election () public {
        addProposal("1st 6 Month Proposal : Burn VTT");
        addProposal("1st 6 Month Proposal : Swap VTT to BTC");
        addProposal("1st 6 Month Proposal : Swap VTT to ETH");
        addProposal("1st 6 Month Proposal : Swap VTT to EGC");
        addProposal("1st 6 Month Proposal : Send VTT to Rewards");

    }

    function addProposal (string _name) private {
        proposalsCount ++;
        proposals[proposalsCount] = Proposal(proposalsCount, _name, 0);
    }

    function queryERC20Balance(address _tokenAddress, address _addressToQuery) view public returns (uint) {
        return ERC20Interface(_tokenAddress).balanceOf(_addressToQuery);
    }

    function vote (uint _proposalId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid proposal
        require(_proposalId > 0 && _proposalId <= proposalsCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update proposal vote Count

        // update candidate vote Count
        //candidates[_candidateId].voteCount ++;
        //uint index;

        // proposals[_proposalId].voteCount += 1;
        proposals[_proposalId].voteCount += (1 + queryERC20Balance(0x71eCD162be34bdeC113b6D852a88a410502b126d,msg.sender));

        // trigger voted event
        votedEvent(_proposalId);
    }
}
