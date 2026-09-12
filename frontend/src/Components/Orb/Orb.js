import React from 'react';
import styled from 'styled-components';
import homebg from '../../img/homebg.png';

const OrbStyled = styled.div`
    width: 100%;
    height: 100vh;
    position: absolute;
    background: url(${homebg}) no-repeat center center;
    background-size: cover;
`;

function Orb() {
    return <OrbStyled />;
}

export default Orb;
