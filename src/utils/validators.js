const { createHttpError } = require("./errors");

const asTrimmedString = (value) =>
  typeof value === "string" ? value.trim() : "";

const requireNonEmptyString = (value, fieldName) => {
  const normalized = asTrimmedString(value);

  if (!normalized) {
    throw createHttpError(400, `${fieldName} is required.`);
  }

  return normalized;
};

const optionalString = (value) => {
  const normalized = asTrimmedString(value);
  return normalized || null;
};

const requireNonNegativeNumber = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw createHttpError(400, `${fieldName} must be a non-negative number.`);
  }

  return parsed;
};

const requirePositiveInteger = (value, fieldName) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createHttpError(400, `${fieldName} must be a positive integer.`);
  }

  return parsed;
};

const parseBoolean = (value, defaultValue = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return defaultValue;
};

module.exports = {
  requireNonEmptyString,
  optionalString,
  requireNonNegativeNumber,
  requirePositiveInteger,
  parseBoolean,
};
