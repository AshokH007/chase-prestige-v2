/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                // Custom banking palette if needed, but slate is good
                primary: '#0f172a', // Slate 900
                secondary: '#64748b', // Slate 500
                accent: '#2563eb', // Blue 600
                background: '#f8fafc', // Slate 50
                surface: '#ffffff',
            }
        },
    },
    plugins: [],
}
