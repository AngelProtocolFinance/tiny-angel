import { useEffect, useState } from 'react'

const WindowDimensions = (): boolean => {
    const [windowDimensions, setWindowDimensions] = useState<boolean>(true)

    useEffect(() => {
        function handleResize(): void {
            setWindowDimensions(window.innerWidth > 768)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return (): void => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
}

export default WindowDimensions