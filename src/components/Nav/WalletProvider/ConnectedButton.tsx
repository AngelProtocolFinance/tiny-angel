import { useWallet } from "@terra-money/wallet-provider";
import useAddress from "hooks/useAddress";
import st_nav from "../Nav.module.css";

const ConnectedButton = () => {
    const user_address = useAddress();
    const { disconnect } = useWallet();

    return (
        <button 
        onClick={ disconnect }
        className={st_nav.wallet_button}>
            {user_address.slice(0, 7)}...{user_address.slice(-5)}
            &nbsp;&nbsp;|&nbsp;&nbsp;
            ↗
        </button>
    )
}

export default ConnectedButton;