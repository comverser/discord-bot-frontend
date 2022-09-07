/* This should run on server-side for security reason */

import Caver from 'caver-js';

/* Don't use public node for your service stability */
// const KLAYTN_RPC_URL_PUBLIC = 'https://public-node-api.klaytnapi.com/v1/cypress';

const KLAYTN_RPC_URL = 'https://node-api.klaytnapi.com/v1/klaytn';
const NETWORK_ID = '8217';

const ACCESS_KEY_ID = import.meta.env.VITE_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = import.meta.env.VITE_SECRET_ACCESS_KEY;

const option = {
	headers: [
		{
			name: 'Authorization',
			value: 'Basic ' + Buffer.from(ACCESS_KEY_ID + ':' + SECRET_ACCESS_KEY).toString('base64')
		},
		{ name: 'x-chain-id', value: NETWORK_ID }
	]
};

export const caver = new Caver(new Caver.providers.HttpProvider(KLAYTN_RPC_URL, option));
