// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OpkitDomains {
    // Domain struct to store the owner and the records
    struct Domain {
        address owner;
        mapping(string => string) stringRecords;
        mapping(string => address) addressRecords;
    }

    // Mapping from domain name to Domain struct
    mapping(string => Domain) private domains;

    // Event emitted when a domain is registered
    event DomainRegistered(string domain, address owner);

    // Event emitted when a string record is updated
    event StringRecordUpdated(string domain, string key, string newValue);

    // Event emitted when an address record is updated
    event AddressRecordUpdated(string domain, string key, address newValue);

    // Modifier to check if the sender is the owner of the domain
    modifier onlyOwner(string memory domain) {
        require(domains[domain].owner == msg.sender, "Caller is not the owner");
        _;
    }

    // Function to register a new domain
    function registerDomain(string memory domain) public {
        require(domains[domain].owner == address(0), "Domain already registered");
        domains[domain].owner = msg.sender;
        emit DomainRegistered(domain, msg.sender);
    }

    // Function to update the string record of an existing domain
    function updateStringRecord(string memory domain, string memory key, string memory value) public onlyOwner(domain) {
        domains[domain].stringRecords[key] = value;
        emit StringRecordUpdated(domain, key, value);
    }

    // Function to update the address record of an existing domain
    function updateAddressRecord(string memory domain, string memory key, address value) public onlyOwner(domain) {
        domains[domain].addressRecords[key] = value;
        emit AddressRecordUpdated(domain, key, value);
    }

    // Function to get the string record of a domain
    function getStringRecord(string memory domain, string memory key) public view returns (string memory) {
        return domains[domain].stringRecords[key];
    }

    // Function to get the address record of a domain
    function getAddressRecord(string memory domain, string memory key) public view returns (address) {
        return domains[domain].addressRecords[key];
    }

    // Function to get the owner of a domain
    function getDomainOwner(string memory domain) public view returns (address) {
        return domains[domain].owner;
    }
}