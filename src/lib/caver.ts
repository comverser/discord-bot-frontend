import Caver from 'caver-js';

const KLAYTN_RPC_URL = 'https://public-node-api.klaytnapi.com/v1/cypress';
// const NETWORK_ID = '8217';

export const caver = new Caver(KLAYTN_RPC_URL);
