import { useWallet, WalletStatus } from '@terra-money/wallet-provider'
import ConnectButton from './ConnectButton';
import ConnectedButton from './ConnectedButton';

import st_nav from "../Nav.module.css";

const WalletProvider = () => {
    const { status } = useWallet();

    switch (status) {
        case WalletStatus.INITIALIZING:
            return <button className={st_nav.wallet_button}>Loading...</button>
        case WalletStatus.WALLET_NOT_CONNECTED:
            return <ConnectButton/>
        case WalletStatus.WALLET_CONNECTED:
            return <ConnectedButton/>
    }
}

export default WalletProvider;