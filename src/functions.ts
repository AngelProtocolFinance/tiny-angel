import axios from "axios"
import { cw20Tokens } from "./constants"

//chain <-> ui amount ratio converters
export const toTerraAmount = (amount: number | string): number => + amount / 1000000
export const toChainAmount = (amount: number | string): number => + amount * 1000000

//conversion of tokens to corresponding UST value
export const ustValue = (e: any, map: any) => {
    if ( Object.keys(cw20Tokens).includes(e.denom) ) {
       return Number( e.amount ) * map.get(e.denom) ?? 1
    } else {
        return Number( e.amount ) / map.get(e.denom) ?? 1
    }
}

//calculate sum of total donatables
export const sumOf = (donatables: any[], map: any): number =>
toTerraAmount(donatables.map(b => ustValue(b, map)).reduce((p, c) => p + c, 0))

export const getCW20Swaprate = async ( token: string ): Promise<number> => {
    const { data } = await axios.get("https://api.anchorprotocol.com/api/v1/market/ust");
    return Number( data.exchange_rate )
}