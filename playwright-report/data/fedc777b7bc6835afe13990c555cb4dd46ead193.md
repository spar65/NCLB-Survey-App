# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e5]:
        - link "Survey Admin" [ref=e6] [cursor=pointer]:
          - /url: /admin/dashboard
          - img [ref=e7]
          - generic [ref=e12]: Survey Admin
        - tablist [ref=e14]:
          - tab "Dashboard" [selected] [ref=e15] [cursor=pointer]
          - tab "Invites" [ref=e16] [cursor=pointer]
          - tab "Versions" [ref=e17] [cursor=pointer]
          - tab "Responses" [ref=e18] [cursor=pointer]
    - generic [ref=e20]:
      - generic [ref=e21]:
        - img [ref=e23]
        - generic [ref=e25]: Admin Login
        - generic [ref=e26]: Access the survey administration dashboard
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic [ref=e30]: Email Address
            - textbox "Email Address" [ref=e31]:
              - /placeholder: admin@example.com
          - generic [ref=e32]:
            - generic [ref=e33]: Password
            - textbox "Password" [ref=e34]:
              - /placeholder: Enter your password
          - button "Sign In" [disabled]
        - paragraph [ref=e36]: "Default credentials: admin@example.com / admin123"
  - button "Open Next.js Dev Tools" [ref=e42] [cursor=pointer]:
    - img [ref=e43]
  - alert [ref=e47]
```