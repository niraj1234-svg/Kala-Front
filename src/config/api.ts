/**
 * Centralized API configuration for KALA Frontend.
 * Resolves the backend API base URL using Vite environment variable `VITE_API_BASE_URL`
 * with a fallback to local development URL (http://localhost:5000/api).
 */
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim().replace(/\/+$/, '')

export const API_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl}/api`
