const { ethers } = require("hardhat");
require("dotenv").config();

const governorAddress = process.env.GOVERNOR_CA_SEPOLIA;

const tokenAddress = process.env.TOKEN_CA_SEPOLIA;

async function delegateVotes() {
  const [owner] = await ethers.getSigners();

  const governor = await ethers.getContractAt("MyGovernor", governorAddress);

  const token = await ethers.getContractAt("GovToken", tokenAddress);

  await token.delegate(owner.address); // delegating voting weight of GOV tokens

  const votesDelegated = await token.getVotes(owner.address); // gets votes delegated to owner

  console.log("Votes delegated successfully to address: ", owner.address);

  console.log("Total votes delegated to owner: ", ((await votesDelegated) / 1e18).toString());
}

delegateVotes().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});




