import { env } from "~/env";

// Color palette matching frontend design
const colors = {
  primary: "#b35a32", // Terracotta - hsl(18 60% 45%)
  primaryLight: "#d4896a", // Lighter terracotta
  secondary: "#c2d4a8", // Sage - hsl(85 25% 75%)
  accent: "#d9b84a", // Golden - hsl(45 70% 60%)
  background: "#f7f3ee", // Warm cream - hsl(35 30% 96%)
  cardBg: "#f0ebe3", // Light cream - hsl(35 25% 92%)
  foreground: "#3d3329", // Dark warm brown - hsl(25 20% 20%)
  muted: "#7a6b5a", // Medium brown - hsl(25 15% 45%)
  border: "#ddd4c7", // Soft beige - hsl(30 20% 82%)
};

// Base email layout wrapper
function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${env.EVENT_NAME}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Georgia, serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: 'Source Sans Pro', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${colors.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Header component with event branding
function emailHeader(): string {
  return `
  <!-- Header -->
  <tr>
    <td align="center" style="padding-bottom: 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 36px; font-weight: 700; color: ${colors.primary}; letter-spacing: 1px;">
              ${env.EVENT_NAME}
            </h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: ${colors.muted}; letter-spacing: 2px; text-transform: uppercase;">
              Música · Arte · Comunidad
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// Main card container
function emailCard(content: string): string {
  return `
  <!-- Main Card -->
  <tr>
    <td>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 16px; border: 1px solid ${colors.border}; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <tr>
          <td style="padding: 40px;">
            ${content}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// CTA Button component
function emailButton(text: string, url: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 32px 0 16px 0;">
        <a href="${url}" target="_blank" style="display: inline-block; background-color: ${colors.primary}; color: #ffffff; font-family: 'Source Sans Pro', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 14px rgba(179, 90, 50, 0.3);">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

// Footer component
function emailFooter(): string {
  return `
  <!-- Footer -->
  <tr>
    <td align="center" style="padding-top: 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <p style="margin: 0; font-size: 13px; color: ${colors.muted}; line-height: 1.6;">
              Este correo fue enviado por ${env.EVENT_NAME}.<br>
              Si tienes preguntas, responde a este correo.
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${colors.border};">
              <p style="margin: 0; font-size: 12px; color: ${colors.muted};">
                © ${new Date().getFullYear()} ${env.EVENT_NAME}. Todos los derechos reservados.
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// Divider component
function emailDivider(): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 24px 0;">
        <div style="height: 1px; background: linear-gradient(to right, transparent, ${colors.border}, transparent);"></div>
      </td>
    </tr>
  </table>`;
}

// Icon circle component (for visual interest)
function emailIconCircle(emoji: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding-bottom: 24px;">
        <div style="width: 64px; height: 64px; background-color: ${colors.cardBg}; border-radius: 50%; line-height: 64px; font-size: 28px;">
          ${emoji}
        </div>
      </td>
    </tr>
  </table>`;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export function blankTicketEmailTemplate(options: {
  completeTicketUrl: string;
}): { html: string; text: string } {
  const html = emailLayout(`
    ${emailHeader()}
    ${emailCard(`
      ${emailIconCircle("🎫")}

      <h2 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: ${colors.foreground}; text-align: center;">
        ¡Tu entrada está casi lista!
      </h2>

      <p style="margin: 0 0 8px 0; font-size: 16px; color: ${colors.muted}; text-align: center; line-height: 1.6;">
        Has recibido una entrada para <strong style="color: ${colors.foreground};">${env.EVENT_NAME}</strong>.
      </p>

      <p style="margin: 0; font-size: 16px; color: ${colors.muted}; text-align: center; line-height: 1.6;">
        Para generar tu ticket de acceso, necesitamos que completes tus datos personales.
      </p>

      ${emailButton("Completar mis datos", options.completeTicketUrl)}

      ${emailDivider()}

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="background-color: ${colors.cardBg}; border-radius: 12px; padding: 20px;">
            <p style="margin: 0; font-size: 14px; color: ${colors.muted}; text-align: center; line-height: 1.6;">
              <strong style="color: ${colors.foreground};">¿Problemas con el botón?</strong><br>
              Copia y pega este enlace en tu navegador:<br>
              <a href="${options.completeTicketUrl}" style="color: ${colors.primary}; word-break: break-all; font-size: 13px;">
                ${options.completeTicketUrl}
              </a>
            </p>
          </td>
        </tr>
      </table>
    `)}
    ${emailFooter()}
  `);

  const text = `¡Tu entrada está casi lista!

Has recibido una entrada para ${env.EVENT_NAME}.

Para generar tu ticket de acceso, necesitamos que completes tus datos personales.

Completa tus datos aquí: ${options.completeTicketUrl}

---
Este correo fue enviado por ${env.EVENT_NAME}.
Si tienes preguntas, responde a este correo.`;

  return { html, text };
}

export function ticketQREmailTemplate(options: {
  qrCodeDataUrl: string;
  attendeeName: string;
}): { html: string; text: string } {
  const html = emailLayout(`
    ${emailHeader()}
    ${emailCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%); padding: 4px; border-radius: 16px;">
              <div style="background-color: #ffffff; padding: 12px 24px; border-radius: 12px;">
                <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 2px;">
                  Entrada Confirmada
                </span>
              </div>
            </div>
          </td>
        </tr>
      </table>

      <h2 style="margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: ${colors.foreground}; text-align: center;">
        ¡Nos vemos pronto, ${options.attendeeName}!
      </h2>

      <p style="margin: 0 0 32px 0; font-size: 16px; color: ${colors.muted}; text-align: center; line-height: 1.6;">
        Tu entrada para <strong style="color: ${colors.foreground};">${env.EVENT_NAME}</strong> está lista.
      </p>

      <!-- QR Code Section -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <div style="background-color: #ffffff; border: 2px solid ${colors.border}; border-radius: 20px; padding: 24px; display: inline-block; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);">
              <img src="${options.qrCodeDataUrl}" alt="Código QR de entrada" style="width: 200px; height: 200px; display: block;" />
            </div>
          </td>
        </tr>
      </table>

      <p style="margin: 24px 0 0 0; font-size: 14px; color: ${colors.muted}; text-align: center; line-height: 1.6;">
        Presenta este código QR en la entrada del evento
      </p>

      ${emailDivider()}

      <!-- Tips Section -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="background-color: ${colors.cardBg}; border-radius: 12px; padding: 24px;">
            <h3 style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; font-weight: 700; color: ${colors.foreground}; text-align: center;">
              📋 Recuerda
            </h3>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding: 8px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 28px; vertical-align: top;">
                        <span style="color: ${colors.primary}; font-size: 16px;">✓</span>
                      </td>
                      <td style="font-size: 14px; color: ${colors.muted}; line-height: 1.5;">
                        Guarda este correo o haz una captura de pantalla del QR
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 28px; vertical-align: top;">
                        <span style="color: ${colors.primary}; font-size: 16px;">✓</span>
                      </td>
                      <td style="font-size: 14px; color: ${colors.muted}; line-height: 1.5;">
                        Lleva un documento de identidad
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 28px; vertical-align: top;">
                        <span style="color: ${colors.primary}; font-size: 16px;">✓</span>
                      </td>
                      <td style="font-size: 14px; color: ${colors.muted}; line-height: 1.5;">
                        Llega con tiempo para evitar filas
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `)}
    ${emailFooter()}
  `);

  const text = `¡Nos vemos pronto, ${options.attendeeName}!

Tu entrada para ${env.EVENT_NAME} está lista.

Presenta el código QR adjunto en la entrada del evento.

Recuerda:
- Guarda este correo o haz una captura de pantalla del QR
- Lleva un documento de identidad
- Llega con tiempo para evitar filas

---
Este correo fue enviado por ${env.EVENT_NAME}.
Si tienes preguntas, responde a este correo.`;

  return { html, text };
}
