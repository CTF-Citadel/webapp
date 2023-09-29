/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    mode: 'jit',
    content: [
        './src/**/*.{html,js,svelte,ts}',
        './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
        './node_modules/flowbite-svelte-icons/**/*.{html,js,svelte,ts}'
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#FFF5F2',
                    100: '#FFF1EE',
                    200: '#FFE4DE',
                    300: '#FFD5CC',
                    400: '#FFBCAD',
                    500: '#FE795D',
                    600: '#EF562F',
                    700: '#EB4F27',
                    800: '#CC4522',
                    900: '#A5371B'
                }
            },
			height: {
				"9/10": "90%",
				"8/10": "80%",
				"7/10": "70%",
				"6/10": "60%",
				"5/10": "50%",
				"4/10": "40%",
                "3/10": "30%",
                "2/10": "20%",
                "1/10": "10%",
			}
        }
    },
    plugins: ['flowbite/plugin']
};
