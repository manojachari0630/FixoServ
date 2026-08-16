import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        services: resolve(__dirname, "services.html"),
        booking: resolve(__dirname, "booking.html"),
        contact: resolve(__dirname, "contact.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        myBookings: resolve(__dirname, "my-bookings.html"),
      },
    },
  },
});