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
                <div className="dash-header">
                    <h1>Dashboard Overview</h1>
                    <p className="dash-sub">Real-time breakdown of your earnings, spending, and savings</p>
                </div>
                <div className="stats-con">
                    <div className="chart-con">
                        <Chart />
                        <div className="amount-con">
                            <div className="stat-card income">
                                <div className="card-top">
                                    <h2>Total Income</h2>
                                    <span className="card-icon inc"><i className="fa-solid fa-arrow-trend-up"></i></span>
                                </div>
                                <p className="amount-val">
                                    {dollar} {totalIncome()}
                                </p>
                            </div>
                            <div className="stat-card expense">
                                <div className="card-top">
                                    <h2>Total Expense</h2>
                                    <span className="card-icon exp"><i className="fa-solid fa-arrow-trend-down"></i></span>
                                </div>
                                <p className="amount-val">
                                   {dollar} {totalExpenses()}
                                </p>
                            </div>
                            <div className="stat-card balance">
                                <div className="card-top">
                                    <h2>Net Balance</h2>
                                    <span className="card-icon bal"><i className="fa-solid fa-wallet"></i></span>
                                </div>
                                <p className="amount-val bal-val">
                                    {dollar} {totalBalance()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="history-con">
                        <History />
                        <div className="min-max-box">
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

    .dash-header {
        margin-bottom: 1rem;
        h1 {
            font-size: clamp(1.4rem, 3vw, 2.2rem);
            color: #222260;
            font-weight: 800;
        }
        .dash-sub {
            color: rgba(34, 34, 96, 0.6);
            font-size: 0.95rem;
            margin-top: 0.2rem;
        }
    }

    .stats-con {
        background: transparent;
        padding: 0.5rem 0;
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
                gap: 1.2rem;
                margin-top: 1.5rem;

                .stat-card {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(8px);
                    border: 2px solid #FFFFFF;
                    box-shadow: 0px 4px 18px rgba(0, 0, 0, 0.04);
                    border-radius: 20px;
                    padding: 1.2rem;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;

                    &:hover {
                        transform: translateY(-2px);
                        box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.07);
                    }

                    .card-top {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 0.6rem;

                        h2 {
                            font-size: clamp(0.95rem, 1.8vw, 1.15rem);
                            color: #64748b;
                            font-weight: 600;
                        }

                        .card-icon {
                            width: 38px;
                            height: 38px;
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.05rem;

                            &.inc { background: #dcfce7; color: #16a34a; }
                            &.exp { background: #fee2e2; color: #dc2626; }
                            &.bal { background: #e0e7ff; color: #4f46e5; }
                        }
                    }

                    .amount-val {
                        font-size: clamp(1.8rem, 3vw, 2.6rem);
                        font-weight: 800;
                        color: #1e293b;
                        word-break: break-word;

                        &.bal-val {
                            color: #10b981;
                        }
                    }
                }

                .income,
                .expense {
                    grid-column: span 2;
                }

                .balance {
                    grid-column: 2 / 4;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;

                    .card-top {
                        justify-content: center;
                        gap: 0.6rem;
                    }

                    .amount-val {
                        font-size: clamp(2rem, 3.8vw, 3.2rem);
                    }
                }
            }
        }

        .history-con {
            grid-column: 4 / -1;

            .min-max-box {
                margin-top: 1.5rem;
            }

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