const polygonscan = require("polygonscan-api").init(
  "HWAAYDDKS8JYZUHTSNVQ2PRU3F6SDVNYM1"
);
require("dotenv").config();
const fs = require("fs");

const eatAddress = "0x7C58D971A5dAbd46BC85e81fDAE87b511431452E";

async function fetchEATTransactions(contractAddress) {
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

      const tokenHolders = new Set();

      transactions.forEach((transaction) => {
        if (transaction.input.startsWith("0xa9059cbb")) {
          //ERC20 transfer signature hash always starts with 0xa9059cbb
          const sender = transaction.from;
          const recipient = "0x" + transaction.input.slice(34, 74);

          if (!tokenHolders.has(sender)) {
            tokenHolders.add(sender);
          }
          if (!tokenHolders.has(recipient)) {
            tokenHolders.add(recipient);
          }
        }
      });
      const tokenHolderAddresses = Array.from(tokenHolders);
      console.log("Token holder array length: ",tokenHolderAddresses.length);
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

// const eatDeployerAddress = async (contractAddress) => {
//   try {
//     const response = await polygonscan.contract.getcontractcreation(
//       contractAddress
//     );

//     if (response.status === "1" && response.result.length > 0) {
//       const deployerAddress = response.result[0].contractCreator;
//       console.log("Deployer Address:", deployerAddress);
//       return deployerAddress;
//     } else {
//       console.error("Error:", response.message);
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching deployer address:", error);
//     return null;
//   }
// };
fetchEATTransactions(eatAddress);
