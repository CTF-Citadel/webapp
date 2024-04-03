import type { WrapperFormat } from './backend';

export async function requestWrapper(privileged: boolean, request: WrapperFormat): Promise<Response> {
    const DEST = privileged ? '/admin' : '/user';
    return await fetch(`/api/v1${DEST}`, {
        method: 'POST',
        body: JSON.stringify(request)
    });
}

// generator
export function generateRandomString(length: number) {
    return Array.from(crypto.getRandomValues(new Uint8Array(Math.ceil(length / 2))), (b) =>
        ('0' + (b & 0xff).toString(16)).slice(-2)
    ).join('');
}

// expiration check
export function isWithinExpiration(expiryUnixEpoch: number) {
    return Date.now() < expiryUnixEpoch ? true : false;
}

export function validAlphanumeric(input: string, length: number, spaceless: boolean = false): boolean {
    return spaceless
        ? /^[a-zA-Z0-9]*$/.test(input) && input.length <= length
        : /^[a-zA-Z0-9\s]*$/.test(input) && input.length <= length;
}

export function validJoinToken(input: string): boolean {
    return /^CTD-[A-Z0-9]{20,20}$/.test(input);
}

export function validUsername(input: string): boolean {
    return /^[a-zA-Z0-9_]{4,24}$/.test(input);
}

export function validPassword(input: string): boolean {
    if (!/^[a-zA-Z0-9_@$!%*?&#^]+$/.test(input)) return false;
    // min 8 characters, max 96 characters, at least one uppercase letter, one lowercase letter, one number and one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#^]{12,96}$/.test(input);
}

export function validEmail(input: string, enforce: boolean = false, domain: string = ''): boolean {
    if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(input) === true) {
        if (enforce) return input.endsWith(domain);
        return true;
    }
    return false;
}

export const DUMMY_SESSION = {
    id: 'someUser',
    username: 'DEV',
    email: 'some-email',
    user_role: 'admin',
    user_team_id: 'someTeam',
    is_blocked: false,
    is_verified: true
};

export const AVATARS = [
    { value: 'wolf', name: 'Wolf' },
    { value: 'cat', name: 'Cat' },
    { value: 'dog', name: 'Dog' },
    { value: 'mole', name: 'Mole' },
    { value: 'male', name: 'Hacker' },
    { value: 'female', name: 'Hacktress' }
];

export const COUNTRIES = [
    { value: 'AF', name: 'Afghanistan' },
    { value: 'AL', name: 'Albania' },
    { value: 'DZ', name: 'Algeria' },
    { value: 'AD', name: 'Andorra' },
    { value: 'AO', name: 'Angola' },
    { value: 'AG', name: 'Antigua and Barbuda' },
    { value: 'AR', name: 'Argentina' },
    { value: 'AM', name: 'Armenia' },
    { value: 'AU', name: 'Australia' },
    { value: 'AT', name: 'Austria' },
    { value: 'AZ', name: 'Azerbaijan' },
    { value: 'BS', name: 'Bahamas' },
    { value: 'BH', name: 'Bahrain' },
    { value: 'BD', name: 'Bangladesh' },
    { value: 'BB', name: 'Barbados' },
    { value: 'BY', name: 'Belarus' },
    { value: 'BE', name: 'Belgium' },
    { value: 'BZ', name: 'Belize' },
    { value: 'BJ', name: 'Benin' },
    { value: 'BT', name: 'Bhutan' },
    { value: 'BO', name: 'Bolivia' },
    { value: 'BA', name: 'Bosnia and Herzegovina' },
    { value: 'BW', name: 'Botswana' },
    { value: 'BR', name: 'Brazil' },
    { value: 'BN', name: 'Brunei' },
    { value: 'BG', name: 'Bulgaria' },
    { value: 'BF', name: 'Burkina Faso' },
    { value: 'BI', name: 'Burundi' },
    { value: 'CV', name: 'Cabo Verde' },
    { value: 'KH', name: 'Cambodia' },
    { value: 'CM', name: 'Cameroon' },
    { value: 'CA', name: 'Canada' },
    { value: 'CF', name: 'Central African Republic' },
    { value: 'TD', name: 'Chad' },
    { value: 'CL', name: 'Chile' },
    { value: 'CN', name: 'China' },
    { value: 'CO', name: 'Colombia' },
    { value: 'KM', name: 'Comoros' },
    { value: 'CG', name: 'Congo' },
    { value: 'CR', name: 'Costa Rica' },
    { value: 'HR', name: 'Croatia' },
    { value: 'CU', name: 'Cuba' },
    { value: 'CY', name: 'Cyprus' },
    { value: 'CZ', name: 'Czech Republic' },
    { value: 'DK', name: 'Denmark' },
    { value: 'DJ', name: 'Djibouti' },
    { value: 'DM', name: 'Dominica' },
    { value: 'DO', name: 'Dominican Republic' },
    { value: 'EC', name: 'Ecuador' },
    { value: 'EG', name: 'Egypt' },
    { value: 'SV', name: 'El Salvador' },
    { value: 'GQ', name: 'Equatorial Guinea' },
    { value: 'ER', name: 'Eritrea' },
    { value: 'EE', name: 'Estonia' },
    { value: 'ET', name: 'Ethiopia' },
    { value: 'FJ', name: 'Fiji' },
    { value: 'FI', name: 'Finland' },
    { value: 'FR', name: 'France' },
    { value: 'GA', name: 'Gabon' },
    { value: 'GM', name: 'Gambia' },
    { value: 'GE', name: 'Georgia' },
    { value: 'DE', name: 'Germany' },
    { value: 'GH', name: 'Ghana' },
    { value: 'GR', name: 'Greece' },
    { value: 'GD', name: 'Grenada' },
    { value: 'GT', name: 'Guatemala' },
    { value: 'GN', name: 'Guinea' },
    { value: 'GW', name: 'Guinea-Bissau' },
    { value: 'GY', name: 'Guyana' },
    { value: 'HT', name: 'Haiti' },
    { value: 'HN', name: 'Honduras' },
    { value: 'HU', name: 'Hungary' },
    { value: 'IS', name: 'Iceland' },
    { value: 'IN', name: 'India' },
    { value: 'ID', name: 'Indonesia' },
    { value: 'IR', name: 'Iran' },
    { value: 'IQ', name: 'Iraq' },
    { value: 'IE', name: 'Ireland' },
    { value: 'IL', name: 'Israel' },
    { value: 'IT', name: 'Italy' },
    { value: 'CI', name: 'Ivory Coast' },
    { value: 'JM', name: 'Jamaica' },
    { value: 'JP', name: 'Japan' },
    { value: 'JO', name: 'Jordan' },
    { value: 'KZ', name: 'Kazakhstan' },
    { value: 'KE', name: 'Kenya' },
    { value: 'KI', name: 'Kiribati' },
    { value: 'KW', name: 'Kuwait' },
    { value: 'KG', name: 'Kyrgyzstan' },
    { value: 'LA', name: 'Laos' },
    { value: 'LV', name: 'Latvia' },
    { value: 'LB', name: 'Lebanon' },
    { value: 'LS', name: 'Lesotho' },
    { value: 'LR', name: 'Liberia' },
    { value: 'LY', name: 'Libya' },
    { value: 'LI', name: 'Liechtenstein' },
    { value: 'LT', name: 'Lithuania' },
    { value: 'LU', name: 'Luxembourg' },
    { value: 'MK', name: 'North Macedonia' },
    { value: 'MG', name: 'Madagascar' },
    { value: 'MW', name: 'Malawi' },
    { value: 'MY', name: 'Malaysia' },
    { value: 'MV', name: 'Maldives' },
    { value: 'ML', name: 'Mali' },
    { value: 'MT', name: 'Malta' },
    { value: 'MH', name: 'Marshall Islands' },
    { value: 'MR', name: 'Mauritania' },
    { value: 'MU', name: 'Mauritius' },
    { value: 'MX', name: 'Mexico' },
    { value: 'FM', name: 'Micronesia' },
    { value: 'MD', name: 'Moldova' },
    { value: 'MC', name: 'Monaco' },
    { value: 'MN', name: 'Mongolia' },
    { value: 'ME', name: 'Montenegro' },
    { value: 'MA', name: 'Morocco' },
    { value: 'MZ', name: 'Mozambique' },
    { value: 'MM', name: 'Myanmar' },
    { value: 'NA', name: 'Namibia' },
    { value: 'NR', name: 'Nauru' },
    { value: 'NP', name: 'Nepal' },
    { value: 'NL', name: 'Netherlands' },
    { value: 'NZ', name: 'New Zealand' },
    { value: 'NI', name: 'Nicaragua' },
    { value: 'NE', name: 'Niger' },
    { value: 'NG', name: 'Nigeria' },
    { value: 'KP', name: 'North Korea' },
    { value: 'NO', name: 'Norway' },
    { value: 'OM', name: 'Oman' },
    { value: 'PK', name: 'Pakistan' },
    { value: 'PS', name: 'Palestine' },
    { value: 'PA', name: 'Panama' },
    { value: 'PG', name: 'Papua New Guinea' },
    { value: 'PY', name: 'Paraguay' },
    { value: 'PE', name: 'Peru' },
    { value: 'PH', name: 'Philippines' },
    { value: 'PL', name: 'Poland' },
    { value: 'PT', name: 'Portugal' },
    { value: 'QA', name: 'Qatar' },
    { value: 'RO', name: 'Romania' },
    { value: 'RU', name: 'Russia' },
    { value: 'RW', name: 'Rwanda' },
    { value: 'KN', name: 'Saint Kitts and Nevis' },
    { value: 'LC', name: 'Saint Lucia' },
    { value: 'VC', name: 'Saint Vincent and the Grenadines' },
    { value: 'WS', name: 'Samoa' },
    { value: 'SM', name: 'San Marino' },
    { value: 'ST', name: 'Sao Tome and Principe' },
    { value: 'SA', name: 'Saudi Arabia' },
    { value: 'SN', name: 'Senegal' },
    { value: 'RS', name: 'Serbia' },
    { value: 'SC', name: 'Seychelles' },
    { value: 'SL', name: 'Sierra Leone' },
    { value: 'SG', name: 'Singapore' },
    { value: 'SK', name: 'Slovakia' },
    { value: 'SI', name: 'Slovenia' },
    { value: 'SB', name: 'Solomon Islands' },
    { value: 'SO', name: 'Somalia' },
    { value: 'ZA', name: 'South Africa' },
    { value: 'KR', name: 'South Korea' },
    { value: 'SS', name: 'South Sudan' },
    { value: 'ES', name: 'Spain' },
    { value: 'LK', name: 'Sri Lanka' },
    { value: 'SD', name: 'Sudan' },
    { value: 'SR', name: 'Suriname' },
    { value: 'SZ', name: 'Eswatini' },
    { value: 'SE', name: 'Sweden' },
    { value: 'CH', name: 'Switzerland' },
    { value: 'SY', name: 'Syria' },
    { value: 'TW', name: 'Taiwan' },
    { value: 'TJ', name: 'Tajikistan' },
    { value: 'TZ', name: 'Tanzania' },
    { value: 'TH', name: 'Thailand' },
    { value: 'TL', name: 'Timor-Leste' },
    { value: 'TG', name: 'Togo' },
    { value: 'TO', name: 'Tonga' },
    { value: 'TT', name: 'Trinidad and Tobago' },
    { value: 'TN', name: 'Tunisia' },
    { value: 'TR', name: 'Turkey' },
    { value: 'TM', name: 'Turkmenistan' },
    { value: 'TV', name: 'Tuvalu' },
    { value: 'UG', name: 'Uganda' },
    { value: 'UA', name: 'Ukraine' },
    { value: 'AE', name: 'United Arab Emirates' },
    { value: 'GB', name: 'United Kingdom' },
    { value: 'US', name: 'United States' },
    { value: 'UY', name: 'Uruguay' },
    { value: 'UZ', name: 'Uzbekistan' },
    { value: 'VU', name: 'Vanuatu' },
    { value: 'VA', name: 'Vatican City' },
    { value: 'VE', name: 'Venezuela' },
    { value: 'VN', name: 'Vietnam' },
    { value: 'YE', name: 'Yemen' },
    { value: 'ZM', name: 'Zambia' },
    { value: 'ZW', name: 'Zimbabwe' }
];
