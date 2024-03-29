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
                    900: '#e93296',
                    800: '#e61989',
                    700: '#e4007c',
                    600: '#cd006f',
                    500: '#b60063',
                    400: '#9f0056',
                    300: '#88004a',
                    200: '#72003e',
                    100: '#5b0031',
                    50:  '#440025',
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
