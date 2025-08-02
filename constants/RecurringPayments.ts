export const RecurringPayments = () => {
  const recurringPayments = [
    { amount: 2000, item: "ガソリン", memo: "自動追加" },
    {
      amount: 34310,
      item: "家賃",
      memo: `自動追加 (68450+170)/2`,
    },
  ] as const;

  return recurringPayments;
};
