import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useWindowSize } from '../../utils/useWindowSize';
import homebg from '../../img/homebg.png'; // Ensure the path is correct

function Orb() {
    const { width, height } = useWindowSize();

    console.log(width, height);

    const moveOrb = keyframes`
        0% {
            transform: translate(0, 0);
        }
        50% {
            transform: translate(${width}px, ${height / 2}px);
        }
        100% {
            transform: translate(0, 0);
        }
    `;

    const OrbStyled = styled.div`
        width: 100%;
        height: 100vh;
        position: absolute;
        background: url(${() => homebg}) no-repeat center center; /* Use a function to resolve the image path */
        background-size: cover;
    `;

    return <OrbStyled />;
}

export default Orb;
