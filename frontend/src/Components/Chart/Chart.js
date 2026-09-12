import React from 'react'
import {Chart as ChartJs, 
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js'

import {Line} from 'react-chartjs-2'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext'
import { dateFormat } from '../../utils/dateFormat'

ChartJs.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
)

function Chart() {
    const { incomes, expenses } = useGlobalContext()

    // Aggregate unique dates chronologically
    const allDateStrings = Array.from(
        new Set([
            ...incomes.map(item => new Date(item.date).toISOString().split('T')[0]),
            ...expenses.map(item => new Date(item.date).toISOString().split('T')[0])
        ])
    ).sort((a, b) => new Date(a) - new Date(b));

    const labels = allDateStrings.length ? allDateStrings.map(d => dateFormat(d)) : ['No Transactions'];

    const incomeSeries = allDateStrings.length ? allDateStrings.map(d => {
        return incomes
            .filter(item => new Date(item.date).toISOString().split('T')[0] === d)
            .reduce((sum, item) => sum + item.amount, 0);
    }) : [0];

    const expenseSeries = allDateStrings.length ? allDateStrings.map(d => {
        return expenses
            .filter(item => new Date(item.date).toISOString().split('T')[0] === d)
            .reduce((sum, item) => sum + item.amount, 0);
    }) : [0];

    const data = {
        labels,
        datasets: [
            {
                label: 'Income',
                data: incomeSeries,
                backgroundColor: 'rgba(66, 173, 0, 0.1)',
                borderColor: '#42AD00',
                tension: .2
            },
            {
                label: 'Expenses',
                data: expenseSeries,
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderColor: '#FF0000',
                tension: .2
            }
        ]
    }


    return (
        <ChartStyled >
            <Line data={data} />
        </ChartStyled>
    )
}

const ChartStyled = styled.div`
    background: #FCF6F9;
    border: 2px solid #FFFFFF;
    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
    padding: 1rem;
    border-radius: 20px;
    height: 100%;
`;

export default Chart