"use client"

import {useEffect, useState} from "react"
import AuthModal from "../components/AuthModal";
import UploadModal from "../components/UploadModal";

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
            <AuthModal />
            <UploadModal />
        </>
    )
}

export default ModalProvider;