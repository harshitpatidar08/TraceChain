// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChainLogger {
    
    struct Event {
        string traceId;
        string stage;
        string actorRole;
        string eventHash;
        uint256 timestamp;
    }
    
    Event[] public events;
    
    event EventLogged(
        string traceId,
        string stage, 
        string actorRole,
        string eventHash,
        uint256 timestamp
    );
    
    function logEvent(
        string memory traceId,
        string memory stage,
        string memory actorRole,
        string memory eventHash
    ) public {
        events.push(Event({
            traceId: traceId,
            stage: stage,
            actorRole: actorRole,
            eventHash: eventHash,
            timestamp: block.timestamp
        }));
        
        emit EventLogged(
            traceId,
            stage,
            actorRole,
            eventHash,
            block.timestamp
        );
    }
    
    function getEventCount() public view returns (uint256) {
        return events.length;
    }
}
