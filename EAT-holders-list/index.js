require("dotenv").config();
const polygonscan = require("polygonscan-api").init(
  process.env.POLYGON_SCAN_API_KEY
);
const fs = require("fs");
const fetch = require("node-fetch");

const eatAddress = "0x7C58D971A5dAbd46BC85e81fDAE87b511431452E";

async function fetchEATTransactions(contractAddress) {
  const addressOfEatDeployer = await contractDeployer(contractAddress);

  if (!addressOfEatDeployer) {
    console.error("Error fetching deployer's address");
    return;
  }
  try {
    const response = await polygonscan.account.txlist(
      contractAddress,
      1,
      "latest",
      1,
      50, //Fetches 10000 latest transactions, Can't go above it because polygonscan API doesn't allow it
      "desc"
    );
    if (response.status === "1") {
      const transactions = response.result;

      const tokenHolders = new Set();

      for (const transaction of transactions) {
        if (transaction.input.startsWith("0xa9059cbb")) {
          //Fetches only the transactions related to transfers
          //ERC20 transfer signature hash always starts with 0xa9059cbb
          const sender = transaction.from;
          const recipient = "0x" + transaction.input.slice(34, 74);

          if (
            sender === addressOfEatDeployer ||
            recipient === addressOfEatDeployer
          ) {
            console.log("EAT deployer address found, skipping...");
            return; // Skip adding the deployer address to tokenHolders set
          }

          if (!tokenHolders.has(sender)) {
            tokenHolders.add(sender);
          }
          if (!tokenHolders.has(recipient)) {
            tokenHolders.add(recipient);
          }
        }
      }
      const tokenHolderAddresses = Array.from(tokenHolders);
      console.log("Token holder array length: ", tokenHolderAddresses.length);
      fs.writeFile("Toke_Holders.txt", tokenHolderAddresses.join("\n"), (e) => {
        if (e) {
          console.error("error writing file: ", e);
        } else {
          console.log("token holder addresses successfuly written");
        }
      });
    } else {
      console.error("Error:", response.message);
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Programatically fetches the wallet address of the deployer of EAT token by making a call to Polygonscan API
 * @param contractAddress The address of EAT ERC-20 token on Polygon Chain
 * @returns The address of EAT deployer using polygonscan API
 */
const contractDeployer = async (contractAddress) => {
  try {
    const url = `https://api.polygonscan.com/api?module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${process.env.POLYGON_SCAN_API_KEY}`;

    const response = await fetch(url); //Makes the call using node-fetch module
    const data = await response.json(); //Converts the data into a json object to read from

    if (data.status === "1" && data.result.length > 0) {
      const deployerAddress = data.result[0].contractCreator;
      console.log("EAT Deployer Address: ", deployerAddress);
      return deployerAddress; //Returns the deployer's address if the request is successful and returns the data
    } else {
      console.error("Error: ", data.message);
      return data.message; //Returns 'No data found' if the address is not of a contract
    }
  } catch (e) {
    console.error("Error fetching request: ", e);
    return null; // returns null if can't make a request to the API.
  }
};

const isWalletAddress = async (address) => {
  try {
    const response = await polygonscan.account.txlistinternal(address);
  } catch (e) {
    console.error("Error with fetch request: ", e);
  }
};

fetchEATTransactions(eatAddress);
