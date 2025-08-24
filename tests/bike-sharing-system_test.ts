import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.0.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";

Clarinet.test({
  name: "BikeSharing System - Basic Functionality",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;
    const user2 = accounts.get("wallet_2")!;

    // Deploy the contract
    let block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "initialize", [types.uint(5)], deployer.address)
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);

    // Test initial state
    block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "get-contract-stats", [], user1.address)
    ]);
    assertEquals(block.receipts.length, 1);
    const stats = block.receipts[0].result.expectOk().expectTuple();
    assertEquals(stats["total-bikes"], types.uint(5));
    assertEquals(stats["available-bikes"], types.uint(5));
    assertEquals(stats["total-rentals"], types.uint(0));
    assertEquals(stats["total-revenue"], types.uint(0));
  },
});

Clarinet.test({
  name: "BikeSharing System - Rent Bike Functionality",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;

    // Initialize with 3 bikes
    chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "initialize", [types.uint(3)], deployer.address)
    ]);

    // Rent bike 1
    let block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "rent-bike", [types.uint(1), types.uint(1000)], user1.address)
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.receipts[0].result.expectOk().expectTuple()["bike-id"], types.uint(1));

    // Check bike status
    block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "get-bike-status", [types.uint(1)], user1.address)
    ]);
    const bikeStatus = block.receipts[0].result.expectOk().expectSome().expectTuple();
    assertEquals(bikeStatus["is-available"], types.bool(false));
    assertEquals(bikeStatus["current-renter"], types.some(user1.address));

    // Check updated stats
    block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "get-contract-stats", [], user1.address)
    ]);
    const stats = block.receipts[0].result.expectOk().expectTuple();
    assertEquals(stats["available-bikes"], types.uint(2));
    assertEquals(stats["total-rentals"], types.uint(1));
  },
});

Clarinet.test({
  name: "BikeSharing System - Return Bike Functionality",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;

    // Initialize with 2 bikes
    chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "initialize", [types.uint(2)], deployer.address)
    ]);

    // Rent bike 1
    chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "rent-bike", [types.uint(1), types.uint(1000)], user1.address)
    ]);

    // Mine some blocks to simulate time passing
    chain.mineEmptyBlock(5);

    // Return bike 1
    let block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "return-bike", [types.uint(1), types.none()], user1.address)
    ]);
    assertEquals(block.receipts.length, 1);
    
    const returnResult = block.receipts[0].result.expectOk().expectTuple();
    assertEquals(returnResult["bike-id"], types.uint(1));
    assertEquals(returnResult["renter"], user1.address);
    assertEquals(returnResult["rental-duration"], types.uint(5));
    assertEquals(returnResult["rental-fee"], types.uint(50)); // 5 blocks * 10 microSTX

    // Check bike is available again
    block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "get-bike-status", [types.uint(1)], user1.address)
    ]);
    const bikeStatus = block.receipts[0].result.expectOk().expectSome().expectTuple();
    assertEquals(bikeStatus["is-available"], types.bool(true));
    assertEquals(bikeStatus["current-renter"], types.none());
  },
});

Clarinet.test({
  name: "BikeSharing System - Error Handling",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;
    const user2 = accounts.get("wallet_2")!;

    // Initialize with 1 bike
    chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "initialize", [types.uint(1)], deployer.address)
    ]);

    // Try to rent non-existent bike
    let block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "rent-bike", [types.uint(5), types.uint(1000)], user1.address)
    ]);
    assertEquals(block.receipts[0].result.expectErr(), types.uint(105)); // err-invalid-bike-id

    // Try to rent with insufficient deposit
    block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "rent-bike", [types.uint(1), types.uint(500)], user1.address)
    ]);
    assertEquals(block.receipts[0].result.expectErr(), types.uint(104)); // err-insufficient-deposit

    // Rent bike successfully
    chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "rent-bike", [types.uint(1), types.uint(1000)], user1.address)
    ]);

    // Try to rent already rented bike
    block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "rent-bike", [types.uint(1), types.uint(1000)], user2.address)
    ]);
    assertEquals(block.receipts[0].result.expectErr(), types.uint(102)); // err-bike-already-rented

    // Try to return bike you don't own
    block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "return-bike", [types.uint(1), types.none()], user2.address)
    ]);
    assertEquals(block.receipts[0].result.expectErr(), types.uint(103)); // err-bike-not-rented
  },
});

Clarinet.test({
  name: "BikeSharing System - Maintenance Tracking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;

    // Initialize with 1 bike
    chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "initialize", [types.uint(1)], deployer.address)
    ]);

    // Rent bike
    chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "rent-bike", [types.uint(1), types.uint(1000)], user1.address)
    ]);

    // Return bike with maintenance notes
    let block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "return-bike", [
        types.uint(1), 
        types.some(types.ascii("Brake needs adjustment"))
      ], user1.address)
    ]);
    assertEquals(block.receipts[0].result.expectOk().expectTuple()["bike-id"], types.uint(1));

    // Check maintenance history
    block = chain.mineBlock([
      Tx.contractCall("bike-sharing-system", "get-bike-maintenance-history", [types.uint(1)], user1.address)
    ]);
    const history = block.receipts[0].result.expectOk().expectSome().expectList();
    assertEquals(history.length, 1);
    
    const maintenanceEntry = history[0].expectTuple();
    assertEquals(maintenanceEntry["description"], types.ascii("Brake needs adjustment"));
  },
});