import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layouts';
import Form from '../Form/Form';
import IncomeItem from '../IncomeItem/IncomeItem';
import Pagination from '../Pagination/Pagination';

function Income() {
    const { incomes, getIncomes, deleteIncome, totalIncome } = useGlobalContext();
    const [page, setPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        getIncomes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sortedIncomes = [...incomes].sort((a, b) => new Date(b.date) - new Date(a.date));
    const paginatedIncomes = sortedIncomes.slice((page - 1) * pageSize, page * pageSize);

    return (
        <IncomeStyled>
            <InnerLayout>
                <h1>Incomes</h1>
                <h2 className="total-income">
                    Total Income: <span>${totalIncome()}</span>
                </h2>
                <div className="income-content">
                    <div className="form-container">
                        <Form />
                    </div>
                    <div className="incomes">
                        {incomes.length === 0 ? (
                            <p style={{ textAlign: "center", color: "rgba(34, 34, 96, 0.6)", padding: "2rem" }}>
                                No income records found. Add your first income using the form.
                            </p>
                        ) : (
                            <>
                                {paginatedIncomes.map((income) => {
                                    const { _id, title, amount, date, category, description, type } = income;
                                    return (
                                        <IncomeItem
                                            key={_id}
                                            id={_id}
                                            title={title}
                                            description={description}
                                            amount={amount}
                                            date={date}
                                            type={type}
                                            category={category}
                                            indicatorColor="var(--color-green)"
                                            deleteItem={deleteIncome}
                                        />
                                    );
                                })}
                                <Pagination
                                    currentPage={page}
                                    totalItems={incomes.length}
                                    pageSize={pageSize}
                                    onPageChange={setPage}
                                />
                            </>
                        )}
                    </div>
                </div>
            </InnerLayout>
        </IncomeStyled>
    );
}

const IncomeStyled = styled.div`
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
            color: var(--color-green);
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

export default Income;
