const { ethers } = require("hardhat");

async function main() {
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

  console.log("Governor successfully deployed to address: ", governor.address);
  console.log("Token successfully deployed to address: ", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
