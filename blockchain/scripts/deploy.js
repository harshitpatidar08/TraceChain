import hardhat from "hardhat";
import fs from "fs";

const { ethers } = hardhat;

async function main() {
    const SupplyChainLogger = await ethers.getContractFactory(
        "SupplyChainLogger"
    );
    const contract = await SupplyChainLogger.deploy();
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log("Contract deployed to:", address);
    
    // Save address to a file so server can read it
    fs.writeFileSync(
        "../server/contract-address.json",
        JSON.stringify({ address: address }, null, 2)
    );
}

main().catch(console.error);
