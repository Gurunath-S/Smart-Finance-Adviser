import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layouts';
import IncomeItem from '../IncomeItem/IncomeItem';
import ExpenseForm from './ExpenseForm';

function Expenses() {
    const { expenses, getExpenses, deleteExpense, totalExpenses } = useGlobalContext()

    useEffect(() => {
        getExpenses()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <ExpenseStyled>
            <InnerLayout>
                <h1>Expenses</h1>
                <h2 className="total-income">Total Expense: <span>${totalExpenses()}</span></h2>
                <div className="income-content">
                    <div className="form-container">
                        <ExpenseForm />
                    </div>
                    <div className="incomes">
                        {expenses.length === 0 ? (
                            <p style={{ textAlign: "center", color: "rgba(34, 34, 96, 0.6)", padding: "2rem" }}>
                                No expenses recorded yet. Add your first expense using the form.
                            </p>
                        ) : (
                            expenses.map((expense) => {
                                const {_id, title, amount, date, category, description, type} = expense;
                                return <IncomeItem
                                    key={_id}
                                    id={_id} 
                                    title={title} 
                                    description={description} 
                                    amount={amount} 
                                    date={date} 
                                    type={type || 'expense'}
                                    category={category} 
                                    indicatorColor="var(--color-delete)"
                                    deleteItem={deleteExpense}
                                />
                            })
                        )}
                    </div>
                </div>
            </InnerLayout>
        </ExpenseStyled>
    )
}

const ExpenseStyled = styled.div`
    display: flex;
    overflow: auto;
    width: 100%;

    h1 {
        font-size: clamp(1.4rem, 3vw, 2rem);
    }

    .total-income {
        display: flex;
        justify-content: center;
        align-items: center;
        background: #FCF6F9;
        border: 2px solid #FFFFFF;
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        border-radius: 20px;
        padding: 0.8rem 1.2rem;
        margin: 1rem 0;
        font-size: clamp(1.1rem, 2.5vw, 1.8rem);
        gap: .5rem;
        flex-wrap: wrap;
        text-align: center;

        span {
            font-size: clamp(1.3rem, 3.5vw, 2.3rem);
            font-weight: 800;
            color: var(--color-delete);
        }
    }

    .income-content {
        display: flex;
        gap: 2rem;

        @media (max-width: 992px) {
            flex-direction: column;
            gap: 1.5rem;
        }

        .form-container {
            width: 100%;
            max-width: 420px;

            @media (max-width: 992px) {
                max-width: 100%;
            }
        }

        .incomes {
            flex: 1;
            width: 100%;
        }
    }
`;

export default Expenses