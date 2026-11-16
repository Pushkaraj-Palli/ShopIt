# 🛍️ ShopIt – Full-Stack E-commerce Platform

**ShopIt** is a sleek, responsive e-commerce web application built with modern technologies. It offers a seamless shopping experience with features like authentication, product browsing, cart management, wishlist functionality, and secure checkout.

---

## 🚀 Features

- **User Authentication**: Secure login and registration system.
- **Product Management**: Browse, search, and filter products.
- **Shopping Cart**: Add, remove, and manage items in the cart.
- **Wishlist**: Save your favorite products to a wishlist for later.

- **Responsive Design**: Optimized for all devices.
- **Animations**: Smooth transitions using Framer Motion.


---
## 🔗 Live Demo

👉 [View Deployed App](https://shop-it-flax.vercel.app/)


---

## 🖼️ Project Screenshots

<img src="https://github.com/user-attachments/assets/e8f442a3-df3d-4a10-87fd-2f825bcf45f4" alt="Home Page" width="100%"/>
<br/>
<img src="https://github.com/user-attachments/assets/7dd58dcb-014b-49da-b0e2-30e34164ca1b" alt="Product Page" width="100%"/>
<br/>
<img src="https://github.com/user-attachments/assets/94f3ed89-c0f9-4b45-98d7-e8172643d43e" alt="Product Detail" width="100%"/>
<br/>
<img src="https://github.com/user-attachments/assets/189d4679-fd87-4d31-bec0-1c72710e2ee4" alt="Cart and Checkout" width="100%"/>

---

## 🛠️ Tech Stack

### ✅ Frontend

- [Next.js](https://nextjs.org/) – React framework for server-side rendering.
- [React](https://reactjs.org/) – JavaScript library for building user interfaces.
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework.
- [Radix UI](https://www.radix-ui.com/) – Primitives for building accessible UI components.
- [Framer Motion](https://www.framer.com/motion/) – Animation library for React.
- [React Hook Form](https://react-hook-form.com/) – Form validation and management.
- [Zod](https://zod.dev/) – TypeScript-first schema declaration and validation.

### ✅ Backend

- [Express.js](https://expressjs.com/) – Web framework for Node.js.
- [MongoDB](https://www.mongodb.com/) – NoSQL database.
- [Mongoose](https://mongoosejs.com/) – ODM for MongoDB.
- [JWT](https://jwt.io/) – JSON Web Tokens for authentication.
- [Stripe](https://stripe.com/) – Payment processing platform.
- [dotenv](https://www.npmjs.com/package/dotenv) – Environment variable management.

### ✅ Dev Tools

- [TypeScript](https://www.typescriptlang.org/) – Typed superset of JavaScript.
- [ESLint](https://eslint.org/) – Linting utility for JavaScript and TypeScript.
- [Prettier](https://prettier.io/) – Code formatter.
- [Concurrently](https://www.npmjs.com/package/concurrently) – Run multiple commands concurrently.

---

## 📦 Adding Your Own Products

To add, edit, or remove products:

1. Open the file:

```
scripts/seed.js
```

2. Modify the product data as needed.

3. Run the seed script to update the database:

```bash
node scripts/seed.js
```

> ⚠️ Ensure MongoDB is connected and your `.env` file is configured correctly before running the script.

---

## 🏪 Seller onboarding and admin setup

Public registration creates customer accounts only. Customers can apply from **Become a seller** in the account menu. Applications are reviewed by an admin at `/admin/retailers`; approval changes the account role to `retailer`, while rejection includes a reason and allows resubmission.

To create the first admin account:

1. Copy `.env.example` to `.env.local` and configure `MONGODB_URI`, `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters.
2. Run `npm run seed:admin`. A new admin is created, or the configured existing account is granted admin access without changing its password.
3. Start the app with `npm run dev`, then sign in at `/account/login` and open **Seller applications** from the account menu.

The seed command only creates or updates the configured admin account; it does not reset the database.

---

## 🧪 Automation Testing with Selenium

ShopIt includes an automated end-to-end Selenium test suite built with TypeScript, Mocha, Chai, and Selenium WebDriver following the **Page Object Model (POM)** architecture.

### Test Structure
```
tests/e2e/
  ├── config/        # Environment config & Selenium WebDriver factory
  ├── pages/         # Page Objects (BasePage, LoginPage, RegisterPage, CartPage, etc.)
  ├── helpers/       # DB seeding, auth injection, and test data utilities
  └── specs/         # E2E test specifications (smoke, auth, rbac, catalogue, retailer, admin)
```

### Running Tests Locally

1. **Seed Test Database:**
   ```bash
   npm run e2e:seed
   ```
   *Note: Fails fast if the target database name does not contain `test`.*

2. **Run Smoke Suite (< 2 minutes):**
   ```bash
   npm run test:e2e:smoke
   ```

3. **Run Full E2E Suite:**
   ```bash
   npm run test:e2e
   ```

4. **Run in Headed Mode (see the browser in action):**
   ```bash
   npm run test:e2e:headed
   ```

### CI / Headless Execution

In CI (e.g. GitHub Actions), tests run in headless Chrome:
```bash
npm run e2e:seed
npm run test:e2e:smoke
```
Screenshots on test failure are saved to `reports/screenshots/` and HTML reports are written to `mochawesome-report/`.

---

## ⚙️ Scripts

- `npm run dev` – Start the Next.js development server.
- `npm run dev:full` – Run both frontend and backend concurrently.
- `npm run build` – Build the Next.js application.
- `npm run start` – Start the production server.
- `npm run lint` – Run ESLint for code linting.
- `npm run test:e2e` – Run full Selenium E2E test suite.
- `npm run test:e2e:smoke` – Run fast E2E smoke tests.
- `npm run test:e2e:headed` – Run E2E tests with visible Chrome browser.
- `npm run e2e:seed` – Seed test database with fixture data.

---

## 🙌 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to fork the repository and submit a pull request.

---

## 📬 Feedback & Support

If you have any suggestions, bugs to report, or ideas to improve this project, please [open an issue](https://github.com/Pushkaraj-Palli/ShopIt/issues) or contact me directly.

---

## ✅ Final Words

**ShopIt** is built with scalability and modern best practices in mind. Whether you're here to explore, learn, or contribute, I hope you find value in this project. Thank you for visiting, and happy coding! 🚀
