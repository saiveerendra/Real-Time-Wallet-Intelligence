const { Connection, PublicKey } = require("@solana/web3.js");
require('dotenv').config(); 
const { tx_db, wallet_db } = require('./database');

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const TOKEN_MINT = process.env.TARGET_TOKEN;

const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);
const tokenMint = new PublicKey(TOKEN_MINT);


function upsertHolder(wallet, tokens) {
  try{
  const stmt = wallet_db.prepare(`
    INSERT INTO holders (wallet, tokens, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(wallet) DO UPDATE SET
      tokens = excluded.tokens,
      updated_at = excluded.updated_at;
  `);

  stmt.run(wallet, tokens, new Date().toISOString());
  console.log("sucessfully updated the data");
  }
  catch(e)
  {
     console.log("Error occured ",e);
  }
}

async function clearData()
{
   wallet_db.prepare(`DELETE FROM holders`).run();
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTopWallets() {
  await clearData();
  console.log(" Old wallet entries cleared.");
  const largest = await connection.getTokenLargestAccounts(tokenMint);
  console.log(largest.value.length);
  for (let i = 0; i < Math.min(60, largest.value.length); i++) {
    const acc = largest.value[i];
    await sleep(200); 

    try {
      const info = await connection.getParsedAccountInfo(acc.address);
      const owner = info.value.data.parsed.info.owner;
      const amount = info.value.data.parsed.info.tokenAmount.uiAmount;
      console.log(`${i + 1}. Wallet: ${owner} - Tokens: ${amount}`);
      upsertHolder(owner, amount); 
    } catch (err) {
      console.error(`Failed to fetch info for account ${acc.address.toBase58()}:`, err.message);
    }
  }
}

module.exports=fetchTopWallets;


