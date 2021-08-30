import { writable } from "svelte/store";

interface State {
  userAddress: string | undefined;
  confirmationObservableTest:
    | undefined
    | { level: number; currentConfirmation: number }[];
}

const initialState: State = {
  userAddress: undefined,
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
