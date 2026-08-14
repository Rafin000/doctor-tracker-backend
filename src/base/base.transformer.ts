/**
 * Transformer contracts (mirrors the Forward Flow base transformer).
 * Transformers keep controllers/services free of response-shaping concerns
 * and guarantee we never leak internal fields (e.g. Mongo __v) to clients.
 */
export interface Transformer<Input = unknown, Output = unknown> {
  transform(input: Input): Output
}

export interface CollectionTransformer<Input = unknown, Output = unknown> {
  transformCollection(input: Input[]): Output[]
}
