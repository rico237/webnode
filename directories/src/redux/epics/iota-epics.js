import { Observable } from "rxjs";
import { combineEpics } from "redux-observable";
import {
  IOTA_PREPARE_TRANSFERS,
  IOTA_PREPARE_TRANSFERS_SUCCESS
} from "../actions/action-types";
import { requestPrepareTransfersSuccess } from "../actions/iota-actions";
import { requestPoW } from "../actions/pow-actions";
import { prepareTransfers } from "../../services/iota";

const prepareTransfersEpic = (action$, store) => {
  return action$.ofType(IOTA_PREPARE_TRANSFERS).mergeMap(action => {
    const { address, message, value, tag, seed } = action.payload;

    return Observable.fromPromise(
      prepareTransfers({ address, message, value, tag, seed })
    )
      .map(arrayOfTrytes => requestPrepareTransfersSuccess(arrayOfTrytes))
      .catch(error => Observable.empty());
  });
};

const requestPow = (action$, store) => {
  return action$.ofType(IOTA_PREPARE_TRANSFERS_SUCCESS).map(action => {
    const arrayOfTrytes = action.payload;
    const { iotaTransactionReceive } = store.getState().iota;
    const FAKE_DATA = {
      trunkTransaction:
        "9KCCKUWJUCCXGAEQTHKYUFDU9OOMEAVKCJZBBVUTVPOMJNVGHBC9UJOJTAOARFKWGI9EPMCJKFVX99999",
      branchTransaction:
        "9ETBMNMZUXKXNGEGGHLLMQSIK9TBZEDVQUAIARPDFDWQWJFNECPHPVUIFAPWJQ9MDOCUFICJCDXSA9999",
      mwm: 14,
      trytes: arrayOfTrytes
    };
    return requestPoW(FAKE_DATA);
  });
};

export default combineEpics(prepareTransfersEpic, requestPow);
