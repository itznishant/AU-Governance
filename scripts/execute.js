const { ethers } = require("hardhat");
const { toUtf8Bytes, keccak256, parseEther } = ethers.utils;
require("dotenv").config();

const governorAddress = process.env.GOVERNOR_CA_SEPOLIA;

const tokenAddress = process.env.TOKEN_CA_SEPOLIA;

async function executeProposal() {
  const [owner] = await ethers.getSigners();

  const governor = await ethers.getContractAt("MyGovernor", governorAddress);
  const token = await ethers.getContractAt("GovToken", tokenAddress);

  const execTx = await governor.execute(
    [token.address],
    [0],
    [token.interface.encodeFunctionData("mint", [owner.address, parseEther("25000")])],
    keccak256(toUtf8Bytes("Give the owner 25000 more tokens!"))
  );

  const tx = await execTx.wait();

  const OwnerBalance = await token.balanceOf(owner.address);

  console.log("OWNER TOKEN BALANCE: ", ((await OwnerBalance) / 1e18 ).toString());
}

executeProposal().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
