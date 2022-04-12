import { writable } from "svelte/store";
import type { NetworkType } from "@airgap/beacon-sdk";
import type { TezosToolkit } from "@taquito/taquito";
import type { BeaconWallet } from "@taquito/beacon-wallet";
import { defaultMatrixNode } from "./config";

interface State {
  Tezos: TezosToolkit;
  userAddress: string | undefined;
  userBalance: number | undefined;
  wallet: BeaconWallet | undefined;
  disableDefaultEvents: boolean;
  networkType: NetworkType | undefined;
  matrixNode: string | undefined;
  confirmationObservableTest:
    | undefined
    | { level: number; currentConfirmation: number }[];
}

const initialState: State = {
  Tezos: undefined,
  userAddress: undefined,
  userBalance: undefined,
  wallet: undefined,
  matrixNode: defaultMatrixNode,
  disableDefaultEvents: true,
  networkType: undefined,
  confirmationObservableTest: undefined
};

const store = writable(initialState);

const state = {
  subscribe: store.subscribe,
  updateUserAddress: (address: string) =>
    store.update(store => ({
      ...store,
      userAddress: address
    })),
  updateUserBalance: (balance: number) =>
    store.update(store => ({
      ...store,
      userBalance: balance
    })),
  updateTezos: (Tezos: TezosToolkit) =>
    store.update(store => ({
      ...store,
      Tezos
    })),
  updateWallet: (wallet: BeaconWallet) =>
    store.update(store => ({
      ...store,
      wallet
    })),
  updateMatrixNode: (matrixNode: string) =>
    store.update(store => ({
      ...store,
      matrixNode
    })),
  updateDefaultEvents: () =>
    store.update(store => ({
      ...store,
      disableDefaultEvents: !store.disableDefaultEvents
    })),
  updateNetworkType: (networkType: NetworkType) =>
    store.update(store => ({
      ...store,
      networkType
    })),
  updateConfirmationObservableTest: (conf: any) =>
    store.update(store => ({
      ...store,
      confirmationObservableTest:
        store.confirmationObservableTest &&
        Array.isArray(store.confirmationObservableTest)
          ? [...store.confirmationObservableTest, conf]
          : [conf]
    })),
  resetConfirmationObservableTest: () =>
    store.update(store => ({
      ...store,
      confirmationObservableTest: undefined
    }))
};

export default state;
