import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

// Memory cache for OAuth Access Token (never store in localStorage/sessionStorage)
let gmailAccessTokenCache: string | null = null;

export const getGmailAccessToken = (): string | null => {
  return gmailAccessTokenCache;
};

export const setGmailAccessToken = (token: string | null): void => {
  gmailAccessTokenCache = token;
};

/**
 * Authenticate Admin with Google and request Gmail Send scope
 */
export async function authorizeAdminGmail(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/gmail.send');
  provider.addScope('https://www.googleapis.com/auth/gmail.compose');
  provider.setCustomParameters({
    prompt: 'consent',
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential || !credential.accessToken) {
      throw new Error('No se pudo obtener el Token de Acceso de Google Gmail.');
    }
    gmailAccessTokenCache = credential.accessToken;
    return credential.accessToken;
  } catch (error: any) {
    console.error('Error al autorizar Gmail:', error);
    throw new Error(error.message || 'Error durante la autenticación con Google Gmail.');
  }
}

/**
 * Helper to encode email message into RFC2822 base64url format
 */
function buildBase64UrlEmail(to: string, subject: string, body: string): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ];
  const emailString = emailLines.join('\r\n');

  return btoa(unescape(encodeURIComponent(emailString)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email directly using the official Gmail REST API
 */
export async function sendGmailMessage(
  toEmail: string,
  subject: string,
  body: string,
  customToken?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  let token = customToken || gmailAccessTokenCache;

  // If no token cached, attempt to request authorization
  if (!token) {
    try {
      token = await authorizeAdminGmail();
    } catch (err: any) {
      return { success: false, error: err.message || 'Se requiere autorización de Gmail para el Administrador.' };
    }
  }

  const rawBase64 = buildBase64UrlEmail(toEmail, subject, body);

  try {
    const response = await fetch('https://gmail.googleapis.com/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: rawBase64,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      // If token expired (401), clear cache
      if (response.status === 401) {
        gmailAccessTokenCache = null;
      }
      throw new Error(errData?.error?.message || `Error Gmail API HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error: any) {
    console.error('Error al enviar correo por Gmail API:', error);
    return { success: false, error: error.message || 'Error al conectar con la API de Gmail.' };
  }
}
