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

## 🛠️ Tech Stack

### ✅ Frontend

- [Next.js](https://nextjs.org/) – React framework for server-side rendering.
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

## ⚙️ Scripts

- `npm run dev` – Start the Next.js development server.
- `npm run dev:full` – Run both frontend and backend concurrently.
- `npm run build` – Build the Next.js application.
- `npm run start` – Start the production server.
- `npm run lint` – Run ESLint for code linting.

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
