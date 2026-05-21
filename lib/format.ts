/** 统一美元格式 */
export function formatUsd(value: number, decimals = 0): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatUsdSigned(value: number, decimals = 0): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${formatUsd(Math.abs(value), decimals)}`;
}
