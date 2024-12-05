export const genarateVerificationToken = (data) => {
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  return verificationToken
}
