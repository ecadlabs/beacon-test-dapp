import { writable } from "svelte/store";

interface State {
  confirmationObservableTest:
    | undefined
    | { level: number; currentConfirmation: number }[];
}

const initialState: State = {
  confirmationObservableTest: undefined
};

const store = writable(initialState);

const state = {
  subscribe: store.subscribe,
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
