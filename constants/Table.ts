type TableEnvSuffix = 'dev_' | '';
type TableName = 'couples' | 'monthly_invoices' | 'payments' | 'users';
type TableFullName<T extends TableName> = `${TableEnvSuffix}${T}`;

const isProduction = process.env.EXPO_PUBLIC_APP_ENV === "production";
const getTableName = <T extends TableName>(baseName: T): TableFullName<T> => 
  isProduction ? baseName as TableFullName<T> : `dev_${baseName}` as TableFullName<T>;

const couples_table: TableFullName<'couples'> = getTableName('couples');
const monthly_invoices_table: TableFullName<'monthly_invoices'> = getTableName('monthly_invoices');
const payments_table: TableFullName<'payments'> = getTableName('payments');
const users_table: TableFullName<'users'> = getTableName('users');

export { couples_table, monthly_invoices_table, payments_table, users_table };
