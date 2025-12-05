export const exportCSV = async (expenses: any[]) => {
    const header = "title,amount,category,date\n";

    const rows = expenses
        .map((e) => {
            const date = new Date(e.date).toISOString().split("T")[0]; // YYYY-MM-DD
            return `${e.title},${e.amount},${e.category_name},${date}`;
        })
        .join("\n");

    return header + rows;
};
