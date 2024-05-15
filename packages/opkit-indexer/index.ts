import { EventLog, ethers } from "ethers";
import sqlite3 from "sqlite3";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import contractABI from './OpkitDomains.json'

dotenv.config();

const contractAddress = process.env.CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS";

// Define the block number where the contract was created
const contractCreationBlock = Number(process.env.CONTRACT_CREATION_BLOCK) || 0;

// Define the SQLite database file
const dbFile = "domains.db";

// Define interfaces for query results
interface DomainRow {
    domain: string;
    owner: string;
    timestamp: number;
    tx_hash: string;
    log_index: number;
}

interface StringRecordRow {
    domain: string;
    key: string;
    value: string;
    timestamp: number;
    tx_hash: string;
    log_index: number;
}

// Connect to the SQLite database
const connectDb = () => {
    return new sqlite3.Database(dbFile);
};

// Initialize the database with required tables
const initDb = (db: sqlite3.Database) => {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS domains (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT,
                owner TEXT,
                timestamp INTEGER,
                tx_hash TEXT,
                log_index INTEGER,
                UNIQUE(domain, timestamp)
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS string_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT,
                key TEXT,
                value TEXT,
                timestamp INTEGER,
                tx_hash TEXT,
                log_index INTEGER,
                UNIQUE(domain, key, timestamp),
                FOREIGN KEY (domain) REFERENCES domains(domain)
            )
        `);
        db.run(`CREATE INDEX IF NOT EXISTS idx_domains_owner ON domains (owner)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_string_records_key_value ON string_records (key, value)`);
    });
};

// Convert block number to timestamp
const blockToTimestamp = async (blockNumber: number, provider: ethers.Provider): Promise<number> => {
    const block = await provider.getBlock(blockNumber);
    if (!block) throw new Error("Block not found")
    return block.timestamp;
};

// Index domain registration event
const handleDomainRegistered = async (db: sqlite3.Database, domain: string, owner: string, timestamp: number, txHash: string, logIndex: number) => {
    db.run(`INSERT OR IGNORE INTO domains (domain, owner, timestamp, tx_hash, log_index) VALUES (?, ?, ?, ?, ?)`, [domain, owner, timestamp, txHash, logIndex]);
};

// Index string record update event
const handleStringRecordUpdated = async (db: sqlite3.Database, domain: string, key: string, value: string, timestamp: number, txHash: string, logIndex: number) => {
    db.get(`SELECT COUNT(*) as count FROM string_records WHERE tx_hash = ? AND log_index = ?`, [txHash, logIndex], (err, row: { count: number }) => {
        if (row.count === 0) {
            db.run(`INSERT OR REPLACE INTO string_records (domain, key, value, timestamp, tx_hash, log_index) VALUES (?, ?, ?, ?, ?, ?)`, [domain, key, value, timestamp, txHash, logIndex]);
        }
    });
};

// Fetch past events and index them
const fetchPastEvents = async (contract: ethers.Contract, db: sqlite3.Database, fromBlock: number, toBlock: number, provider: ethers.Provider) => {
    const domainRegisteredLogs = await contract.queryFilter("DomainRegistered", fromBlock, toBlock);
    for (const log of domainRegisteredLogs as EventLog[]) {
        const { domain, owner } = log.args;
        const timestamp = await blockToTimestamp(log.blockNumber, provider);
        await handleDomainRegistered(db, domain, owner, timestamp, log.transactionHash, log.index);
    }

    const stringRecordUpdatedLogs = await contract.queryFilter("StringRecordUpdated", fromBlock, toBlock);
    for (const log of stringRecordUpdatedLogs as EventLog[]) {
        const { domain, key, newValue } = log.args;
        const timestamp = await blockToTimestamp(log.blockNumber, provider);
        await handleStringRecordUpdated(db, domain, key, newValue, timestamp, log.transactionHash, log.index);
    }
};

// Main function to listen to events and update the database
const main = async () => {
    // Connect to the Ethereum network (e.g., using Infura)
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // Connect to the contract
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Connect to the database and initialize it
    const db = connectDb();
    initDb(db);

    // Fetch past events
    const currentBlock = await provider.getBlockNumber();
    await fetchPastEvents(contract, db, contractCreationBlock, currentBlock, provider);

    // Listen to future events
    contract.on("DomainRegistered", async (domain: string, owner: string, event) => {
        console.log(`DomainRegistered: ${domain} by ${owner}`);
        const timestamp = await blockToTimestamp(event.blockNumber, provider);
        await handleDomainRegistered(db, domain, owner, timestamp, event.transactionHash, event.logIndex);
    });

    contract.on("StringRecordUpdated", async (domain: string, key: string, newValue: string, event) => {
        console.log(`StringRecordUpdated: ${domain}, ${key} = ${newValue}`);
        const timestamp = await blockToTimestamp(event.blockNumber, provider);
        await handleStringRecordUpdated(db, domain, key, newValue, timestamp, event.transactionHash, event.logIndex);
    });

    console.log("Listening for contract events...");

    // Start the API server
    const app = express();
    app.use(bodyParser.json());

    // Parse timestamp from query parameters
    const parseTimestamp = (req: express.Request): number => {
        const { timestamp } = req.query;
        return timestamp ? parseInt(timestamp as string) : Math.floor(Date.now() / 1000);
    };

    // API endpoint to fetch all domains owned by an address
    app.get('/domains/:owner', (req, res) => {
        const { owner } = req.params;
        const timestamp = parseTimestamp(req);
        db.all(`SELECT domain FROM domains WHERE owner = ? AND timestamp <= ? ORDER BY timestamp DESC`, [owner, timestamp], (err, rows: DomainRow[]) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows.map(row => row.domain));
        });
    });

    // API endpoint to fetch details of a single domain
    app.get('/domain/:domain', (req, res) => {
        const { domain } = req.params;
        const timestamp = parseTimestamp(req);
        db.get(`SELECT owner FROM domains WHERE domain = ? AND timestamp <= ? ORDER BY timestamp DESC LIMIT 1`, [domain, timestamp], (err, owner: { owner: string } | undefined) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (!owner) {
                res.status(404).json({ error: "Domain not found" });
                return;
            }
            db.all(`SELECT key, value FROM string_records WHERE domain = ? AND timestamp <= ? ORDER BY timestamp DESC`, [domain, timestamp], (err, stringRecords: StringRecordRow[]) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({
                    domain,
                    owner: owner.owner,
                    stringRecords: Object.fromEntries(stringRecords.map(record => [record.key, record.value])),
                });
            });
        });
    });

    // API endpoint to fetch all domains with a specific string record
    app.get('/string-records/:key/:value', (req, res) => {
        const { key, value } = req.params;
        const timestamp = parseTimestamp(req);
        db.all(`SELECT domain FROM string_records WHERE key = ? AND value = ? AND timestamp <= ? ORDER BY timestamp DESC`, [key, value, timestamp], (err, rows: StringRecordRow[]) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows.map(row => row.domain));
        });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}`);
    });
};

// Execute the main function
main().catch((error) => {
    console.error("Error:", error);
});
