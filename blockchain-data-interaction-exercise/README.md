# Blockchain Data interaction (Exercise 2)

The following node.js application is an exercise for Polygon data interaction. Here are the key features:

 1. Fetches the token holder's list of EAT using Covalent API.
 2. Excludes the contract deployer and contract addresses from that list.
 3. Fetch the transaction history of each of those wallet addresses.
 4. Sort that list in descending order based on the highest number of transactions to lowest number of transactions on EAT contract.
 5. Gets the top 5 wallet addresses from that list.

##  Libraries/Frameworks used

I used the following Libraries for the project:

 1. polygonscan-api: To make API calls to Polygonscan network.
 2. node-fetch: To make API calls to Polygonscan network using url (for modules that could not be reached using polygonscan-api).
 3. covalenthq-client: To fetch Token holders list quickly for EAT.

## Data filteration

When the application makes a call to the Covalent API, it gets a raw data in JSON format with information regarding the 'contract details', 'block height', 'contract logo' and the 'addresses that hold EAT tokens' along with their 'balances'. This includes smart contracts and wallet addresses on Polygon mainnet. 

### Exluding the contract deployer

However, the first thing to do here was to identify and exclude the EAT deployer's address from the data. I made a call to Polygonscan API using node-fetch in the function `contractDeployer`. 

This function takes a contract address as a parameter and returns the address of the contract deployer.

Then I make a request to Covalent client and fetch the data related to token holders. I then loop through the result to fetch the address of a token holder.

Then I exclude the address of the token deployer.

### Separating smart contracts and wallets from Covalent client request

The Covalent client does not separate smart contracts and wallets from the result. It contains all the addresses that hold the Edge activity token. So I needed to extract only wallet addresses.

For this I again make a call to the Polygonscan API to fetch the contract creation data. I deliberately delay the call for 200ms since it is the limit for Polygonscan basic plan.

If an address is a wallet address the API call will return the string `No data found`. I then filter out the addresses that are smart contracts and continue with wallet addresses.

### Fetch transaction histories of wallet addresses

Before fetching the transaction histories of the wallet address in the loop I have to delay the API call for another 200ms to avoid the Polygonscan limit. 

I then fetch the transaction history of the wallet address in the loop by making a call to Polygonscan API using 'polygonscan-api' library returned by the function `eatTransactionHistory`.

This function returns an object of `WalletAddress`, `TotalTransactions`, and the `Data` which includes the transactions `from` and `to`.

Once it has the transaction histories, the loop pushes that data in the `addresses` array.

### Sorting top 5 wallets

Once the addresses array has all the data of transactions, the function then sorts it in descending order using the javascript `sort` method. This sorts the addresses in the descending order based on `TotalTransactions`.

The function then extracts the data of top 5 wallets using javascript `slice` method.


**The function then appends the data into `Top5_Wallet_tx_Histories.txt` file with the human readable data of 'Wallet number', 'Wallet Address' and 'Total Aransactions'.**

## Note

The application doesn't directly connect to Polygon mainnet to fetch the results as it is not a viable solution with the existing libraries such as 'ethers.js' or 'web3.js'.