//////////////////////////////////////////////////
//                  Remaining                   //
//  1. Exclude the deployer from the list       //
//  2. Make calls to EAT contract to check if a //
//     holder actually holds EAT                //
//  3. With the remaining list sort out top 5   //
//     addresses                                //
//////////////////////////////////////////////////

require("dotenv").config();
const polygonscan = require("polygonscan-api").init(
  process.env.POLYGON_SCAN_API_KEY
);
const fs = require("fs");
const fetch = require("node-fetch");
const ethers = require("ethers");

const eatAddress = "0x7C58D971A5dAbd46BC85e81fDAE87b511431452E";

async function fetchEATTransactions(contractAddress) {
  //Grabs the address of the contract deployer and saves it as this variable
  const addressOfEatDeployer = await contractDeployer(contractAddress);

  //Exits the function call if the deployer's address can't be found
  if (!addressOfEatDeployer) {
    console.error("Error fetching deployer's address");
    return;
  }

  //Makes a call to polygonscan API for 'account' module with 'txlist' action
  try {
    const response = await polygonscan.account.txlist(
      contractAddress,
      1,
      "latest",
      1,
      10000, //Fetches 10000 latest transactions, Can't go above it because polygonscan API doesn't allow it
      "desc"
    );

    if (response.status === "1") {
      const transactions = response.result;

      //Creates a new set for token holders
      const tokenHolders = new Set();

      // for-of loop to allow the usage of 'await' inside the loop
      for (const transaction of transactions) {
        //Fetches only the transactions related to transfers
        //ERC20 transfer signature hash always starts with 0xa9059cbb
        if (transaction.input.startsWith("0xa9059cbb")) {
          //Extracts the senders and recipients from the transfer function calls
          const sender = transaction.from;
          const recipient = "0x" + transaction.input.slice(34, 74);

          //Checks if the sender or recipient are contracts or wallet
          const senderDescription = await contractDeployer(sender);
          const recipientDescription = await contractDeployer(recipient);

          if (
            sender === addressOfEatDeployer ||
            recipient === addressOfEatDeployer
          ) {
            console.log("EAT deployer address found, skipping...");
            continue; // Skip adding the deployer address to tokenHolders set
          }

          //Checks if a given address is already in the list and is not a smart contract (or is a wallet address)
          if (
            !tokenHolders.has(sender) &&
            senderDescription.startsWith("No data") &&
            balance(sender, contractAddress) > 0
          ) {
            tokenHolders.add(sender);
          }
          if (
            !tokenHolders.has(recipient) &&
            recipientDescription.startsWith("No data") &&
            balance(recipient, contractAddress) > 0
          ) {
            tokenHolders.add(recipient);
          }
        }
      }

      //Adds that address to the array
      const tokenHolderAddresses = Array.from(tokenHolders);
      console.log("Token holder array length: ", tokenHolderAddresses.length);

      //Writes the extracted addresses array to a 'Token_Holders.txt' file
      fs.writeFile(
        "Token_Holders2.txt",
        tokenHolderAddresses.join("\n"),
        (e) => {
          if (e) {
            console.error("error writing file: ", e);
          } else {
            console.log("token holder addresses successfuly written");
          }
        }
      );
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

const balance = async (walletAddress, contractAddress) => {
  let contractABI;
  try {
    const url = `https://api.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.POLYGON_SCAN_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1" && data.result.length > 0) {
      contractABI = JSON.parse(data.result);
      // console.log("ABI: ", contractABI);
    } else {
      console.error("Error: ", data.message);
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY, provider);
  const eatToken = new ethers.Contract(contractAddress, contractABI, wallet);

  const walletBalance = await eatToken.balanceOf(walletAddress);
  return walletBalance;
};

fetchEATTransactions(eatAddress);
