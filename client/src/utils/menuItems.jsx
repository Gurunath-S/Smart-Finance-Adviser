import counseller from "./../img/counsellor.png";
import dashboard from "./../img/dashboard.png";
import profits from "./../img/profits.png";
import expense from "./../img/expense.png";
import transaction from "./../img/transaction.png";

const iconStyle = { width: '32px', height: '32px' };

export const menuItems = [
    {
        id: 1,
        title: ' Dashboard',
        icon: <img src={dashboard} alt="Dashboard Icon" style={iconStyle} />,
        link: '/dashboard'
    },
    {
        id: 2,
        title: " Incomes",
        icon: <img src={profits} alt="Incomes Icon" style={iconStyle} />,
        link: "/dashboard",
    },
    {
        id: 3,
        title: "Expenses",
        icon: <img src={expense} alt="Expenses Icon" style={iconStyle} />,
        link: "/dashboard",
    },
    {
        id: 4,
        title: "View Transactions",
        icon: <img src={transaction} alt="Transactions Icon" style={iconStyle} />,
        link: "/dashboard",
    },
    {
        id: 5,
        title: "Get Financial Suggestions",
        icon: <img src={counseller} alt="Financial Suggestions Icon" style={iconStyle} />,
        link: "/dashboard",
    },
];
