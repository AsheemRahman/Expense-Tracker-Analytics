export const exportCSV = async (expenses: any[]) => {
    const header = "title,amount,category,date\n";

    const rows = expenses
        .map((e) => `${e.title},${e.amount},${e.category.name},${e.date.toISOString()}`)
        .join("\n");

    return header + rows;
};
