import styled from "styled-components";
import { motion } from "framer-motion";

export const MainLayout = styled(motion.div).attrs(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
}))`
    padding: 2rem;
    height: 100%;
    display: flex;
    gap: 2rem;
    border-radius: 20px;

    @media (max-width: 992px) {
        padding: 1rem;
        gap: 1.2rem;
        flex-direction: column;
        height: auto;
        min-height: 100vh;
    }

    @media (max-width: 576px) {
        padding: 0.6rem 0.4rem;
        gap: 0.8rem;
    }
`;

export const InnerLayout = styled(motion.div).attrs(() => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
}))`
    padding: 2rem 1.5rem;
    width: 100%;
    border-radius: 15px;
    transform-origin: top;
    overflow: hidden;

    @media (max-width: 992px) {
        padding: 1.25rem 1rem;
    }

    @media (max-width: 576px) {
        padding: 0.75rem 0.5rem;
        border-radius: 12px;
    }
`;

