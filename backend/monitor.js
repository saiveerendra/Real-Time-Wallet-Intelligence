require("dotenv").config();
const fs=require("fs");
const path=require("path")
// const csvPath=path.join(__dirname,"../dashboard/data.csv")
const axios = require("axios");
const {db,wallet_db}=require("./database");
const getTopWallet=require("./getTopWallets");
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const TOKEN_MINT = process.env.TARGET_TOKEN;
// const HELIUS_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;


function getApiKey()
{
  return HELIUS_API_KEY;
}

async function clearData()
{
  try{
   db.prepare(`DELETE FROM holders`).run();}
   catch(e)
   {
      console.log("Error occured");
   }
}

async function getWalletAddresses(){
  try{
    const stmt=wallet_db.prepare(`Select wallet from holders`);
    const rows = stmt.all();
    console.log("DB wallet rows:", rows);  
    return rows.map(row=>row.wallet);
    }
    catch (err) {
    console.error("Error fetching wallets:", err.message);
    return [];
  }
}
async function logToDb(data) {
  const stmt = db.prepare(`
    INSERT INTO transactions (timestamp, wallet, amount, action, protocol)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(data.Time, data.wallet, data.amount, data.action, data.protocol);
}


async function getRecentTransactions(wallet) {
  let allTxns = [];

  try {
    // First call — fetch up to 100 txns
    let url = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${getApiKey()}&limit=100`;
    let res = await axios.get(url);
    const firstBatch = res.data;
    allTxns.push(...firstBatch);

    if (firstBatch.length ==0) return allTxns;

    //Second call  with last txn signature
    const lastSig = firstBatch[firstBatch.length - 1]?.signature;
    if (!lastSig) return allTxns;

    const secondUrl = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${getApiKey()}&limit=50&before=${lastSig}`;
    const secondRes = await axios.get(secondUrl);
    const secondBatch = secondRes.data;

    allTxns.push(...secondBatch);
    return allTxns;
  } 
  catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;

    if (status === 400) {
      console.warn(`Wallet ${wallet} gave 400 error. Possibly inactive or invalid.`);
    } else if (status === 429) {
      console.warn(`Rate limit hit. Waiting 30 sec...`);
      await sleep(30000);
      return await getRecentTransactions(wallet);
    } else if (status === 403 || message.toLowerCase().includes("quota")) {
      console.error(`Quota exceeded. Switching API key...`);
      rotateApiKey();
      return await getRecentTransactions(wallet);
    } else {
      console.error(`Unknown error for ${wallet}: ${status} - ${message}`);
    }
    return allTxns;
  }
}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// function logToCsv(data) {
//   const exists = fs.existsSync(csvPath);
//   const line = `"${data.Time}",${data.wallet},${data.amount},${data.action},${data.protocol}\n`;

//   if (!exists) {
//     fs.writeFileSync(csvPath, "timestamp,wallet,amount,action,protocol\n");
//   }

//   fs.appendFileSync(csvPath, line);
// }

function isValidSolanaAddress(address) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

async function monitorWallets() {
  await clearData();
  console.log("Previous data cleared");
  const walletAddresses=await getWalletAddresses();
  for (const wallet of walletAddresses) {
    if(!isValidSolanaAddress(wallet))
    {
      console.warn(` Invalid wallet address skipped: ${wallet}`);
      continue;
    }
    const txns = await getRecentTransactions(wallet);
    if(txns.length>0)
      txns.forEach((tx) => {
      const tokenTransfers = tx.tokenTransfers || [];
      const matchingTransfer = tokenTransfers.find((t) => t.mint === TOKEN_MINT);
      if (matchingTransfer) {
        const direction =matchingTransfer.fromUserAccount === wallet ? "Sell" : "Buy";
        const amount = matchingTransfer.tokenAmount;
        const protocol = tx.description?.split(" via ")[1] ||tx.source || "Unknown";
        const time = new Date(tx.timestamp * 1000).toLocaleString();
        console.log(
           `Time: ${time} | ${direction} by ${wallet} | ${amount} tokens | Protocol: ${protocol} `
        );
        parts=time.split(',');
        timeWithDate=parts[0]+parts[1];
        console.log(timeWithDate);
        const txData = { Time: timeWithDate, wallet, amount, action: direction, protocol };
        // logToCsv(txData);
        logToDb(txData);
      }
    });
    // Added 500ms delay per wallet to stay under rate limit
    await sleep(500);
  }
}

async function  getData()
{
   await getTopWallet();
   await monitorWallets();
}

getData();