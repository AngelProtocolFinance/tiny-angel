import useAddress from 'hooks/useAddress';
import { useEffect, useState } from 'react';
import { useLCDClient, useWallet } from '@terra-money/wallet-provider';
import axios from "axios";
import { getCW20Swaprate, toChainAmount, ustValue } from 'functions';
import { donateTinyAmount, donateTinyCW20Amount } from 'msgs';
import { ANGEL_PROTO_ADDRESS_BOMBAY, cw20Tokens } from '../../constants';
import TokenContainer from 'components/Token/TokenContainer';
import DescriptionSubmit from 'components/DescriptionSubmit/DescriptionSubmit';
import SectionWrapper from 'components/SectionWrapper/SectionWrapper';
import TxModal from 'components/Modal/TxModal';
import { MsgExecuteContract, MsgSend } from '@terra-money/terra.js';

export default function TinyBalances () {

    const ustSwapRateQuery = "https://fcd.terra.dev/v1/market/swaprate/uusd"
    const lowerlimit = 0 //below this amount in UST will not be donatable
    const general_ust_fee = toChainAmount(0.04); //for native balance error

    const LCD = useLCDClient();
    const user_address = useAddress();
    const { status } = useWallet();

    const [msgs, setMsgs] = useState<(MsgSend | MsgExecuteContract)[]>([]);
    const [threshold, setThreshold] = useState<number>(2.5);
    const [tinyBalances, setTinyBalances] = useState<any[]>([]);
    const [tinyCW20s, setTinyCW20s] = useState<any[]>([]);
    const [ustSwapRateMap, setUstSwapRateMap] = useState<any>(new Map())
    const [mapPopulated, setMapPopulated] = useState<boolean>(false);

    //remove individual tokens
    const remove = (denom: string) => {
        setTinyBalances(prev => prev.filter(coin => coin.denom !== denom))
        setTinyCW20s(prev => prev.filter(coin => coin.denom !== denom))
    }

    /* postable msgs populator */
    const donate = async () => {
        if ( tinyBalances.length === 0 ) {
            return;
        }

        const balancesObj = tinyBalances.reduce((obj, el) => {
            return Object.assign(obj, { [el.denom]: el.amount })
        }, {})

        const donateNativeMsg = donateTinyAmount(user_address, ANGEL_PROTO_ADDRESS_BOMBAY, balancesObj);
        const donateCW20Msgs = donateTinyCW20Amount(user_address, ANGEL_PROTO_ADDRESS_BOMBAY, tinyCW20s);

        const msgs = [...donateNativeMsg, ...donateCW20Msgs];
        setMsgs(msgs);
        console.log(msgs);
    }

    //function to update native tokens to donate on slider change
    const tinyBalanceSetter = async () => {
        if ( !user_address || !mapPopulated ) {
            setTinyBalances([]);
            return;
        }

        const [coins] = await LCD.bank.balance(user_address);

        const tinyBalances = coins.toData()
        .filter(coin => 
        ustValue(coin, ustSwapRateMap) > toChainAmount(lowerlimit)
        && ustValue(coin, ustSwapRateMap) < toChainAmount(threshold));

        tinyBalances.forEach((coin, index) => {
            if (coin.denom === "uusd") {
                + coin.amount > general_ust_fee ? 
                coin.amount = `${+ coin.amount - general_ust_fee}` :
                tinyBalances.splice(index, 1)
            }
        })
        setTinyBalances(tinyBalances);
    }

    const tinyCW20Setter = async () => {
        if ( !user_address ) {
            setTinyCW20s([]);
            return;
        }

        let cw20s: any[] = [];

        for ( const [symbol, address] of Object.entries(cw20Tokens) ) {
            const { balance }: any = await LCD.wasm.contractQuery(address, {
                balance: {
                    address: user_address
                },
            })
            cw20s.push({ denom: symbol, amount: String( balance ), address: address });
        }

        cw20s = cw20s.filter(c => Number( c.amount ) >= toChainAmount(lowerlimit)
        && ustValue(c, ustSwapRateMap) < toChainAmount(threshold));
        setTinyCW20s(cw20s);
    }

    const refetchUserState = () => {
        tinyBalanceSetter();
        tinyCW20Setter();
    }

    useEffect(() => {
        if (!user_address || !cw20Tokens) return;

        ;(async () => {
            /* UST Swaprate to calculate all denominations into appropriate unified tiny amount limit */
            const { data: swaprates } = await axios.get(ustSwapRateQuery);
            const swapMap = swaprates.reduce((map: any, obj: any) => { map.set(obj.denom, + obj.swaprate); return map; }, new Map([["uusd", 1]]));

            for ( const key of Object.keys(cw20Tokens) ) {
                const swaprate = await getCW20Swaprate(key);
                swapMap.set(key, swaprate);
            }

            setUstSwapRateMap(swapMap);
            setMapPopulated(true);
        })();
    }, [ user_address, cw20Tokens ]);

    //native token threshold slider callback
    useEffect(() => {
        if ( !user_address || ustSwapRateMap === undefined || !mapPopulated || !cw20Tokens ) return;

        tinyBalanceSetter();
        tinyCW20Setter();
    }, [ user_address, ustSwapRateMap, mapPopulated, cw20Tokens ]);

    //just for threshold with timeout
    useEffect(() => {
        if ( !user_address || ustSwapRateMap === undefined || !mapPopulated ) return;

        const getTinyBalances = setTimeout(() => {
            tinyBalanceSetter();
            tinyCW20Setter();
        }, 200);
        return () => clearTimeout(getTinyBalances);
    }, [ threshold ]);

    useEffect( refetchUserState , [ status ])

    return (
        <>
        <TxModal msgs={msgs}/>
        <SectionWrapper type="balance">
            <TokenContainer 
            donate={donate}
            button_desc="Donate Angel Dust"
            desc="No Angel Dust Available"
            array={[...tinyBalances, ...tinyCW20s]} swapMap={ustSwapRateMap} remove={ remove }/>
            <DescriptionSubmit 
            title={<h1>Donate Your<br/>Angel Dust</h1>}
            subtitle="Clean out the small balances in your wallet by giving it to a good cause."
            threshold_desc="Small Balance Threshold:"
            threshold={threshold}
            setThreshold={setThreshold}
            donate={donate}
            button_desc="Donate Angel Dust"
            />
        </SectionWrapper>
        </>
    )
}