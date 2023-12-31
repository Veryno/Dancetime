"use client"

import { useEffect, useState } from "react"
import Modal from "../components/Modal";

const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted){
        return null; // ensuring none of the modals can be seen or opened during server side rendering
    }

    return(
        <>
        <Modal />
        </>
    )
}

export default ModalProvider;