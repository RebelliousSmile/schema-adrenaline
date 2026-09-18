/** A document value whose playable intervals are validated by the public codecs. */
export class PlayableRangeValidationError extends Error {
  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "PlayableRangeValidationError";
  }
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlayableRange(value: RecordValue): value is {
  minimum: number;
  current: number;
  maximum: number;
} {
  return (
    typeof value.minimum === "number" &&
    typeof value.current === "number" &&
    typeof value.maximum === "number"
  );
}

function validate(value: unknown, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validate(item, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) return;

  if (isPlayableRange(value)) {
    if (value.minimum > value.current) {
      throw new PlayableRangeValidationError(path, "minimum must be less than or equal to current");
    }
    if (value.current > value.maximum) {
      throw new PlayableRangeValidationError(path, "current must be less than or equal to maximum");
    }
  }

  for (const [key, child] of Object.entries(value)) validate(child, `${path}.${key}`);
}

/**
 * Validates every `{ minimum, current, maximum }` object in a decoded
 * Adrenaline document. Zod and the generated draft-7 schemas intentionally
 * validate only the structural shape; use this function or a public codec for
 * the complete portable-contract validation.
 */
export function validatePlayableRanges<T>(value: T): T {
  validate(value, "$");
  return value;
}
