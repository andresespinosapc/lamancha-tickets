# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: ¡Hola!
      - generic [ref=e6]: Ingresa tus credenciales.
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Correo electrónico
          - textbox "Correo electrónico" [ref=e12]:
            - /placeholder: tu@email.com
        - generic [ref=e13]:
          - generic [ref=e14]: Contraseña
          - textbox "Contraseña" [ref=e15]
      - button "Entrar" [ref=e16] [cursor=pointer]:
        - generic [ref=e17]: Entrar
  - region "Notifications (F8)":
    - list
  - button "Open Next.js Dev Tools" [ref=e23] [cursor=pointer]:
    - img [ref=e24]
```