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

export const getCW20Swaprate = async ( liq_addr: string ): Promise<number> => {
    const liquidity_pool_query = 
    `https://lcd.terra.dev/wasm/contracts/${liq_addr}/store?query_msg=%7B%22pool%22:%7B%7D%7D`
    const { data: liq_pool_data } = await axios.get(liquidity_pool_query);
    
    const {
        result: {
            assets: [
                { amount: cw20Amount },
                { amount: nativeAmount },
            ]
        }
    } = liq_pool_data;
    
    return nativeAmount / cw20Amount
}