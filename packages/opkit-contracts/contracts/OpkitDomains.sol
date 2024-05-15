// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OpkitDomains {
    // Domain struct to store the owner and the records
    struct Domain {
        address owner;
        mapping(string => string) stringRecords;
    }

    // Mapping from domain name to Domain struct
    mapping(string => Domain) private domains;

    // Event emitted when a domain is registered
    event DomainRegistered(string domain, address owner);

    // Event emitted when a string record is updated
    event StringRecordUpdated(string domain, string key, string newValue);

    // Modifier to check if the sender is the owner of the domain
    modifier onlyOwner(string memory domain) {
        require(domains[domain].owner == msg.sender, "Caller is not the owner");
        _;
    }

    // Function to register a new domain
    function register(string memory domain, address owner, string[] memory keys, string[] memory values) public {
        require(owner != address(0), "Null address");
        require(domains[domain].owner == address(0) || domains[domain].owner == owner, "Domain already registered");

        if (domains[domain].owner == address(0)) {
            domains[domain].owner = owner;
            emit DomainRegistered(domain, owner);
        }

        uint256 keysLength = keys.length;
        require(keysLength == values.length, "Not eq length");

        unchecked {
            for (uint256 i = 0; i < keysLength; i++) {
                domains[domain].stringRecords[keys[i]] = values[i];
                emit StringRecordUpdated(domain, keys[i], values[i]);
            }
        }
    }

    // Function to update the string record of an existing domain
    function updateStringRecord(string memory domain, string memory key, string memory value) public onlyOwner(domain) {
        domains[domain].stringRecords[key] = value;
        emit StringRecordUpdated(domain, key, value);
    }

    // Function to get the string record of a domain
    function getStringRecord(string memory domain, string memory key) public view returns (string memory) {
        return domains[domain].stringRecords[key];
    }

    // Function to get the owner of a domain
    function getDomainOwner(string memory domain) public view returns (address) {
        return domains[domain].owner;
    }
}