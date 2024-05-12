//Using Covalent Client API to fetch EAT holders. It is faster that way.
const { CovalentClient } = require("@covalenthq/client-sdk");
require("dotenv").config();
const fs = require("fs");
const fetch = require("node-fetch");
const { resolve } = require("path");
const polygonscan = require("polygonscan-api").init(
  process.env.POLYGON_SCAN_API_KEY
);

const eatAddress = "0x7C58D971A5dAbd46BC85e81fDAE87b511431452E";

async function fetchTopFiveMostActiveWalletsOnEAT(contractAddress) {
  //Fetches the deployer of EAT
  const eatDeployer = await contractDeployer(contractAddress);

  //To exclude Uniswapv3Pool from the addresses.
  //Shouldn't be hardcoded but I had no time.
  const uniswapV3Address = "0x6d21453c9a43f9c0d4be640e325ca59bd1e844f3";

  if (!eatDeployer) {
    console.error("Error fetching deployer's address");
    return;
  }

  //Creates a new instance of Covalent Client
  const client = new CovalentClient(`${process.env.COVALANT_API_KEY}`);
  try {
    //Defines an addresses array to save all the addresses
    let addresses = [];

    //Loops through the API return data
    for await (const resp of client.BalanceService.getTokenHoldersV2ForTokenAddress(
      "matic-mainnet",
      `${contractAddress}`,
      { pageSize: 1000, pageNumber: 1 }
    )) {
      //Exclude the deployer and UniswapV3Pool and save all the addresses in the array
      if (resp.address !== eatDeployer || resp.address !== uniswapV3Address) {
        await delay(200);
        const transactionHistory = await eatTransactionHistory(
          contractAddress,
          resp.address
        );
        // If transaction history is fetched successfully, push it to the addresses array
        if (transactionHistory) {
          addresses.push(transactionHistory);
        }
      }
    }

    addresses.sort((a, b) => b.TotalTransactions - a.TotalTransactions);

    // Extract top 5 wallets with highest total transactions
    const top5Wallets = addresses.slice(0, 5);

    // Format and write top 5 wallets to the file
    const filePath = "./Top5_Wallets_Tx_History.txt";
    fs.writeFileSync(
      filePath,
      "Top 5 Wallets with Highest Total Transactions:\n\n"
    );
    top5Wallets.forEach((wallet, index) => {
      fs.appendFileSync(filePath, `Wallet ${index + 1}:\n`);
      fs.appendFileSync(filePath, `Address: ${wallet.WalletAddress}\n`);
      fs.appendFileSync(
        filePath,
        `Total Transactions: ${wallet.TotalTransactions}\n`
      );
      fs.appendFileSync(filePath, "Transactions:\n");
      wallet.Data.forEach((transaction, i) => {
        fs.appendFileSync(filePath, `Transaction ${i + 1}:\n`);
        fs.appendFileSync(
          filePath,
          `From: ${transaction.from.slice(0, 8)}...${transaction.from.slice(
            -6
          )}\n`
        );
        fs.appendFileSync(
          filePath,
          `To: ${transaction.to.slice(0, 8)}...${transaction.to.slice(-6)}\n`
        );
      });
      fs.appendFileSync(filePath, "\n");
    });
  } catch (error) {
    console.log(error.message);
  }
}

const contractDeployer = async (contractAddress) => {
  try {
    const url = `https://api.polygonscan.com/api?module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${process.env.POLYGON_SCAN_API_KEY}`;

    //Makes the call using node-fetch module
    const response = await fetch(url);

    //Converts the data into a json object to read from
    const data = await response.json();

    if (data.status === "1" && data.result.length > 0) {
      const deployerAddress = data.result[0].contractCreator;
      console.log("Deployer Address: ", deployerAddress);

      //Returns the deployer's address if the request is successful and returns the data
      return deployerAddress;
    } else {
      console.error("Error: ", data.message);

      //Returns 'No data found' if the address is not of a contract
      return data.message;
    }
  } catch (e) {
    console.error("Error fetching request: ", e);

    // returns null if can't make a request to the API.
    return null;
  }
};

const eatTransactionHistory = async (contractAddress, address) => {
  //Makes a call to polygonscan API to fetch transaction history of a wallet related to EAT
  try {
    const response = await polygonscan.account.tokentx(
      address,
      contractAddress,
      30032610, //EAT creation block number
      99999999,
      1,
      10000,
      "desc"
    );
    if (response.status === "1") {
      //Maps over the result array to extract 'from' and 'to' prperties
      const transactions = response.result.map((transaction) => ({
        from: transaction.from,
        to: transaction.to,
      }));
      console.log("Transactions found!!");

      //Returns an object containing the address of a wallet, their total transactions regarding EAT, from and to
      return {
        WalletAddress: address,
        TotalTransactions: transactions.length,
        Data: transactions,
      };
    } else {
      console.error("Error: ", response.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching result: ", error);
  }
};

function delay(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

fetchTopFiveMostActiveWalletsOnEAT(eatAddress);
