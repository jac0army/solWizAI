import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  SystemProgram, 
  sendAndConfirmTransaction,
  ComputeBudgetProgram 
} from "@solana/web3.js";

// WizAI Configuration
const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const WIZ_PROGRAM_ID = new PublicKey("Wiz11111111111111111111111111111111111111");

class SolWizAI {
    private connection: Connection;
    private wallet: Keypair;

    constructor(secretKey: Uint8Array) {
        this.connection = new Connection(RPC_ENDPOINT, "confirmed");
        this.wallet = Keypair.fromSecretKey(secretKey);
    }

    /**
     * Executes the core WizAI logic with Solana Priority Fees
     * This replaces the ETH gas-bidding strategy with Compute Unit limits
     */
    async executeWizSpell(targetData: Buffer) {
        const transaction = new Transaction();

        // 1. Add Priority Fees (Essential for SOL competition)
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 1000,
        });

        // 2. Set Compute Limit to optimize throughput
        const setComputeLimit = ComputeBudgetProgram.setComputeUnitLimit({
            units: 200_000,
        });

        // 3. Build the Instruction
        const instruction = {
            keys: [{ pubkey: this.wallet.publicKey, isSigner: true, isWritable: true }],
            programId: WIZ_PROGRAM_ID,
            data: targetData,
        };

        transaction.add(addPriorityFee, setComputeLimit, instruction);

        try {
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [this.wallet]
            );
            console.log(`Spell Executed: https://solscan.io/tx/${signature}`);
        } catch (error) {
            console.error("Execution failed:", error);
        }
    }
}
