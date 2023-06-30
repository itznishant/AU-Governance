const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { toUtf8Bytes, keccak256, parseEther } = ethers.utils;

describe("MyGovernor", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const transactionCount = await owner.getTransactionCount();
  
    // gets the address of the token before it is deployed
    const futureAddress = ethers.utils.getContractAddress({
      from: owner.address,
      nonce: transactionCount + 1
    });

    const MyGovernor = await ethers.getContractFactory("MyGovernor");
    const governor = await MyGovernor.deploy(futureAddress);

    const GovToken = await ethers.getContractFactory("GovToken");
    const token = await GovToken.deploy(governor.address);

    await token.delegate(owner.address); // delegating voting weight of 10000 tokens 

    return { governor, token, owner, otherAccount };
  }

  it("should provide the owner with a starting balance", async () => {
    const { token, owner } = await loadFixture(deployFixture);

    const balance = await token.balanceOf(owner.address);
    expect(balance.toString()).to.equal(parseEther("10000"));
  });

  describe("after proposing", () => {
    async function afterProposingFixture() {
      const deployValues = await deployFixture();
      const { governor, token, owner } = deployValues;

      const tx = await governor.propose(
        [token.address],
        [0],
        [token.interface.encodeFunctionData("mint", [owner.address, parseEther("25000")])],
        "Give the owner 25000 more tokens!"
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(x => x.event === 'ProposalCreated');
      const { proposalId } = event.args;

      // wait for the 1 block voting delay
      await hre.network.provider.send("evm_mine");
      
      return { ...deployValues, proposalId } 
    }
    
    it("should set the initial state of the proposal", async () => {
      const { governor, proposalId } = await loadFixture(afterProposingFixture);
      
      const state = await governor.state(proposalId);
      expect(state).to.equal(0);
    });
    
    describe("after voting", () => {
      async function afterVotingFixture() {
        const proposingValues = await afterProposingFixture();
        const { governor, proposalId } = proposingValues;
        
        const tx = await governor.castVote(proposalId, 1);      
        const receipt = await tx.wait();
        const voteCastEvent = receipt.events.find(x => x.event === 'VoteCast');
        
        // wait for the 1 block voting period
        await hre.network.provider.send("evm_mine");

        return { ...proposingValues, voteCastEvent }
      }

      it("should have set the vote", async () => {
        const { voteCastEvent, owner } = await loadFixture(afterVotingFixture);

        expect(voteCastEvent.args.voter).to.equal(owner.address);
        expect(voteCastEvent.args.weight.toString()).to.equal(parseEther("10000").toString());
      });

      it("should allow executing the proposal", async () => {
        const { governor, token, owner } = await loadFixture(afterVotingFixture);

        await governor.execute(
          [token.address],
          [0],
          [token.interface.encodeFunctionData("mint", [owner.address, parseEther("25000")])],
          keccak256(toUtf8Bytes("Give the owner 25000 more tokens!"))
        );

        const balance = await token.balanceOf(owner.address);
        expect(balance.toString()).to.equal(parseEther("35000").toString());
      });
    });
  });
});
