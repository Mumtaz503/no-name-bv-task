const fetch = require("node-fetch");
require("dotenv").config();

const eatAddress = "0xed8dba880d44cf954769474124141325c6430fd3";

async function getContractDeployer(contractAddress) {
  try {
    const url = `https://api.polygonscan.com/api?module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${process.env.POLYGON_SCAN_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "1" && data.result.length > 0) {
      const deployerAddress = data.result[0].contractCreator;
      console.log("EAT Deployer Address: ", deployerAddress);
    } else {
      console.error("Error: ", data.message);
    }
  } catch (e) {
    console.error("Error fetching request: ", e);
  }
}

getContractDeployer(eatAddress);
