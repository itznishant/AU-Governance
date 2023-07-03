const { ethers } = require("hardhat");
const { parseEther } = ethers.utils;
require("dotenv").config();

const governorAddress = process.env.GOVERNOR_CA_SEPOLIA;

const tokenAddress = process.env.TOKEN_CA_SEPOLIA;

async function createProposal() {
  const [owner] = await ethers.getSigners();

  const governor = await ethers.getContractAt("MyGovernor", governorAddress);
  const token = await ethers.getContractAt("GovToken", tokenAddress);

  const tx = await governor.propose( [token.address], [0],
    [token.interface.encodeFunctionData("mint", [owner.address, parseEther("25000")])],
    "Give the owner 25000 more tokens!"
  );

  const receipt = await tx.wait();
  const event = receipt.events.find(x => x.event === 'ProposalCreated');

  const proposalId = await event.args.proposalId; //proposal id (hash)
  const proposer = await event.args.proposer;   //address of proposal creator

  console.log("PROPOSAL ID: ", (await proposalId).toString());
  console.log("PROPOSER: ", (await proposer).toString());

}

createProposal().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});