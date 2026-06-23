export function setQueryParam(
  params: URLSearchParams,
  key: string,
  value: string,
  defaultValue: string
) {
  if (!value || value === defaultValue) {
    params.delete(key);
    return;
  }

  params.set(key, value);
}

export function validOption(value: string, validValues: Set<unknown>) {
  return validValues.has(value);
}
