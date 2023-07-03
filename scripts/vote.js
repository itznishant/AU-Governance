const { ethers } = require("hardhat");
require("dotenv").config();

const governorAddress = process.env.GOVERNOR_CA_SEPOLIA;

const tokenAddress = process.env.TOKEN_CA_SEPOLIA;

const proposalId = process.env.PROPOSAL_ID;

async function voteOnProposal() {
  const [owner] = await ethers.getSigners();

  const governor = await ethers.getContractAt("MyGovernor", governorAddress);
  const token = await ethers.getContractAt("GovToken", tokenAddress);

  const voteTx = await governor.castVote(proposalId, 1);

  const txResult = await voteTx.wait();

  const voteCastEvent = txResult.events.find(x => x.event === 'VoteCast');

  const voter = await voteCastEvent.args.voter;

  const votedForProposal = await voteCastEvent.args.proposalId;

  console.log("VOTER: ", (await voter).toString());
  console.log("VOTED FOR PROPOSAL ID: ", (await votedForProposal).toString());

}

voteOnProposal().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
