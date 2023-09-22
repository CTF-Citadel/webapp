/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	mode: "jit",
	content: [
        './src/**/*.{html,js,svelte,ts}',
        './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
        './node_modules/flowbite-svelte-icons/**/*.{html,js,svelte,ts}'
    ],
	theme: {
		extend: {},
	},
	plugins: [
		('flowbite/plugin')
	],
}
