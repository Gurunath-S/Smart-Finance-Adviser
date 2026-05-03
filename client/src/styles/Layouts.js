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
    ${'' /* box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); */}
`;

export const InnerLayout = styled(motion.div).attrs(() => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
}))`
    padding: 2rem 1.5rem;
    width: 100%;
    ${'' /* background: white; */}
    border-radius: 15px;
    ${'' /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); */}
    transform-origin: top;
    overflow: hidden;
`;

