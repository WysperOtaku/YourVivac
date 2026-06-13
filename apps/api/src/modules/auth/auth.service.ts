// auth.service — lógica de autenticación (UC-A1 y flujos de email).
// Worker: implementa estas funciones usando UserModel/SessionModel, lib/jwt,
// lib/password, lib/firebase y lib/mailer. Mantén la firma o documenta el cambio.
//
// Funciones esperadas (referencia §12 / casos de uso):
//   googleAuth(idToken) · register(input) · login(input) · refresh(token)
//   logout(sessionId) · verifyEmail(token) · forgotPassword(email) · resetPassword(token, pw)
//   me(userId)

export const AUTH_MODULE = 'auth';
