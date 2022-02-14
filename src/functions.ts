//chain <-> ui amount ratio converters
export const toTerraAmount = (amount: number | string): number => + amount / 1000000
export const toChainAmount = (amount: number | string): number => + amount * 1000000

//conversion of tokens to corresponding UST value
export const ustValue = (e: any, map: any) => Number( e.amount ) / map.get(e.denom || "uusd")

//calculate sum of total donatables
export const sumOf = (donatables: any[], map: any): number =>
toTerraAmount(donatables.map(b => ustValue(b, map)).reduce((p, c) => p + c, 0))