import st_nb from "./NoBalance.module.css";

const NoBalance = ({desc}: any) => (
    <div className={st_nb.no_balance}>
        <img src="images/png/angelwing.png" alt="wing"/>
        <h6>{desc}</h6>
    </div>
)

export default NoBalance;