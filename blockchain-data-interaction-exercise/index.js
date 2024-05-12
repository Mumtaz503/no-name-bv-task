//Using Covalent Client API to fetch EAT holders. It is faster that way.
const { CovalentClient } = require("@covalenthq/client-sdk");
require("dotenv").config();
const fs = require("fs");
//node-fetch for requests that cannot be processed through 'polygonscan-api'
const fetch = require("node-fetch");
const polygonscan = require("polygonscan-api").init(
  process.env.POLYGON_SCAN_API_KEY
);

const eatAddress = "0x7C58D971A5dAbd46BC85e81fDAE87b511431452E";

/**
 * The function fetches the top 5 wallet most active wallet addresses on EAT
 * Consult README.md for explanation.
 * @param contractAddress The address of the contract
 */
async function fetchTopFiveMostActiveWalletsOnEAT(contractAddress) {
  //Fetches the deployer of EAT
  const eatDeployer = await contractDeployer(contractAddress);

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
      //Delay of 200ms because Polygonscan API limits 5 api calls per second for basic plan.
      await delay(200);
      const addressData = await contractDeployer(resp.address);
      //Exclude the deployer and UniswapV3Pool and save all the addresses in the array
      if (resp.address !== eatDeployer && addressData === "No data found") {
        //Delaying again for the second API call
        await delay(200);

        //Fetches the transaction history of the given address in the loop
        const transactionHistory = await eatTransactionHistory(
          contractAddress,
          resp.address
        );
        // If transaction history is fetched successfully, push the data to the addresses array
        if (transactionHistory) {
          addresses.push(transactionHistory);
        }
      }
    }

    //Sort the addresses in descending order
    addresses.sort((a, b) => b.TotalTransactions - a.TotalTransactions);

    // Extract top 5 wallets with highest total transactions
    const top5Wallets = addresses.slice(0, 5);

    // Format and write top 5 wallets to the file
    const filePath = "./Top5_Wallet_tx_Histories.txt";
    fs.writeFileSync(
      filePath,
      "Top 5 Wallets with Highest Total Transactions Regarding EAT:\n\n"
    );
    top5Wallets.forEach((wallet, index) => {
      fs.appendFileSync(filePath, `Wallet ${index + 1}:\n`);
      fs.appendFileSync(filePath, `Address: ${wallet.WalletAddress}\n`);
      fs.appendFileSync(
        filePath,
        `Total Transactions: ${wallet.TotalTransactions}\n`
      );
      fs.appendFileSync(filePath, "\n");
    });
  } catch (error) {
    console.log(error.message);
  }
}

/**
 * This function fetches the contract deployer's address by making a call to Polygonscan API using 'node-fetch'
 * @param contractAddress The address of the contract
 * @returns a string of a wallet address hash
 */
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

/**
 * The function fetches the transaction history of a wallet address regarding a smart contract
 * @param contractAddress The address of the contract for which to fetch the transaction history
 * @param address The address of a wallet that has interacted with the said contract
 * @returns an object of the wallet address, total transactions and the transaction data mainly 'from' (The address
 * from which the transaction took place, and 'to' the address to which the transaction went)
 */
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

/**
 * This function delays the API calls in a loop to prevent overloading the Polygonscan API for a given subscription
 * @param timeInMs the total time in miliseconds for which to delay the call
 */
function delay(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

fetchTopFiveMostActiveWalletsOnEAT(eatAddress);
