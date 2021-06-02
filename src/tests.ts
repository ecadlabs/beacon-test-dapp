import {
  TezosToolkit,
  ContractAbstraction,
  Wallet,
  MichelsonMap,
  OpKind,
  ContractProvider
} from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { char2Bytes } from "@taquito/utils";
import { RequestSignPayloadInput, SigningType } from "@airgap/beacon-sdk";
import { TestSettings, TestResult } from "./types";

const sendTez = async (Tezos: TezosToolkit): Promise<TestResult> => {
  let opHash = "";
  try {
    const op = await Tezos.wallet
      .transfer({ to: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", amount: 1 })
      .send();
    await op.confirmation();
    opHash = op.opHash;
    return { success: true, opHash };
  } catch (error) {
    console.log(error);
    return { success: false, opHash: "" };
  }
};

const sendInt = async (
  contract: ContractAbstraction<Wallet> | ContractAbstraction<ContractProvider>
): Promise<TestResult> => {
  let opHash = "";
  try {
    const op = await contract.methods.simple_param(5).send();
    opHash = op.hasOwnProperty("opHash") ? op["opHash"] : op["hash"];
    await op.confirmation();
    return { success: true, opHash };
  } catch (error) {
    console.log(error);
    return { success: false, opHash: "" };
  }
};

const sendComplexParam = async (
  contract: ContractAbstraction<Wallet> | ContractAbstraction<ContractProvider>
): Promise<TestResult> => {
  let opHash = "";
  try {
    const op = await contract.methods.complex_param(5, "Taquito").send();
    opHash = op.hasOwnProperty("opHash") ? op["opHash"] : op["hash"];
    await op.confirmation();
    return { success: true, opHash };
  } catch (error) {
    console.log(error);
    return { success: false, opHash: "" };
  }
};

const callFail = async (
  contract: ContractAbstraction<Wallet> | ContractAbstraction<ContractProvider>
): Promise<TestResult> => {
  let opHash = "";
  try {
    const op = await contract.methods.fail([["unit"]]).send();
    opHash = op.hasOwnProperty("opHash") ? op["opHash"] : op["hash"];
    await op.confirmation();
    return { success: false, opHash: "" };
  } catch (error) {
    console.log(error);
    if (
      error.hasOwnProperty("data") &&
      Array.isArray(error.data) &&
      error.data.length === 2 &&
      error.data[1].hasOwnProperty("with") &&
      error.data[1].with.hasOwnProperty("string") &&
      error.data[1].with.string === "Fail entrypoint"
    ) {
      return { success: true, opHash };
    } else {
      return { success: false, opHash: "" };
    }
  }
};

const callFaiWithInt = async (
  contract: ContractAbstraction<Wallet> | ContractAbstraction<ContractProvider>
): Promise<TestResult> => {
  let opHash = "";
  try {
    const op = await contract.methods.fail_with_int([["unit"]]).send();
    opHash = op.hasOwnProperty("opHash") ? op["opHash"] : op["hash"];
    await op.confirmation();
    return { success: false, opHash: "" };
  } catch (error) {
    console.log(error);
    if (
      error.hasOwnProperty("data") &&
      Array.isArray(error.data) &&
      error.data.length === 2 &&
      error.data[1].hasOwnProperty("with") &&
      error.data[1].with.hasOwnProperty("int") &&
      error.data[1].with.int == 5
    ) {
      return { success: true, opHash };
    } else {
      return { success: false, opHash: "" };
    }
  }
};

const callFaiWithPair = async (
  contract: ContractAbstraction<Wallet> | ContractAbstraction<ContractProvider>
): Promise<TestResult> => {
  let opHash = "";
  try {
    const op = await contract.methods.fail_with_pair([["unit"]]).send();
    opHash = op.hasOwnProperty("opHash") ? op["opHash"] : op["hash"];
    await op.confirmation();
    return { success: false, opHash: "" };
  } catch (error) {
    console.log(error);
    if (
      error.hasOwnProperty("data") &&
      Array.isArray(error.data) &&
      error.data.length === 2 &&
      error.data[1].hasOwnProperty("with") &&
      error.data[1].with.hasOwnProperty("prim") &&
      error.data[1].with.prim === "Pair" &&
      error.data[1].with.hasOwnProperty("args") &&
      Array.isArray(error.data[1].with.args) &&
      error.data[1].with.args.length === 2 &&
      error.data[1].with.args[0].hasOwnProperty("int") &&
      error.data[1].with.args[0].int == 6 &&
      error.data[1].with.args[1].hasOwnProperty("string") &&
      error.data[1].with.args[1].string === "taquito"
    ) {
      return { success: true, opHash };
    } else {
      return { success: false, opHash: "" };
    }
  }
};

const originateSuccess = async (Tezos: TezosToolkit): Promise<TestResult> => {
  let opHash = "";
  try {
    // fetches contract code
    // https://better-call.dev/florencenet/KT1RH3gjrnrarQ4qMgxotUxLocX8TM3Fconm/operations
    const code = (await Tezos.wallet.at("KT1RH3gjrnrarQ4qMgxotUxLocX8TM3Fconm"))
      .script.code;
    const storage = new MichelsonMap();
    const op = await Tezos.wallet.originate({ code, storage }).send();
    opHash = op.opHash;
    await op.confirmation();
    return { success: true, opHash };
  } catch (error) {
    console.log(error);
    return { success: false, opHash: "" };
  }
};

const batchApiTest = async (Tezos: TezosToolkit): Promise<TestResult> => {
  let opHash = "";
  try {
    const op = await Tezos.wallet
      .batch([
        {
          kind: OpKind.TRANSACTION,
          to: "tz1ZfrERcALBwmAqwonRXYVQBDT9BjNjBHJu",
          amount: 300000,
          mutez: true
        },
        {
          kind: OpKind.TRANSACTION,
          to: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
          amount: 300000,
          mutez: true
        },
        {
          kind: OpKind.TRANSACTION,
          to: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
          amount: 300000,
          mutez: true
        }
      ])
      .send();
    opHash = op.opHash;
    await op.confirmation();
    return { success: true, opHash };
  } catch (error) {
    console.log(error);
    return { success: false, opHash: "" };
  }
};

const batchApiContractCallsTest = async (
  Tezos: TezosToolkit,
  contract: ContractAbstraction<Wallet> | ContractAbstraction<ContractProvider>,
  callToContract
): Promise<TestResult> => {
  let opHash = "";
  try {
    const storage: any = await contract.storage();
    /*const batch = Tezos.wallet
      .batch()
      .withContractCall(contract.methods.simple_param(5))
      .withContractCall(contract.methods.simple_param(6))
      .withContractCall(contract.methods.simple_param(7));
    const op = await batch.send();*/
    const batch = [
      {
        kind: OpKind.TRANSACTION,
        ...contract.methods.simple_param(5).toTransferParams()
      },
      {
        kind: OpKind.TRANSACTION,
        ...contract.methods.simple_param(6).toTransferParams()
      },
      {
        kind: OpKind.TRANSACTION,
        ...contract.methods.simple_param(7).toTransferParams()
      }
    ];
    const op = await callToContract.batch(batch).send();
    opHash = op.opHash;
    await op.confirmation();
    const newStorage: any = await contract.storage();
    if (
      newStorage.simple.toNumber() ===
      storage.simple.toNumber() + 5 + 6 + 7
    ) {
      return { success: true, opHash };
    } else {
      throw `Unexpected number in storage, expected ${storage.simple.toNumber()}, got ${newStorage.simple.toNumber()}`;
    }
  } catch (error) {
    console.log(error);
    return { success: false, opHash: "" };
  }
};

const signPayload = async (
  input: string,
  wallet: BeaconWallet
): Promise<TestResult> => {
  const userAddress = await wallet.getPKH();
  const formattedInput = `Tezos Signed Message: beacon-test-dapp.netlify.app/ ${new Date().toISOString()} ${input}`;
  const bytes = "05" + char2Bytes(formattedInput);
  const payload: RequestSignPayloadInput = {
    signingType: SigningType.MICHELINE,
    payload: bytes,
    sourceAddress: userAddress
  };
  try {
    const signedPayload = await wallet.client.requestSignPayload(payload);
    return {
      success: true,
      opHash: "",
      output: signedPayload.signature,
      sigDetails: { input, formattedInput, bytes }
    };
  } catch (error) {
    return { success: false, opHash: "", output: JSON.stringify(error) };
  }
};

const signPayloadAndSend = async (
  input: string,
  wallet: BeaconWallet,
  contract: ContractAbstraction<Wallet> | ContractAbstraction<ContractProvider>
): Promise<TestResult> => {
  if (!input) throw "No input provided";

  const userAddress = await wallet.getPKH();
  const formattedInput = `Tezos Signed Message: beacon-test-dapp.netlify.app/ ${new Date().toISOString()} ${input}`;
  const bytes = "05" + char2Bytes(formattedInput);
  const payload: RequestSignPayloadInput = {
    signingType: SigningType.MICHELINE,
    payload: bytes,
    sourceAddress: userAddress
  };
  try {
    const signedPayload = await wallet.client.requestSignPayload(payload);
    // gets user's public key
    const activeAccount = await wallet.client.getActiveAccount();
    const publicKey = activeAccount.publicKey;
    // sends transaction to contract
    const op = await contract.methods
      .check_signature(publicKey, signedPayload.signature, bytes)
      .send();
    await op.confirmation();
    return {
      success: true,
      opHash: op.hasOwnProperty("opHash") ? op["opHash"] : op["hash"],
      output: signedPayload.signature,
      sigDetails: { input, formattedInput, bytes }
    };
  } catch (error) {
    return { success: false, opHash: "", output: JSON.stringify(error) };
  }
};

export default (
  Tezos: TezosToolkit,
  contract: ContractAbstraction<Wallet> | ContractAbstraction<ContractProvider>,
  wallet: BeaconWallet | undefined
): TestSettings[] => [
  {
    id: "send-tez",
    name: "Send tez",
    description: "This test sends 1 tez to Alice's address",
    run: () => sendTez(Tezos),
    showExecutionTime: false,
    inputRequired: false
  },
  {
    id: "contract-call-simple-type",
    name: "Contract call with int",
    description: "This test calls a contract entrypoint and passes an int",
    run: () => sendInt(contract),
    showExecutionTime: false,
    inputRequired: false
  },
  {
    id: "contract-call-complex-type",
    name: "Contract call with (pair nat string)",
    description:
      "This test calls a contract entrypoint and passes a pair holding a nat and a string",
    run: () => sendComplexParam(contract),
    showExecutionTime: false,
    inputRequired: false
  },
  {
    id: "contract-call-fail",
    name: "Contract call that fails",
    description:
      'This test calls a contract entrypoint that fails with the message "Fail entrypoint"',
    run: () => callFail(contract),
    showExecutionTime: false,
    inputRequired: false
  },
  {
    id: "contract-call-fail-with-int",
    name: "Contract call that fails with int",
    description: "This test calls a contract entrypoint that fails with an int",
    run: () => callFaiWithInt(contract),
    showExecutionTime: false,
    inputRequired: false
  },
  {
    id: "contract-call-fail-with-pair",
    name: "Contract call that fails with (pair int string)",
    description: "This test calls a contract entrypoint that fails with a pair",
    run: () => callFaiWithPair(contract),
    showExecutionTime: false,
    inputRequired: false
  },
  {
    id: "originate-success",
    name: "Originate smart contract with success",
    description: "This test successfully originates a smart contract",
    run: () => originateSuccess(Tezos),
    showExecutionTime: false,
    inputRequired: false
  },
  {
    id: "batch-api",
    name: "Use the Batch API with a wallet",
    description: "This test sends 0.3 tez to 3 different addresses",
    run: () => batchApiTest(Tezos),
    showExecutionTime: false,
    inputRequired: false
  },
  {
    id: "batch-api-contract-call",
    name: "Use the Batch API for contract calls",
    description: "This test calls the same entrypoint 3 times in 1 transaction",
    run: () =>
      batchApiContractCallsTest(
        Tezos,
        contract,
        wallet ? Tezos.wallet : Tezos.contract
      ),
    showExecutionTime: false,
    inputRequired: false
  },
  {
    id: "sign-payload",
    name: "Sign the provided payload",
    description: "This test signs the payload provided by the user",
    run: input => signPayload(input, wallet),
    showExecutionTime: false,
    inputRequired: true
  },
  {
    id: "sign-payload-and-send",
    name: "Sign and send the signature to the contract",
    description:
      "This test signs the provided payload and sends it to the contract to check it",
    run: input => signPayloadAndSend(input, wallet, contract),
    showExecutionTime: false,
    inputRequired: true
  }
  /*{
      id: "originate-fail",
      name: "Originate smart contract that fails",
      description: "This test originates a smart contract that fails",
      run: () => console.log("originate-fail")
    }*/
];
