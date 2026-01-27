# Page snapshot

```yaml
- generic [ref=e1]:
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
            - text: guard@test.com
        - generic [ref=e13]:
          - generic [ref=e14]: Contraseña
          - textbox "Contraseña" [ref=e15]: testpassword
      - paragraph [ref=e16]: Invalid email or password
      - button "Entrar" [active] [ref=e17] [cursor=pointer]:
        - generic [ref=e18]: Entrar
  - region "Notifications (F8)":
    - list
  - generic [ref=e23] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e24]:
      - img [ref=e25]
    - generic [ref=e28]:
      - button "Open issues overlay" [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e31]: "1"
          - generic [ref=e32]: "2"
        - generic [ref=e33]:
          - text: Issue
          - generic [ref=e34]: s
      - button "Collapse issues badge" [ref=e35]:
        - img [ref=e36]
  - alert [ref=e38]
```