const polygonscan = require("polygonscan-api").init(
  "HWAAYDDKS8JYZUHTSNVQ2PRU3F6SDVNYM1"
);
require("dotenv").config();

const eatAddress = "0x7C58D971A5dAbd46BC85e81fDAE87b511431452E";

async function fetchEATTransactions(contractAddress) {
  try {
    const response = await polygonscan.account.txlist(
      contractAddress,
      1,
      "latest",
      1,
      10000,
      "desc"
    );
    if (response.status === "1") {
      const transactions = response.result;

      const tokenHolders = new Set();

      transactions.forEach((transaction) => {
        if (transaction.input.startsWith("0xa9059cbb")) {
          //ERC20 transfer signature hash
          const sender = transaction.from;
          const recipient = "0x" + transaction.input.slice(34, 74);
          tokenHolders.add(sender);
          tokenHolders.add(recipient);
        }
      });

      const tokenHolderAddresses = Array.from(tokenHolders);
      console.log(tokenHolderAddresses); //This logs addresses of token holders resulting from token
      // transfers for transfers from 1-10000. Need to sort this data to exclude deployer and make
      // recurcive calls to polygonscan API to fetch all transaction data.
    } else {
      console.error("Error:", response.message);
    }
  } catch (error) {
    console.error(error);
  }
}

fetchEATTransactions(eatAddress);
