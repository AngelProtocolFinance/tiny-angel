import { Modal, ModalContent, ModalCloseButton, Image, useDisclosure } from '@chakra-ui/react'
import { ConnectType, useWallet } from '@terra-money/wallet-provider'
import { useState } from 'react'

import st_nav from "../Nav.module.css";
import st_connect from "./ConnectButton.module.css";

const ConnectButton = () => {
    const { availableConnectTypes, availableInstallTypes, connect, install } = useWallet()

    const [openModal, setOpenModal] = useState<boolean>(false)
    const { onClose } = useDisclosure()

    return (
        <>
            <button className={st_nav.wallet_button}
            onClick={() => setOpenModal(!openModal)}>
                Connect Wallet
            </button>

            <Modal blockScrollOnMount={false} isCentered isOpen={openModal} onClose={onClose} size='sm'>
                <ModalContent className={st_connect.modal}>
                    <ModalCloseButton onClick={() => setOpenModal(false)} outline="none"/>
                    <h3 className={st_connect.title}>Connect to Terra Station</h3>
                    {availableConnectTypes.some((connectType: string) => connectType === ConnectType.EXTENSION) ? (
                        <button className={`${st_connect.button}`} onClick={() => connect(ConnectType.EXTENSION)}>
                            Connect via Chrome Extension
                        </button>
                    ) : availableInstallTypes.some((connectType: string) => connectType === ConnectType.EXTENSION) ? (
                        <button className={`${st_connect.button}`} onClick={() => install(ConnectType.EXTENSION)}>
                            Install Chrome Extension
                        </button>
                    ) : null}

                    {availableConnectTypes.some((connectType: string) => connectType === ConnectType.WALLETCONNECT) && (
                        <button
                            className={`${st_connect.button}`}
                            onClick={() => {
                                setOpenModal(false)
                                connect(ConnectType.WALLETCONNECT)
                            }}
                        >
                            Connect via Mobile
                        </button>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default ConnectButton;