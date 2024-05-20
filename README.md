# no-name-bv-task

## Task-1 edge-gif-creator

Is the folder for the 1st task/exercise "Node.js video processing script." The script analyzes the video clips and creates a gif by adding the "Edge Video" logo at the bottom right. It is created to keep in mind the processing speed and memory management.

## Task-2 blockchain-data-interaction

Is the folder for the 2nd task where I was supposed to read the data of EAT holders from Polygon mainnet and extract top 5 most active wallets regarding EAT. The job was to create a nodejs application that connects to the Polygon mainnet to fetch the data. However, during this task I realized that it was not very efficient since it was taking a lot of time to fetch individual transactions and analyze them one by one so I used a better more efficient approach to process analyze and extract the data for this task using the Covalent API. The App works as needed the only limitation is the "Polygonscan Basic Plan" which limits to 5 API calls per second. If one has a premium memebership, the process will be extremely quick.

## Task-3 browser-based-data-visualization

This task was tricky however, in my knowledge and experience Getting a wallet address' geolocation data is virtually impossible. However, there are a few workarounds for this and I have done my research for them so far with no luck:

### 1. I tried getting the users' geographical data from edge video platform.

The idea was to get a list of Edge Activity Token holders' list and then check if they exist on the edge video platform and if their location is public on the platform. I could then compare the wallet addresses with the users to get their geographical coordinates and show them on the map. However, there's an issue with the Edge Video platform and I can't register on the platform. I monitored their network sockets and it seems like there is a clash between a request's origin on their platform upon registration. So that was a dead-end. Another issue is that there are hundreds of users that might not have registered on the platform and have gotten their EAT from exchanges like Uniswap. So even if that was possible we'd still have a lot of users without geographical location.

### 2. I checked if I can get the data from a centralized exchange (e.g,. Coinbase, Coingecko, etc.)

The idea was to check the documentation of these centralized exchanges to see if they provide an API endpoint that may give us some information about the geographical data. I would then try to get the data for EAT holders and then use a heatmap to render that data. However, centralized exchanges do not make this data public due to user privacy reasons. So I met a dead-end there as well.

These are my findings for the task 3.

## Task-4 React, PostgreSQL, and Cloud Services Integration Challenge (Thought Exercise)

First and foremost I had to define the requirements for this Tipping Chat application and then use those requirements to create a blueprint for the application. Then I did a lot of research for different sides to this application and used my previous experience to build an architechture entailing all the nitty-gritty details that would go into that chat application. You can read my findings in the PDF file that I have attached in the folder `chat-app-thought-exercise`.
