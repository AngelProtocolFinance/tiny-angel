import { toTerraAmount, ustValue } from "functions";
import st_token from "./Token.module.css";
import { visualDenomName } from "../../constants";

const Token = ({ balance, map, remove }: any) => {

    return (
        <div className={st_token.token}>
            <div className={st_token.denom}>
                 <img 
                src={`images/svg/${visualDenomName.get(balance.denom)}.svg`}/>
                &nbsp;
                <h3>{visualDenomName.get(balance.denom)}</h3>            
            </div>
            <div className={st_token.amount}>
                <div className={st_token.conversions}>
                    <h3>{toTerraAmount(balance.amount).toFixed(6)}</h3>
                    <h5>≈ {toTerraAmount(ustValue(balance, map)).toFixed(6)} UST</h5>
                </div>
                <button onClick={ remove }>ⓧ</button>
            </div>
        </div>
    )
}

export default Token;