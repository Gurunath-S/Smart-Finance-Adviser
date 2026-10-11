import React from 'react'
import styled from 'styled-components'
import { dateFormat } from '../../utils/dateFormat';
import { bitcoin, book, calender, card, circle, clothing, comment, dollar, food, freelance, medical, money, piggy, stocks, takeaway, trash, tv, users, yt } from '../../utils/Icons';
import Button from '../Button/Button';

function IncomeItem({
    id,
    title,
    amount,
    date,
    category,
    description,
    deleteItem,
    indicatorColor,
    type
}) {

    const categoryIcon = () =>{
        switch(category) {
            case 'salary':
                return money;
            case 'freelancing':
                return freelance
            case 'investments':
                return stocks;
            case 'stocks':
                return users;
            case 'bitcoin':
                return bitcoin;
            case 'bank':
                return card;
            case 'youtube':
                return yt;
            case 'other':
                return piggy;
            default:
                return ''
        }
    }

    const expenseCatIcon = () => {
        switch (category) {
            case 'education':
                return book;
            case 'groceries':
                return food;
            case 'health':
                return medical;
            case 'subscriptions':
                return tv;
            case 'takeaways':
                return takeaway;
            case 'clothing':
                return clothing;
            case 'travelling':
                return freelance;
            case 'other':
                return circle;
            default:
                return ''
        }
    }

    return (
        <IncomeItemStyled indicator={indicatorColor} isExpense={type === 'expense'}>
            <div className="icon">
                {type === 'expense' ? expenseCatIcon() : categoryIcon()}
            </div>
            <div className="content">
                <div className="title-row">
                    <h5>{title}</h5>
                    <span className="category-pill">{category}</span>
                </div>
                <div className="inner-content">
                    <div className="text">
                        <p className="amount-p">{dollar} {amount}</p>
                        <p>{calender} {dateFormat(date)}</p>
                        {description && (
                            <p className="desc-p">
                                {comment}
                                {description}
                            </p>
                        )}
                    </div>
                    <div className="btn-con">
                        <Button 
                            icon={trash}
                            bPad={'0.75rem'}
                            bRad={'50%'}
                            bg={'rgba(239, 68, 68, 0.1)'}
                            color={'#ef4444'}
                            iColor={'#ef4444'}
                            hColor={'#fff'}
                            onClick={() => deleteItem(id)}
                        />
                    </div>
                </div>
            </div>
        </IncomeItemStyled>
    )
}

const IncomeItemStyled = styled.div`
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    border: 2px solid #FFFFFF;
    box-shadow: 0px 4px 18px rgba(0, 0, 0, 0.04);
    border-radius: 20px;
    padding: 1.1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    width: 100%;
    color: #222260;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.07);
    }

    @media (max-width: 576px) {
        padding: 0.75rem;
        border-radius: 16px;
        gap: 0.75rem;
    }

    .icon{
        width: 80px;
        height: 80px;
        border-radius: 20px;
        background: #F5F5F5;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #FFFFFF;
        flex-shrink: 0;

        i{
            font-size: 2.6rem;
        }

        @media (max-width: 576px) {
            width: 52px;
            height: 52px;
            border-radius: 14px;

            i {
                font-size: 1.6rem;
            }
        }
    }

    .content{
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: .4rem;
        min-width: 0;

        .title-row {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            flex-wrap: wrap;

            h5{
                font-size: clamp(1rem, 2.2vw, 1.3rem);
                padding-left: 1.8rem;
                position: relative;
                word-break: break-word;
                font-weight: 700;

                &::before{
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: .8rem;
                    height: .8rem;
                    border-radius: 50%;
                    background: ${props => props.indicator};
                }
            }

            .category-pill {
                background: rgba(99, 102, 241, 0.1);
                color: #4f46e5;
                font-size: 0.78rem;
                font-weight: 600;
                padding: 0.2rem 0.55rem;
                border-radius: 6px;
                text-transform: capitalize;
            }
        }

        .inner-content{
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.5rem;

            @media (max-width: 640px) {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.6rem;
            }

            .text{
                display: flex;
                align-items: center;
                gap: 1.5rem;
                flex-wrap: wrap;

                @media (max-width: 640px) {
                    gap: 0.8rem;
                }

                p{
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: var(--primary-color);
                    opacity: 0.85;
                    font-size: clamp(0.85rem, 1.8vw, 1rem);
                    word-break: break-word;
                }

                .amount-p {
                    font-weight: 800;
                    font-size: clamp(1rem, 2vw, 1.2rem);
                    color: ${props => props.isExpense ? '#ef4444' : '#10b981'};
                    opacity: 1;
                }

                .desc-p {
                    color: #64748b;
                    font-style: italic;
                }
            }

            .btn-con {
                @media (max-width: 640px) {
                    align-self: flex-end;
                }
            }
        }
    }
`;

export default IncomeItem