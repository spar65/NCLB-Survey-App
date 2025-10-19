# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e5]:
        - link "Survey Admin" [ref=e6]:
          - /url: /admin/dashboard
          - img [ref=e7]
          - generic [ref=e9]: Survey Admin
        - tablist [ref=e11]:
          - tab "Dashboard" [selected] [ref=e12]
          - tab "Invites" [ref=e13]
          - tab "Versions" [ref=e14]
          - tab "Responses" [ref=e15]
    - generic [ref=e17]:
      - generic [ref=e18]:
        - img [ref=e20]
        - generic [ref=e22]: Admin Login
        - generic [ref=e23]: Access the survey administration dashboard
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]: Email Address
            - textbox "Email Address" [ref=e28]:
              - /placeholder: admin@example.com
          - generic [ref=e29]:
            - generic [ref=e30]: Password
            - textbox "Password" [ref=e31]:
              - /placeholder: Enter your password
          - button "Sign In" [disabled]
        - paragraph [ref=e33]: "Default credentials: admin@example.com / admin123"
  - button "Open Next.js Dev Tools" [ref=e39] [cursor=pointer]:
    - img [ref=e40]
  - alert [ref=e45]
```