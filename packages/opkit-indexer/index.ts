import { createPublicClient, http, parseAbiItem, defineChain, webSocket } from 'viem';
import sqlite3 from "sqlite3";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import contractABI from './OpkitDomains.json';

export const opkit = defineChain({
    id: 5057,
    name: 'OPKit',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://rpc-opkit-domains-jlpe79dzdp.t.conduit.xyz'],
        webSocket: ['wss://rpc-opkit-domains-jlpe79dzdp.t.conduit.xyz'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Blockscout',
        url: 'https://explorerl2new-opkit-domains-jlpe79dzdp.t.conduit.xyz',
      },
    },
  })

dotenv.config();

const contractAddress: `0x${string}` = process.env.CONTRACT_ADDRESS! as `0x${string}`;

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
const blockToTimestamp = async (blockNumber: bigint, client: ReturnType<typeof createPublicClient>): Promise<number> => {
    const block = await client.getBlock({ blockNumber });
    return Number(block.timestamp);
};

// Index domain registration event
const handleDomainRegistered = async (db: sqlite3.Database, domain: string, owner: string, timestamp: number, txHash: string, logIndex: number) => {
    db.get(`SELECT COUNT(*) as count FROM domains WHERE tx_hash = ? AND log_index = ?`, [txHash, logIndex], (err, row: { count: number }) => {
        if (row.count === 0) {
            db.run(`INSERT OR IGNORE INTO domains (domain, owner, timestamp, tx_hash, log_index) VALUES (?, ?, ?, ?, ?)`, [domain, owner, timestamp, txHash, logIndex]);
            console.log('Registered', domain, owner, timestamp)
        }
    })
};

// Index string record update event
const handleStringRecordUpdated = async (db: sqlite3.Database, domain: string, key: string, value: string, timestamp: number, txHash: string, logIndex: number) => {
    db.get(`SELECT COUNT(*) as count FROM string_records WHERE tx_hash = ? AND log_index = ?`, [txHash, logIndex], (err, row: { count: number }) => {
        if (row.count === 0) {
            db.run(`INSERT OR REPLACE INTO string_records (domain, key, value, timestamp, tx_hash, log_index) VALUES (?, ?, ?, ?, ?, ?)`, [domain, key, value, timestamp, txHash, logIndex]);
            console.log('Recorded', domain, key, value, timestamp)
        }
    });
};

// Fetch past events and index them
const fetchPastEvents = async (client: ReturnType<typeof createPublicClient>, db: sqlite3.Database, fromBlock: number, toBlock: number) => {
    const domainRegisteredLogs = await client.getLogs({
        address: contractAddress,
        event: parseAbiItem('event DomainRegistered(string domain, address owner)'),
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
    });

    for (const log of domainRegisteredLogs) {
        const { domain, owner } = log.args;
        const timestamp = await blockToTimestamp(log.blockNumber, client);
        await handleDomainRegistered(db, domain!, owner!, timestamp, log.transactionHash, log.logIndex);
    }

    const stringRecordUpdatedLogs = await client.getLogs({
        address: contractAddress,
        event: parseAbiItem('event StringRecordUpdated(string domain, string key, string newValue)'),
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
    });

    for (const log of stringRecordUpdatedLogs) {
        const { domain, key, newValue } = log.args;
        const timestamp = await blockToTimestamp(log.blockNumber, client);
        await handleStringRecordUpdated(db, domain!, key!, newValue!, timestamp, log.transactionHash, log.logIndex);
    }
};

// Main function to listen to events and update the database
const main = async () => {
    // Connect to the Ethereum network (e.g., using Infura)
    const client = createPublicClient({
        chain: opkit,
        transport: http(),
    });

    // Connect to the database and initialize it
    const db = connectDb();
    initDb(db);

    // Fetch past events
    const currentBlock = await client.getBlockNumber();
    await fetchPastEvents(client, db, contractCreationBlock, Number(currentBlock));

    // Listen to future events
    client.watchEvent({
        address: contractAddress,
        event: parseAbiItem('event DomainRegistered(string domain, address owner)'),
        onLogs: async logs => {
            for (const log of logs) {
                const { domain, owner } = log.args;
                const timestamp = await blockToTimestamp(log.blockNumber, client);
                await handleDomainRegistered(db, domain!, owner!, timestamp, log.transactionHash, log.logIndex);        
            }
        },
    })

    client.watchEvent({
        address: contractAddress,
        event: parseAbiItem('event StringRecordUpdated(string domain, string key, string newValue)'),
        onLogs: async logs => {
            for (const log of logs) {
                const { domain, key, newValue } = log.args;
                const timestamp = await blockToTimestamp(log.blockNumber, client);
                await handleStringRecordUpdated(db, domain!, key!, newValue!, timestamp, log.transactionHash, log.logIndex);
            }
        },
    })

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
        db.all(`SELECT domain, owner FROM domains WHERE owner = ? AND timestamp <= ? ORDER BY timestamp DESC`, [owner, timestamp], (err, domains: DomainRow[]) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            const domainDetails = domains.map(async (domainRow: DomainRow) => {
                return new Promise((resolve, reject) => {
                    db.all(`SELECT key, value FROM string_records WHERE domain = ? AND timestamp <= ? ORDER BY timestamp DESC`, [domainRow.domain, timestamp], (err, stringRecords: StringRecordRow[]) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                domain: domainRow.domain,
                                owner: domainRow.owner,
                                stringRecords: Object.fromEntries(stringRecords.map(record => [record.key, record.value])),
                            });
                        }
                    });
                });
            });

            Promise.all(domainDetails)
                .then(results => res.json(results))
                .catch(error => res.status(500).json({ error: error.message }));
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

            const domainDetails = rows.map(async (row: StringRecordRow) => {
                return new Promise((resolve, reject) => {
                    db.get(`SELECT owner FROM domains WHERE domain = ? AND timestamp <= ? ORDER BY timestamp DESC LIMIT 1`, [row.domain, timestamp], (err, owner: { owner: string } | undefined) => {
                        if (err) {
                            reject(err);
                        } else if (!owner) {
                            reject(new Error("Domain not found"));
                        } else {
                            db.all(`SELECT key, value FROM string_records WHERE domain = ? AND timestamp <= ? ORDER BY timestamp DESC`, [row.domain, timestamp], (err, stringRecords: StringRecordRow[]) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({
                                        domain: row.domain,
                                        owner: owner.owner,
                                        stringRecords: Object.fromEntries(stringRecords.map(record => [record.key, record.value])),
                                    });
                                }
                            });
                        }
                    });
                });
            });

            Promise.all(domainDetails)
                .then(results => res.json(results))
                .catch(error => res.status(500).json({ error: error.message }));
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