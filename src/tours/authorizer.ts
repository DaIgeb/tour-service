export const isAuthenticated = (token: string, issuer: string) => {
  return issuer.endsWith(process.env.COGNITO_POOL);
}

export const isAuthorized = (groups: string, requiredGroup: string) => {
  return groups.indexOf(requiredGroup) !== -1;
}