const fetch = require("node-fetch");
require("dotenv").config();
const polygonscan = require("polygonscan-api").init(
  process.env.POLYGON_SCAN_API_KEY
);

const address = "0xed8dba880d44cf954769474124141325c6430fd3";

const isWalletAddress = async (address) => {
  const contDeployer = await deployer(address);
  if (contDeployer) {
    return false;
  } else {
    return true;
  }
};

const deployer = async (contractAddress) => {
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

isWalletAddress(address);
