module.exports = {
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  credentials: {
    email: process.env.SA_EMAIL || "super@admin.com",
    password: process.env.SA_PASSWORD || "admin123",
  },
};
