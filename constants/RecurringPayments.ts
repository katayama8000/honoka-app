export const RecurringPayments = () => {
  const recurringPayments = [
    { amount: 2000, item: "ガソリン", memo: "自動追加" },
    {
      amount: 26809,
      item: "家賃",
      memo: "自動追加 (68450+170-15000)/2 \n 振り込み手数料：170 家賃手当：15,000",
    },
  ] as const;

  return recurringPayments;
};
