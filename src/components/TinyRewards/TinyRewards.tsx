import useAddress from 'hooks/useAddress';
import { useEffect, useState } from 'react';
import { useLCDClient, useWallet } from '@terra-money/wallet-provider';
import axios from "axios";
import { toChainAmount, ustValue } from 'functions';
import { claimReward, donateTinyAmount } from 'msgs';
import { MsgSend, MsgWithdrawDelegatorReward } from '@terra-money/terra.js';
import { ANGEL_PROTO_ADDRESS_BOMBAY, ANGEL_PROTO_ADDRESS_MAIN, } from '../../constants';
import TokenContainer from 'components/Token/TokenContainer';
import DescriptionSubmit from 'components/DescriptionSubmit/DescriptionSubmit';
import SectionWrapper from 'components/SectionWrapper/SectionWrapper';
import TxModal from 'components/Modal/TxModal';

export default function TinyRewards () {
    const ustSwapRateQuery = "https://fcd.terra.dev/v1/market/swaprate/uusd"
    const lowerlimit = 0.000001 //below this amount in UST will not be donatable

    const LCD = useLCDClient();
    const user_address = useAddress();
    const { status } = useWallet();

    const [validatorAddresses, setValidatorAddress] = useState<string[]>([]);
    const [totalRewards, setTotalRewards] = useState<any[]>([]);
    const [mapPopulated, setMapPopulated] = useState<boolean>(false);
    const [ustSwapRateMap, setUstSwapRateMap] = useState<any>(undefined)
    const [threshold, setThreshold] = useState<number>(2.5);
    const [msgs, setMsgs] = useState<any[]>([]);

    //function to update available rewards to donate on slider change
    const rewardStateSetter = async () => {
        if ( !user_address || !mapPopulated ) {
            setTotalRewards([]);
            return;
        }

        const { total: totalRewards } = await LCD.distribution.rewards(user_address)
        let relevantRewards = totalRewards.toData()
        .filter(reward => Number( reward.amount ) >= toChainAmount(lowerlimit) 
        && ustValue(reward, ustSwapRateMap) < toChainAmount(threshold) )

        relevantRewards = relevantRewards.map((el: any) => {
            return {
                ...el,
                amount: Math.floor(el.amount)
            }
        })

        setTotalRewards(relevantRewards);
    }

    const remove = (denom: string) => {
        setTotalRewards(prev => prev.filter(coin => coin.denom !== denom))
    }

    const refetchUserState = () => {
        rewardStateSetter()
    }

    const rewardDonate = async () => {
        if( validatorAddresses.length === 0 || totalRewards.length === 0 ) {
            return;
        }

        const msgs: (MsgSend | MsgWithdrawDelegatorReward)[] 
        = claimReward(user_address, validatorAddresses)

        const tinyRewardsObj = totalRewards.reduce((obj, el) => {
            return Object.assign(obj, { [el.denom]: el.amount })
        }, {})

        const [ sendRewardsToAngelMsg ] = donateTinyAmount(user_address, ANGEL_PROTO_ADDRESS_MAIN, tinyRewardsObj);
        msgs.push(sendRewardsToAngelMsg);
        
        setMsgs(msgs);
    }

    useEffect(() => {
        if (!user_address) return;

        ;(async () => {
            /* UST Swaprate to calculate all denominations into appropriate unified tiny amount limit */
            const { data: swaprates } = await axios.get(ustSwapRateQuery);
            const swapMap = swaprates.reduce((map: any, obj: any) => { map.set(obj.denom, obj.swaprate); return map; }, new Map([["uusd", 1]]));
            setUstSwapRateMap(swapMap);

            /* fetch and store all validator addresses user has staked to */
            const [delegations] = await LCD.staking.delegations(user_address)
            const validatorAddresses = delegations.map(e => e.validator_address);
            setValidatorAddress(validatorAddresses);

            setMapPopulated(true);
        })();
    }, [ user_address ]);

    //rewards threshold slider callback
    useEffect(() => {
        if ( !user_address || ustSwapRateMap === undefined || !mapPopulated ) return;

        const getTotalRewards = setTimeout(rewardStateSetter, 200);
        return () => clearTimeout(getTotalRewards);
    }, [ user_address, threshold, validatorAddresses, ustSwapRateMap, mapPopulated ])

    useEffect( refetchUserState , [ status ])

    return (
        <>
        <TxModal msgs={msgs}/>
        <SectionWrapper type="reward">
            <DescriptionSubmit 
            title={<h1>Donate Your Small Staking Rewards</h1>}
            subtitle="Withdraw your Luna staking rewards and give rewards with small balance to charity."
            threshold_desc="Small Reward Threshold:"
            threshold={threshold}
            setThreshold={setThreshold}
            donate={rewardDonate}
            button_desc="Withdraw and Donate Small Rewards"
            />
            <TokenContainer 
            donate={rewardDonate}
            button_desc="Withdraw and Donate Small Rewards"
            desc="No Tiny Rewards Available"
            array={totalRewards} swapMap={ustSwapRateMap} remove={ remove }/>
        </SectionWrapper>
        </>
    )
}