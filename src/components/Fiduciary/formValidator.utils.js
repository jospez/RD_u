export const validateAddressStart = (value) =>
value === "" ? true : value?.startsWith("0x") && value?.length === 42;

export const validateAddressLength = (value) =>
value === "" ? true : value?.length === 42;