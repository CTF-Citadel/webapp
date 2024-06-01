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
                'gradient-dark': "linear-gradient(260deg, #022048, transparent 10%), linear-gradient(80deg, #022048, transparent 10%);",
                'gradient-light': "linear-gradient(260deg, #0447a3, transparent 10%), linear-gradient(80deg, #0447a3, transparent 10%);",
            },
            colors: {
                primary: {
                    50: '#044fb5',
                    100: '#0447a3',
                    200: '#033f91',
                    300: '#03377f',
                    400: '#022f6d',
                    500: '#02285b',
                    600: '#022048',
                    700: '#011836',
                    800: '#011024',
                    900: '#000812',
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
