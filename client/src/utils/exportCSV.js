/**
 * Export transactions to a CSV file (client-side, no server needed)
 */
export const exportToCSV = (incomes = [], expenses = [], filename = 'transactions.csv') => {
    const rows = [
        ['Type', 'Title', 'Category', 'Amount (₹)', 'Date', 'Description'],
        ...incomes.map(i => [
            'Income', i.title, i.category, i.amount,
            new Date(i.date).toLocaleDateString('en-IN'), i.description
        ]),
        ...expenses.map(e => [
            'Expense', e.title, e.category, e.amount,
            new Date(e.date).toLocaleDateString('en-IN'), e.description
        ]),
    ];

    const csvContent = rows
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};
