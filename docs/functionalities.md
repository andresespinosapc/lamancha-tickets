# 🎫 Sistema de Gestión de Tickets - Funcionalidades y Casos de Uso

## Descripción General

Lamancha Tickets es un sistema de gestión de tickets para eventos que permite a organizadores y vendedores generar, vender y validar tickets de manera eficiente. El sistema maneja dos tipos de tickets: completos (con todos los datos del asistente) y "en blanco" (pendientes de completar información).

---

## 👥 Roles y Permisos

### **Admin**
- Control total del sistema
- Puede generar tickets completos y en blanco
- Puede validar tickets escaneando QR codes
- Puede ver todos los tickets del sistema

### **Seller (Vendedor)**
- Puede generar tickets en blanco para sus ventas
- Puede ver y gestionar sus propios tickets vendidos
- Puede reenviar emails a compradores
- Tiene información de contacto configurada (Instagram, teléfono, email)

### **User (Usuario Regular)**
- Solo puede acceder a la página pública para comprar tickets
- No tiene acceso al panel de administración

### **Público (Sin autenticación)**
- Puede ver tipos de tickets disponibles
- Puede completar tickets en blanco que recibió por email
- Puede comprar tickets desde la home

---

## 📋 Casos de Uso Detallados

### 1. 🛒 Compra de Tickets desde la Home (Público)

**Actor:** Cliente (no autenticado)

**Ruta:** `/` (página principal)

**Flujo:**
1. El cliente accede a la página principal del evento
2. Ve la lista de tipos de tickets disponibles con precios:
   - Early Bird: $5,000 (1 persona)
   - General: $8,000 (1 persona)
   - VIP: $15,000 (1 persona)
   - Pareja: $14,000 (2 personas)
   - Grupo: $25,000 (4 personas)
3. Ve los métodos de pago/contacto del organizador (Instagram, teléfono, email)
4. Selecciona la cantidad de tickets que desea de cada tipo
5. Completa el formulario con sus datos:
   - Nombre
   - Apellido
   - Email
   - RUT/Documento de identidad
   - Teléfono (opcional)
6. Envía el formulario
7. El sistema genera los tickets inmediatamente con:
   - Código de redención encriptado
   - Código QR conteniendo el código de redención
8. El cliente recibe un email con su QR para entrar al evento

**Notas:**
- El pago ocurre fuera del sistema (transferencia bancaria, efectivo, etc.)
- El sistema genera tickets "completos" instantáneamente
- Solo los administradores pueden usar esta función actualmente

---

### 2. 📝 Generación de Tickets "En Blanco" (Sellers/Admins)

**Actor:** Vendedor o Administrador

**Ruta:** `/admin/generateBlankTicket`

**Problema que resuelve:** El vendedor recibe el pago pero el comprador no tiene tiempo para dar sus datos completos en ese momento.

**Flujo:**
1. El vendedor inicia sesión en el sistema
2. Navega a "Generar Ticket en Blanco"
3. Ingresa únicamente el **email** del comprador
4. El sistema automáticamente:
   - Crea un registro de ticket en estado "incompleto"
   - Genera un link único con hashid (ej: `/tickets/abc123xyz/complete`)
   - Asocia el ticket al vendedor que lo creó
   - Envía un email al comprador con:
     - Link para completar sus datos
     - Instrucciones
5. El vendedor confirma al comprador que recibirá un email

**Resultado:**
- Ticket creado sin `redemptionCode` (null)
- Email enviado al comprador
- Ticket visible en la lista del vendedor como "Pendiente"

---

### 3. ✅ Completar Ticket en Blanco (Público)

**Actor:** Comprador (no autenticado)

**Ruta:** `/tickets/[ticketHashid]/complete`

**Flujo:**
1. El comprador recibe el email con el link único
2. Hace clic en el link
3. El sistema verifica:
   - Que el hashid sea válido
   - Que el ticket no esté ya completado
4. El comprador completa el formulario:
   - Nombre
   - Apellido
   - RUT/Documento de identidad
   - Teléfono (opcional)
5. Envía el formulario
6. El sistema:
   - Actualiza el registro del ticket con los datos completos
   - Genera el **código de redención encriptado** (contiene: ID del ticket, nombre, apellido, email, RUT, teléfono)
   - Genera el **código QR** con el código de redención
   - Envía un email al comprador con el QR code
7. El comprador recibe su ticket completo con QR para el evento

**Validaciones:**
- El link solo funciona una vez (el ticket pasa de incompleto a completo)
- No se puede volver a editar una vez completado

---

### 4. 📊 Gestión de Tickets del Vendedor (Sellers/Admins)

**Actor:** Vendedor o Administrador

**Ruta:** `/admin` (página principal del panel)

**Flujo:**
1. El vendedor inicia sesión
2. Ve una tabla con todos los tickets que ha generado
3. La tabla muestra:
   - **Email:** Email del comprador
   - **Nombre:** Nombre completo (si está completado) o "Pendiente"
   - **Tipo de Ticket:** Tipo y precio
   - **Estado:** "Completo" o "Pendiente de completar"
   - **Acciones:** Botón "Reenviar email" para tickets pendientes
4. Puede ordenar y filtrar tickets
5. Si un comprador perdió el email, el vendedor puede reenviarlo

**Funcionalidad de Reenvío:**
- Click en "Reenviar email"
- El sistema envía nuevamente el link para completar datos
- Útil cuando el email se perdió en spam o fue eliminado

---

### 5. 🔍 Validación de Tickets en el Evento (Admins)

**Actor:** Staff del evento (Admin)

**Ruta:** `/admin/readQR`

**Contexto:** Entrada al evento, validando tickets de los asistentes

**Flujo:**
1. Staff abre la página de lectura de QR
2. El sistema solicita permiso para usar la cámara
3. El asistente muestra su código QR (desde email o teléfono)
4. Staff escanea el código QR con la cámara
5. El sistema:
   - Captura el código de redención del QR
   - **Desencripta** el código usando la clave privada
   - Valida que el formato sea correcto
6. Muestra en pantalla:
   ```
   Nombre: Pedro González
   Apellido: González
   Email: pedro@example.com
   RUT: 12345678-9
   Teléfono: +56911111111
   ```
7. Staff verifica:
   - Que los datos coincidan con la identificación del asistente
   - Que sea un código QR legítimo (si se desencripta correctamente, es válido)
8. Permite o deniega el acceso
9. Puede escanear el siguiente ticket con el botón "Volver a escanear"

**Seguridad:**
- Los códigos QR no pueden ser falsificados (están encriptados con AES)
- Solo el sistema puede desencriptar los códigos
- No se requiere conexión a internet para validar (toda la info está en el QR)

---

## 🔄 Flujos de Negocio Completos

### Escenario A: Venta Directa con Datos Completos

**Situación:** Vendedor y comprador están cara a cara, comprador tiene tiempo

```
1. 💵 Comprador paga al vendedor (efectivo/transferencia)
2. 📝 Vendedor recibe datos completos del comprador
3. 💻 Vendedor genera ticket completo en el sistema
4. 📧 Comprador recibe email con QR inmediatamente
5. ✅ Listo para el evento
```

**Beneficio:** Proceso instantáneo, sin pasos intermedios

---

### Escenario B: Venta Anticipada sin Datos

**Situación:** Vendedor recibe pago pero comprador está apurado y no puede dar datos

```
1. 💵 Comprador paga al vendedor
2. 📱 Vendedor solo pide el email
3. 💻 Vendedor genera ticket "en blanco"
4. 📧 Comprador recibe email con link
5. ⏰ Más tarde, comprador abre link y completa datos
6. 📧 Sistema envía QR automáticamente
7. ✅ Listo para el evento
```

**Beneficio:** No hace esperar al comprador, puede completar datos cuando quiera

---

### Escenario C: Venta por la Web (Home)

**Situación:** Cliente compra por su cuenta desde la web del evento

```
1. 🌐 Cliente entra a la página del evento
2. 👀 Ve tipos de tickets y precios
3. 💳 Realiza pago al organizador (según método indicado)
4. 📝 Completa formulario en la web
5. 📧 Recibe ticket con QR inmediatamente
6. ✅ Listo para el evento
```

**Beneficio:** Auto-servicio, sin intervención del vendedor

---

### Escenario D: Día del Evento

**Situación:** Validación en la entrada

```
1. 👤 Asistente llega a la entrada con QR en su teléfono
2. 📷 Staff escanea el código QR
3. 💻 Sistema desencripta y muestra datos del asistente
4. 🆔 Staff verifica identidad (RUT/carnet)
5. ✅ Permite acceso
6. 🔄 Staff escanea siguiente asistente
```

**Beneficio:** Validación rápida y segura, sin necesidad de internet

---

## 🔐 Seguridad y Protección

### Hashids
- Los IDs de tickets en URLs están ofuscados
- Ejemplo: `/tickets/abc123xyz/complete` en vez de `/tickets/1/complete`
- Previene adivinación de URLs válidas

### Códigos de Redención Encriptados
- El QR contiene datos encriptados con AES-256
- Incluye: ID de ticket, nombre, apellido, email, RUT, teléfono
- Solo el sistema puede desencriptar (usa `REDEMPTION_CODE_PRIVATE_KEY`)
- Imposible falsificar tickets

### Autenticación JWT
- Uso de `jose` (compatible con Next.js 15 RSC)
- Tokens firmados con `JWT_SECRET`
- Cookies HTTP-only
- Expiración de 2 semanas

### Control de Acceso por Roles
- Procedures protegidas por rol en tRPC
- Sellers solo ven sus propios tickets
- Admins tienen acceso total

---

## 📧 Comunicaciones por Email

### Email 1: Ticket en Blanco
**Cuándo:** Al generar un ticket incompleto
**Destinatario:** Comprador
**Contenido:**
- Link único para completar datos
- Instrucciones
- Plazo (si aplica)

### Email 2: Ticket Completo con QR
**Cuándo:** Al completar un ticket o generar uno completo
**Destinatario:** Comprador
**Contenido:**
- Código QR para entrada al evento
- Datos del ticket
- Información del evento
- Instrucciones para el día del evento

---

## 🎯 Ventajas del Sistema

1. **Flexibilidad:** Soporta ventas con o sin datos inmediatos
2. **Seguridad:** Tickets imposibles de falsificar
3. **Simplicidad:** Proceso claro para compradores
4. **Auto-servicio:** Compradores completan sus propios datos
5. **Offline-first:** QR codes funcionan sin internet en la entrada
6. **Multi-vendedor:** Cada vendedor gestiona sus propios tickets
7. **Trazabilidad:** Se sabe quién vendió cada ticket

---

## 🚀 Mejoras Futuras Potenciales

- Integración con pasarelas de pago (MercadoPago, Flow)
- Reportes de ventas por vendedor
- Sistema de comisiones
- Notificaciones push
- App móvil para vendors
- Check-in tracking (marcar asistencia real)
- Estadísticas de evento en tiempo real
- Reventa/transferencia de tickets
- Descarga de QR en PDF
- Multi-evento (actualmente es single-event)
