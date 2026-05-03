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
    }, [])

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
                        <h2 className="salary-title">Min <span>Salary</span>Max</h2>
                        <div className="salary-item">
                            <p>
                                ${Math.min(...incomes.map(item => item.amount))}
                            </p>
                            <p>
                                ${Math.max(...incomes.map(item => item.amount))}
                            </p>
                        </div>
                        <h2 className="salary-title">Min <span>Expense</span>Max</h2>
                        <div className="salary-item">
                            <p>
                                ${Math.min(...expenses.map(item => item.amount))}
                            </p>
                            <p>
                                ${Math.max(...expenses.map(item => item.amount))}
                            </p>
                        </div>
                    </div>
                </div>
            </InnerLayout>
        </DashboardStyled>
    )
}

const DashboardStyled = styled.div`
    padding: 2rem;
    background: rgba(250, 229, 250, -2);

    .stats-con {
        background: transparent;
        padding: 2rem;
        border-radius: 20px;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 2rem;
        min-height: 80vh; 
        .chart-con {
            grid-column: 1 / 4;
            height: 400px;

            .amount-con {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 2rem;
                margin-top: 2rem;

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

                    p {
                        font-size: 3.5rem;
                        font-weight: 700;
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
                        opacity: 0.6;
                        font-size: 4.5rem;
                    }
                }
            }
        }

        .history-con {
            grid-column: 4 / -1;

            h2 {
                margin: 1rem 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .salary-title {
                font-size: 1.2rem;

                span {
                    font-size: 1.8rem;
                }
            }

            .salary-item {
                background: #FCF6F9;
                border: 2px solid #FFFFFF;
                box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
                padding: 1rem;
                border-radius: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;

                p {
                    font-weight: 600;
                    font-size: 1.6rem;
                }
            }
        }
    }

   /* Responsive Styles */
@media (max-width: 1200px) {
    .stats-con {
        grid-template-columns: 1fr 1fr; /* Maintain two columns */
        
        .chart-con {
            grid-column: 1 / 3; /* Make the chart take full width */
            height:200px;
        }
        
        .history-con {
            grid-column: 1 / 3; /* Make history take full width */
        }
    }
}

@media (max-width: 768px) {
    .stats-con {
        grid-template-columns: 1fr; /* Single column layout for smaller tablets */
        
        .chart-con {
            .amount-con {
                grid-template-columns: 1fr 1fr; /* Keep two columns for income, expense, and balance */
                .income, .expense, .balance {
                    padding: 0.8rem;
                    
                    p {
                        font-size: 2.8rem;
                    }
                }
                
                .balance p {
                    font-size: 3.5rem;
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .stats-con {
        grid-template-columns: 1fr; /* Full-width single column for mobile */
        
        .chart-con {
            height: auto;

            .amount-con {
                grid-template-columns: 1fr; /* Make all items stack vertically */
                gap: 1rem;

                .income, .expense, .balance {
                    padding: 0.6rem;

                    p {
                        font-size: 2.2rem;
                    }
                }

                .balance p {
                    font-size: 2.8rem;
                }
            }
        }

        .history-con {
            .salary-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
        }
    }
}
`;


export default Dashboard