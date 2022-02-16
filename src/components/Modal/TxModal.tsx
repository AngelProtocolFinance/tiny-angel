import { MsgExecuteContract, MsgSend, MsgWithdrawDelegatorReward } from '@terra-money/terra.js'
import { Modal, ModalContent } from "@chakra-ui/react";
import { UserDenied, CreateTxFailed, TxFailed, 
    TxUnspecifiedError, Timeout, TxResult, 
    useLCDClient, useConnectedWallet 
} from '@terra-money/wallet-provider'
import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'

import st_tx from "./TxModal.module.css";

export enum TxStep {
    /*Before Wallet Signing*/
    Idle = 0,
    /*Before Wallet Signing*/

    /*Waiting for Wallet Signature*/
    Waiting = 1,
    /*Waiting for Wallet Signature*/

    /*Tx Hash created: Waiting for Info Query*/
    Hashed = 2,
    /*Tx Hash created: Waiting for Info Query*/

    /*Tx Broadcasted Successfully*/
    Success = 3,
    /*Tx Broadcasted Successfully*/

    /*Tx Failed*/
    Failed = 4,
    /*Tx Failed*/
}

type TinyAngelMsgs = (MsgSend | MsgExecuteContract)[] | (MsgSend | MsgWithdrawDelegatorReward)[];

const TxModal = ({ msgs }: { msgs: TinyAngelMsgs }): JSX.Element => {
    const client = useLCDClient()
    const wallet = useConnectedWallet();

    const [open, setOpen] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string>('')
    const [status, setStatus] = useState<TxStep>(TxStep.Idle)
    const [error, setError] = useState<string>('')

    const reset = () => {
        setStatus(TxStep.Idle)
        setTxHash('')
        setError('')
        setOpen(false)
    }

    const queryFinder = (params: string) => {
        const network = `${wallet?.network.chainID}` === 'bombay-12' ? 'testnet' : 'mainnet'
        const type_of_find = params ? (params.length === 64 ? 'tx' : 'address') : ''
    
        return `https://finder.terra.money/${network}/${type_of_find}/${params}`
    }

    const Dialog = ({type, title, img }: any) => {
        return (
            <div className={st_tx.dialog} style={{ 
                padding: status === TxStep.Success || status === TxStep.Failed ? "25px 50px" : "50px" 
            }}>
                <img src={img} alt="tx"/>
                <div className={st_tx.title_tx}>
                    <h1>{title}</h1>
                    {(type !== TxStep.Waiting && type !== TxStep.Failed) && 
                    <h3>Tx Hash: <span><a href={queryFinder(txHash)} target="_blank">
                        {txHash.slice(0,5)}...{txHash.slice(-5)}</a></span>
                    </h3>
                    }
                </div>
                {(type === TxStep.Success || type === TxStep.Failed) && 
                    <button onClick={() => window.location.reload()}>Go Back</button>
                }
            </div>
        )
    }

    /* Query to get txInfo after Hash is created */
    const { data: txInfo } = useQuery(
        ['txInfo', txHash],
        () => {
            if (txHash === '') return

            return client.tx.txInfo(txHash)
        },
        {
            enabled: status !== TxStep.Idle,
            retry: true,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
        },
    )
    /* Query to get txInfo after Hash is created */

    useEffect(() => {
        if (msgs.length === 0 || !wallet) return;

        (async() => {
            setError('')

            let res: TxResult | string

            try {
                if (!client) {
                    throw new Error('Error in LCDClient')
                }

                setStatus(TxStep.Waiting)

                /* Wallet Transaction */
                res = await wallet.post({
                    msgs,
                })

                setTxHash(res.result.txhash)
                setStatus(TxStep.Hashed)
                /* Wallet Transaction */
            } catch (error: unknown) {
                if (error instanceof UserDenied) {
                    res = 'User Denied'
                    console.log(res);
                } else if (error instanceof CreateTxFailed) {
                    res = 'Create Tx Failed: ' + error.message
                    console.log(res);
                } else if (error instanceof TxFailed) {
                    res = 'Tx Failed: ' + error.message
                    console.log(res);
                } else if (error instanceof Timeout) {
                    res = 'Timeout'
                } else if (error instanceof TxUnspecifiedError) {
                    res = 'Unspecified Error: ' + error.message
                    console.log(res);
                } else {
                    res = error instanceof Error ? error.message : String(error)
                    console.log(res);
                }
                setStatus(res === 'User Denied' ? TxStep.Idle : TxStep.Failed)
                setError(res)
            }
        })();
    }, [ msgs ]);

    useEffect(() => {
        if (txInfo != null && txHash !== '') {
            if (txInfo.code) {
                setStatus(TxStep.Failed)
            } else {
                setStatus(TxStep.Success)
            }
        }
    }, [txInfo, txHash])

    useEffect(() => {
        if (status !== TxStep.Idle) {
            setOpen(true);
        }
    }, [status])

    useEffect(() => {
        if (error === "User Denied") {
            setOpen(false);
        }
    }, [ error ]);

    return (
        <Modal isCentered isOpen={open} onClose={() => null} size="sm">
            <ModalContent>
                { status === TxStep.Waiting && 
                <Dialog img="images/png/angelwing_bl.png" title="Waiting on Wallet..." type={TxStep.Waiting}/> 
                }
                { status === TxStep.Hashed && 
                <Dialog img="images/png/angelwing_bl.png" title="Broadcasting Transaction..." type={TxStep.Hashed}/> 
                }
                { status === TxStep.Success && 
                <Dialog img="images/png/angelwing_bl.png" title="Transaction Successful!" type={TxStep.Success}/>
                }
                { status === TxStep.Failed && 
                <Dialog img="images/png/angelwing_bl.png" title="Transaction Failed :(" type={TxStep.Failed}/>
                }
            </ModalContent>
        </Modal>
    )
}

export default TxModal;
