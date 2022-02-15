import { MsgExecuteContract, MsgSend, MsgWithdrawDelegatorReward } from "@terra-money/terra.js";

export const donateTinyAmount = (sender: string, receiver: string, balances: any ): MsgSend[] => {

    return [new MsgSend(
        sender,
        receiver,
        balances,
    )]
}

export const donateTinyCW20Amount = (sender: string, receiver: string, cw20s: any[]): MsgExecuteContract[] => {

    return cw20s.map(cw20 => new MsgExecuteContract(
        sender,
        cw20.address,
        {
            transfer: {
                recipient: receiver,
                amount: cw20.amount,
            }
        }
    ))
}

export const claimReward = (delegator: string, validators: string[]): MsgWithdrawDelegatorReward[] => {

    return validators.map(validator_address => 
        new MsgWithdrawDelegatorReward(
        delegator,
        validator_address
    ))
}