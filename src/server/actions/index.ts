/**
 * Client mutations live in this folder as server actions.
 *
 * Each action module starts with `"use server"` and exports async functions
 * only. Validate the input with a schema from `../schemas`, then call a
 * controller. Re-export public actions from this file.
 *
 * Streaming chat is not an action. It stays on `POST /api/chat`.
 */

export {};
