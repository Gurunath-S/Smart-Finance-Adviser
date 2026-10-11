import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import History from '../../History/History';
import { InnerLayout } from '../../styles/Layouts';
import { dollar } from '../../utils/Icons';
import Chart from '../Chart/Chart';

function Dashboard() {
    const { totalExpenses, incomes, expenses, totalIncome, totalBalance, getIncomes, getExpenses } = useGlobalContext()

    useEffect(() => {
        getIncomes()
        getExpenses()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const minIncome = incomes.length ? Math.min(...incomes.map(item => item.amount)) : 0;
    const maxIncome = incomes.length ? Math.max(...incomes.map(item => item.amount)) : 0;
    const minExpense = expenses.length ? Math.min(...expenses.map(item => item.amount)) : 0;
    const maxExpense = expenses.length ? Math.max(...expenses.map(item => item.amount)) : 0;

    return (
        <DashboardStyled>
            <InnerLayout>
                <h1>All Transactions</h1>
                <div className="stats-con">
                    <div className="chart-con">
                        <Chart />
                        <div className="amount-con">
                            <div className="income">
                                <h2>Total Income</h2>
                                <p>
                                    {dollar} {totalIncome()}
                                </p>
                            </div>
                            <div className="expense">
                                <h2>Total Expense</h2>
                                <p>
                                   {dollar} {totalExpenses()}
                                </p>
                            </div>
                            <div className="balance">
                                <h2>Total Balance</h2>
                                <p>
                                    {dollar} {totalBalance()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="history-con">
                        <History />
                        <h2 className="salary-title">Min <span>Income</span>Max</h2>
                        <div className="salary-item">
                            <p>${minIncome}</p>
                            <p>${maxIncome}</p>
                        </div>
                        <h2 className="salary-title">Min <span>Expense</span>Max</h2>
                        <div className="salary-item">
                            <p>${minExpense}</p>
                            <p>${maxExpense}</p>
                        </div>
                    </div>
                </div>
            </InnerLayout>
        </DashboardStyled>
    )
}

const DashboardStyled = styled.div`
    padding: 1.5rem;
    background: transparent;

    @media (max-width: 992px) {
        padding: 0.5rem;
    }

    h1 {
        font-size: clamp(1.4rem, 3vw, 2rem);
        margin-bottom: 0.5rem;
    }

    .stats-con {
        background: transparent;
        padding: 1rem 0;
        border-radius: 20px;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 2rem;
        min-height: auto;

        .chart-con {
            grid-column: 1 / 4;
            height: auto;
            display: flex;
            flex-direction: column;

            .amount-con {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
                margin-top: 1.5rem;

                .income,
                .expense {
                    grid-column: span 2;
                }

                .income,
                .expense,
                .balance {
                    background: #FCF6F9;
                    border: 2px solid #FFFFFF;
                    box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
                    border-radius: 20px;
                    padding: 1rem;

                    h2 {
                        font-size: clamp(0.95rem, 2vw, 1.25rem);
                    }

                    p {
                        font-size: clamp(1.8rem, 3.5vw, 3rem);
                        font-weight: 700;
                        word-break: break-word;
                    }
                }

                .balance {
                    grid-column: 2 / 4;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;

                    p {
                        color: var(--color-green);
                        opacity: 0.8;
                        font-size: clamp(2rem, 4.5vw, 3.8rem);
                    }
                }
            }
        }

        .history-con {
            grid-column: 4 / -1;

            h2 {
                margin: 0.8rem 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: clamp(1rem, 2vw, 1.3rem);
            }

            .salary-title {
                font-size: clamp(0.9rem, 1.8vw, 1.1rem);

                span {
                    font-size: clamp(1.2rem, 2.5vw, 1.6rem);
                }
            }

            .salary-item {
                background: #FCF6F9;
                border: 2px solid #FFFFFF;
                box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
                padding: 0.8rem 1rem;
                border-radius: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;

                p {
                    font-weight: 600;
                    font-size: clamp(1.1rem, 2vw, 1.4rem);
                }
            }
        }
    }

    /* Responsive Breakpoints */
    @media (max-width: 1200px) {
        .stats-con {
            grid-template-columns: 1fr;
            gap: 1.5rem;

            .chart-con {
                grid-column: 1 / -1;

                .amount-con {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;

                    .income, .expense {
                        grid-column: span 1;
                    }

                    .balance {
                        grid-column: 1 / -1;
                    }
                }
            }

            .history-con {
                grid-column: 1 / -1;
                margin-top: 1rem;
            }
        }
    }

    @media (max-width: 768px) {
        .stats-con {
            grid-template-columns: 1fr;
            gap: 1.2rem;

            .chart-con {
                .amount-con {
                    grid-template-columns: 1fr;
                    gap: 0.8rem;
                    margin-top: 1rem;

                    .income, .expense, .balance {
                        grid-column: span 1;
                        padding: 0.8rem;
                        border-radius: 16px;

                        p {
                            font-size: 1.8rem;
                        }
                    }

                    .balance p {
                        font-size: 2.2rem;
                    }
                }
            }

            .history-con {
                margin-top: 1rem;

                .salary-item {
                    padding: 0.7rem 0.9rem;
                    p {
                        font-size: 1.1rem;
                    }
                }
            }
        }
    }

    @media (max-width: 480px) {
        padding: 0.2rem;

        .stats-con {
            .history-con {
                margin-top: 0.8rem;
            }
        }
    }
`;


export default Dashboard