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
            backgroundImage: {
                'gradient-dark': "linear-gradient(260deg, #440025, transparent 10%), linear-gradient(80deg, #440025, transparent 10%);",
                'gradient-light': "linear-gradient(260deg, #ff82cf, transparent 10%), linear-gradient(80deg, #ff82cf, transparent 10%);",
            },
            colors: {
                primary: {
                    50: '#e93296',
                    100: '#e61989',
                    200: '#e4007c',
                    300: '#cd006f',
                    400: '#b60063',
                    500: '#9f0056',
                    600: '#88004a',
                    700: '#72003e',
                    800: '#5b0031',
                    900: '#440025',
                }
            },
            spacing: {
				"9/10": "90%",
				"8/10": "80%",
				"7/10": "70%",
				"6/10": "60%",
				"5/10": "50%",
				"4/10": "40%",
                "3/10": "30%",
                "2/10": "20%",
                "1/10": "10%",
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
			},
            width: {
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
