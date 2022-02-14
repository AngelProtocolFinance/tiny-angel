import st_nav from "./Nav.module.css";
import WalletProvider from "./WalletProvider/WalletProvider";

const Nav = () => {


    return (
        <nav id={st_nav.nav}>
            <div className={st_nav.links}>
                <a href="https://www.angelprotocol.io/" target="_blank">
                    <img src="images/png/angelprotocol_whiteweblogo.png" alt="logo"/>
                </a>
                <ul>
                    <li>Tiny Angel</li>
                </ul>
            </div>
            <WalletProvider/>
        </nav>
    )
}

export default Nav;