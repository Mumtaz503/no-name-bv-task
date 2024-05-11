require("dotenv").config();
const ethers = require("ethers");

async function fetchData(contractAddress, walletAddress) {
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
}

// Call the function to fetch data for all pages
const contAddress = "0x7C58D971A5dAbd46BC85e81fDAE87b511431452E";
const walAddr = "0x8f625df4c9e4878313635cb0a86ae9e230365a7c";
fetchData(contAddress, walAddr);
