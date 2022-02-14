import NoBalance from "components/NoBalance/NoBalance";
import { sumOf } from "functions";
import WindowDimensions from "hooks/useDimensions";
import Token from "./Token";

import st_token from "./Token.module.css";

const TokenContainer = ({array, swapMap, remove, desc, donate, button_desc}: any) => {

    const isWeb = WindowDimensions();

    return (
        <div className={st_token.columns}>
            <div className={st_token.outer_tokens_container}>
                <div className={st_token.inner_tokens_container}>
                    <div className={st_token.heading}>
                        <h3>Total Donation Amount:</h3>
                        <h3>{sumOf(array, swapMap).toFixed(6)} UST</h3>
                    </div>
                    <hr style={{ margin: '20px 0' }}/>
                    { array.length !== 0 ?
                    <div className={st_token.tokens_container}>
                        {array.map((balance: any, i: number) => 
                        <Token remove={() => remove(balance.denom)}
                        key={i} balance={balance} map={swapMap}/>)
                        }
                    </div> : <NoBalance desc={desc}/>
                    }
                </div>
            </div>
            {!isWeb && <button className={st_token.donate_button} onClick={ donate }>{button_desc}</button>} 
        </div>
    )
}

export default TokenContainer;