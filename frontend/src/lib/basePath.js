// Get basePath from environment or default
// This should match the basePath in next.config.js
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/course-reserv';

export const getFullPath = (path) => {
  // If path already starts with basePath, return as is
  if (path.startsWith(BASE_PATH)) {
    return path;
  }
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
};

export const redirectTo = (path) => {
  if (typeof window !== 'undefined') {
    window.location.href = getFullPath(path);
  }
};
