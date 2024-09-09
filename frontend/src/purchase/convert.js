
const web3 = require("@solana/web3.js");
const bs58 = require('bs58');
let secretKey = bs58.decode("5bsTEHLfZRbjhC9VdXEeV9wPkNSEiY7mkP7sbA1pdduXaf1hWVtbUMAxnKxT1oqK2CfhE7sT6Qny7VGDmEbCLS49");
console.log(`[${web3.Keypair.fromSecretKey(secretKey).secretKey}]`);

let secretKeyArray = [216,96,204,189,155,108,11,55,122,64,241,97,127,180,9,160,211,153,126,246,92,78,200,42,189,175,160,43,111,92,109,51,188,131,87,175,179,3,73,71,227,36,105,102,124,100,219,36,11,191,88,93,152,25,42,250,57,243,240,195,46,203,28,201];  // Replace with the full array
let secretKey = Uint8Array.from(secretKeyArray);
let encodedSecretKey = bs58.encode(secretKey);
console.log(encodedSecretKey);