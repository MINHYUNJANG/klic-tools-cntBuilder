const TEMPLATE_DIR = '/templates/';
const DESIGN_BLOCK_MANIFEST = '/templates/design_block/manifest.json';
const DECORATION_MANIFEST = '/templates/common/decoration/manifest.json';
const TEMPLATE_FILE_PATTERN = /\.(html|js)$/i;
const TEMPLATE_IMAGE_PATTERN = /\.(png|jpe?g|webp|gif|svg)$/i;
const loadedTemplateStyles = new Map();

const ICON_MANIFEST = '/templates/common/icon/manifest.json';
const CUSTOM_DECORATION_STORAGE_KEY = 'gridbuilder:custom-decorations:v1';

const ICO_SVG_MAP = {
	'ico-box1': '<svg width="50" height="57" viewBox="0 0 50 57" fill="none"><g clip-path=""><path d="M35.6 55.4799H14.25L19.78 43.3599H30.07L35.6 55.4799Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M48.59 40.8198C48.59 42.7498 47.03 44.3098 45.1 44.3098H4.74C2.81 44.3098 1.25 42.7498 1.25 40.8198V8.57984C1.25 6.64984 2.81 5.08984 4.74 5.08984H45.1C47.03 5.08984 48.59 6.64984 48.59 8.57984V40.8198Z" class="stroke-primary fill-tertiary" stroke-width="2.5"/><path d="M12.6396 36.1997H37.1996" class="stroke-primary" stroke-width="2.5"/><path d="M36.8502 13.18C36.8502 19.77 31.5102 25.11 24.9202 25.11C18.3302 25.11 12.9902 19.77 12.9902 13.18C12.9902 6.59 18.3302 1.25 24.9202 1.25C31.5102 1.25 36.8502 6.59 36.8502 13.18Z" class="stroke-accent fill-white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M19.7305 13.2798L23.7705 17.3198L30.1105 9.0498" class="fill-white"/><path d="M19.7305 13.2798L23.7705 17.3198L30.1105 9.0498" class="stroke-accent" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_79_18487"><rect width="49.84" height="56.73" fill="white"/></clipPath></defs></svg>',
	'ico-box2': '<svg width="50" height="51" viewBox="0 0 50 51" fill="none"><g clip-path=""><path d="M22.22 1.25H1.25V48.86H22.22V1.25Z" class="stroke-primary fill-tertiary" stroke-width="2.5"/><path d="M14.47 6.5H9V20.85H14.47V6.5Z" class="stroke-primary fill-tertiary" stroke-width="2.5"/><path d="M11.7402 30.3101V37.3101" class="stroke-primary" stroke-width="2.5"/><path d="M48.4397 1.25H27.4697V48.86H48.4397V1.25Z" class="stroke-accent fill-white" stroke-width="2.5" stroke-linejoin="round"/><path d="M40.6897 6.5H35.2197V20.85H40.6897V6.5Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M37.9502 30.3101V37.3101" class="stroke-primary" stroke-width="2.5"/></g><defs><clipPath id="clip0_79_19949"><rect width="49.69" height="50.11" fill="white"/></clipPath></defs></svg>',
	'ico-box3': '<svg width="52" height="55" viewBox="0 0 52 55" fill="none"><g clip-path=""><path d="M35.89 52.8399H16L19.14 41.4399H32.75L35.89 52.8399Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M50.64 39.18C50.64 40.7 49.41 41.92 47.9 41.92H3.99C2.48 41.92 1.25 40.69 1.25 39.18V3.99C1.25 2.48 2.48 1.25 3.99 1.25H47.89C49.4 1.25 50.63 2.48 50.63 3.99V39.18H50.64Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M17.3398 18.04H10.5898V32.01H17.3398V18.04Z" class="stroke-primary fill-tertiary" stroke-width="2.5"/><path d="M29.4002 11.25H22.6602V32.01H29.4002V11.25Z" class="stroke-accent fill-white" stroke-width="2.5" stroke-linejoin="round"/><path d="M41.4697 15.3999H34.7197V32.0099H41.4697V15.3999Z" class="stroke-primary fill-tertiary" stroke-width="2.5"/></g><defs><clipPath id="clip0_79_18515"><rect width="51.89" height="54.09" fill="white"/></clipPath></defs></svg>',
	'ico-box4': '<svg width="54" height="43" viewBox="0 0 54 43" fill="none"><g clip-path=""><path d="M1.57 1.25H21.81C24.43 1.25 26.55 3.1 26.55 5.39V36.86C26.55 34.57 24.43 32.72 21.81 32.72H1.57C1.46 32.72 1.36 32.73 1.25 32.73V1.26C1.36 1.26 1.46 1.25 1.57 1.25Z" class="stroke-primary fill-tertiary" stroke-width="2.5"/><path d="M51.5496 1.25H31.3096C28.6896 1.25 26.5596 3.1 26.5596 5.39V36.86C26.5596 34.57 28.6896 32.72 31.3096 32.72H51.5496C51.6596 32.72 51.7596 32.73 51.8696 32.73V1.26C51.7496 1.26 51.6496 1.25 51.5496 1.25Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M8.03027 7.9502H15.0203" class="stroke-primary" stroke-width="2.5"/><path d="M8.03027 14.6001H15.0203" class="stroke-primary" stroke-width="2.5"/><path d="M8.03027 21.2402H15.0203" class="stroke-primary" stroke-width="2.5"/><path d="M38.0898 7.9502H45.0798" class="stroke-accent" stroke-width="2.5"/><path d="M38.0898 14.6001H45.0798" class="stroke-accent" stroke-width="2.5"/><path d="M38.0898 21.2402H45.0798" class="stroke-accent" stroke-width="2.5"/><path d="M0.0595703 41.2402H53.0596" class="stroke-primary" stroke-width="2.5"/></g><defs><clipPath id="clip0_78_2251"><rect width="53.11" height="42.49" fill="white"/></clipPath></defs></svg>',
	'ico-box5': '<svg width="51" height="50" viewBox="0 0 51 50" fill="none"><g clip-path=""><path d="M49.34 45.5001C49.34 46.8501 48.12 47.9401 46.63 47.9401H3.97C2.47 47.9401 1.25 46.8401 1.25 45.5001V19.2701C1.25 17.9201 2.47 16.8301 3.97 16.8301H46.63C48.13 16.8301 49.34 17.9301 49.34 19.2701V45.5001Z" class="stroke-primary fill-tertiary" stroke-width="2.5"/><path d="M35.0296 47.95H25.2896H15.5596V27.09V11.23L25.2896 1.75L35.0296 11.23V27.09V47.95Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M25.2899 25.1502C27.2892 25.1502 28.9099 23.5294 28.9099 21.5302C28.9099 19.5309 27.2892 17.9102 25.2899 17.9102C23.2907 17.9102 21.6699 19.5309 21.6699 21.5302C21.6699 23.5294 23.2907 25.1502 25.2899 25.1502Z" class="stroke-accent fill-white" stroke-width="2.5"/><path d="M22.1299 32.0898H28.4599" class="stroke-primary" stroke-width="2.5"/></g><defs><clipPath id="clip0_78_2270"><rect width="50.59" height="49.2" fill="white"/></clipPath></defs></svg>',
	'ico-box6': '<svg width="53" height="58" viewBox="0 0 53 58" fill="none"><g clip-path=""><path d="M42.9402 44.5199V30.7299C42.9402 21.5499 35.5002 14.1099 26.3202 14.1099C17.1402 14.1099 9.7002 21.5499 9.7002 30.7299V44.5199" class="fill-tertiary"/><path d="M42.9402 44.5199V30.7299C42.9402 21.5499 35.5002 14.1099 26.3202 14.1099C17.1402 14.1099 9.7002 21.5499 9.7002 30.7299V44.5199" class="stroke-primary" stroke-width="2.5"/><path d="M23.8602 21.1602C19.9402 21.1602 16.7402 24.3502 16.7402 28.2702L23.8602 21.1602Z" class="fill-tertiary"/><path d="M23.8602 21.1602C19.9402 21.1602 16.7402 24.3502 16.7402 28.2702" class="stroke-primary" stroke-width="2.5"/><path d="M51.39 54.0301C51.39 48.9701 47.29 44.8701 42.22 44.8701H10.41C5.35 44.8701 1.25 48.9701 1.25 54.0301V56.2401H51.39V54.0301Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M26.3193 0V7.49" class="stroke-accent" stroke-width="2.5"/><path d="M10.4697 4.25L14.2097 10.73" class="stroke-accent" stroke-width="2.5"/><path d="M38.4297 10.73L42.1697 4.25" class="stroke-accent" stroke-width="2.5"/></g><defs><clipPath id="clip0_78_2279"><rect width="52.64" height="57.5" fill="white"/></clipPath></defs></svg>',
	'ico-box7': '<svg width="51" height="50" viewBox="0 0 51 50" fill="none"><g clip-path=""><path d="M39.83 5.29004H44.72C45.02 5.29004 45.31 5.32004 45.59 5.38004C45.87 5.44004 46.14 5.52004 46.4 5.63004C46.66 5.74004 46.91 5.87004 47.14 6.03004C47.37 6.19004 47.58 6.36004 47.78 6.56004C47.98 6.76004 48.16 6.97004 48.31 7.20004C48.47 7.43004 48.6 7.68004 48.71 7.94004C48.82 8.20004 48.91 8.47004 48.96 8.75004C49.02 9.03004 49.05 9.32004 49.05 9.62004V13.87V18.11V22.35V26.6V30.84V35.09V39.33V43.58C49.05 43.88 49.02 44.17 48.96 44.45C48.9 44.73 48.82 45 48.71 45.26C48.6 45.52 48.47 45.77 48.31 46C48.16 46.23 47.98 46.45 47.78 46.64C47.58 46.84 47.37 47.01 47.14 47.17C46.91 47.33 46.66 47.46 46.4 47.57C46.14 47.68 45.87 47.76 45.59 47.82C45.31 47.88 45.02 47.91 44.72 47.91H39.83H34.94H30.05H25.16H20.27H15.38H10.49H5.58C5.28 47.91 4.99 47.88 4.71 47.82C4.43 47.76 4.16 47.68 3.9 47.57C3.64 47.46 3.39 47.33 3.16 47.17C2.93 47.02 2.72 46.84 2.52 46.64C2.32 46.44 2.15 46.23 1.99 46C1.83 45.77 1.7 45.52 1.59 45.26C1.48 45 1.39 44.73 1.34 44.45C1.28 44.17 1.25 43.88 1.25 43.58V39.33V35.09V30.84V26.6V22.35V18.11V13.87V9.62004C1.25 9.32004 1.28 9.03004 1.34 8.75004C1.4 8.47004 1.48 8.19004 1.59 7.94004C1.7 7.67004 1.83 7.43004 1.99 7.20004C2.15 6.97004 2.32 6.76004 2.52 6.56004C2.72 6.36004 2.93 6.18004 3.16 6.03004C3.39 5.87004 3.64 5.74004 3.9 5.63004C4.16 5.52004 4.43 5.44004 4.71 5.38004C4.99 5.32004 5.28 5.29004 5.58 5.29004H10.47" class="fill-tertiary"/><path d="M39.83 5.29004H44.72C45.02 5.29004 45.31 5.32004 45.59 5.38004C45.87 5.44004 46.14 5.52004 46.4 5.63004C46.66 5.74004 46.91 5.87004 47.14 6.03004C47.37 6.19004 47.58 6.36004 47.78 6.56004C47.98 6.76004 48.16 6.97004 48.31 7.20004C48.47 7.43004 48.6 7.68004 48.71 7.94004C48.82 8.20004 48.91 8.47004 48.96 8.75004C49.02 9.03004 49.05 9.32004 49.05 9.62004V13.87V18.11V22.35V26.6V30.84V35.09V39.33V43.58C49.05 43.88 49.02 44.17 48.96 44.45C48.9 44.73 48.82 45 48.71 45.26C48.6 45.52 48.47 45.77 48.31 46C48.16 46.23 47.98 46.45 47.78 46.64C47.58 46.84 47.37 47.01 47.14 47.17C46.91 47.33 46.66 47.46 46.4 47.57C46.14 47.68 45.87 47.76 45.59 47.82C45.31 47.88 45.02 47.91 44.72 47.91H39.83H34.94H30.05H25.16H20.27H15.38H10.49H5.58C5.28 47.91 4.99 47.88 4.71 47.82C4.43 47.76 4.16 47.68 3.9 47.57C3.64 47.46 3.39 47.33 3.16 47.17C2.93 47.02 2.72 46.84 2.52 46.64C2.32 46.44 2.15 46.23 1.99 46C1.83 45.77 1.7 45.52 1.59 45.26C1.48 45 1.39 44.73 1.34 44.45C1.28 44.17 1.25 43.88 1.25 43.58V39.33V35.09V30.84V26.6V22.35V18.11V13.87V9.62004C1.25 9.32004 1.28 9.03004 1.34 8.75004C1.4 8.47004 1.48 8.19004 1.59 7.94004C1.7 7.67004 1.83 7.43004 1.99 7.20004C2.15 6.97004 2.32 6.76004 2.52 6.56004C2.72 6.36004 2.93 6.18004 3.16 6.03004C3.39 5.87004 3.64 5.74004 3.9 5.63004C4.16 5.52004 4.43 5.44004 4.71 5.38004C4.99 5.32004 5.28 5.29004 5.58 5.29004H10.47" class="stroke-primary" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.2598 5.29004H25.1498H30.0498" class="fill-tertiary"/><path d="M20.2598 5.29004H25.1498H30.0498" class="stroke-primary" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5098 1.25V9.6" class="stroke-primary" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M34.7998 1.25V9.6" class="stroke-primary" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.67969 17.3799H48.0497" class="stroke-primary" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M32.5103 39.0501L31.7103 34.3901C31.7103 34.3901 34.8503 31.2801 34.9903 31.1401C36.6203 29.5501 36.3103 27.9801 34.3903 27.4301L29.2003 26.6801L26.9403 22.1101C25.9003 20.4001 24.3903 20.4001 23.3403 22.1101L21.0803 26.6801L15.8903 27.4301C13.9703 27.9801 13.6603 29.5501 15.2903 31.1401C15.4303 31.2801 18.5703 34.3901 18.5703 34.3901L17.7703 39.0501C17.4503 41.3901 18.9003 42.3801 21.0703 41.2401C21.2703 41.1401 25.1203 39.1601 25.1203 39.1601C25.1203 39.1601 28.9803 41.1401 29.1703 41.2401C31.3803 42.3801 32.8303 41.3901 32.5103 39.0501Z" class="stroke-accent fill-white" stroke-width="2.5"/></g><defs><clipPath id="clip0_78_2341"><rect width="50.31" height="49.16" fill="white"/></clipPath></defs></svg>',
	'ico-box8': '<svg width="43" height="56" viewBox="0 0 43 56" fill="none"><g clip-path=""><path d="M35.2103 34.9501C42.9203 27.2401 42.9203 14.7401 35.2103 7.03006C27.5003 -0.679941 15.0003 -0.679941 7.29031 7.03006C-0.419687 14.7401 -0.419687 27.2401 7.29031 34.9501L21.2503 48.9001L35.2103 34.9501Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M27.9803 19.8699C27.9803 23.5899 24.9703 26.5999 21.2603 26.5999C17.5403 26.5999 14.5303 23.5899 14.5303 19.8699C14.5303 16.1599 17.5403 13.1499 21.2603 13.1499C24.9703 13.1399 27.9803 16.1599 27.9803 19.8699Z" class="stroke-accent fill-white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.25 54.1001H41.25" class="stroke-accent" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_78_2335"><rect width="42.5" height="55.35" fill="white"/></clipPath></defs></svg>',
	'ico-box9': '<svg width="53" height="50" viewBox="0 0 53 50" fill="none"><g clip-path=""><path d="M18.21 48.4C16.32 48.4 13.67 47.3 12.33 45.97L3.68 37.32C2.34 35.98 1.25 33.34 1.25 31.44V4.69C1.25 2.8 2.8 1.25 4.69 1.25H38.12C40.01 1.25 41.56 2.8 41.56 4.69V44.96C41.56 46.85 40.01 48.4 38.12 48.4H18.21Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M11.3296 34.8799C13.2196 34.8799 14.7696 36.4299 14.7696 38.3199V44.9499C14.7696 46.8399 13.6796 47.2999 12.3296 45.9599L3.67957 37.3099C2.33957 35.9699 2.79957 34.8799 4.68957 34.8799H11.3296Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M51.65 21.12C51.65 27.71 46.31 33.05 39.72 33.05C33.13 33.05 27.79 27.71 27.79 21.12C27.79 14.53 33.13 9.18996 39.72 9.18996C46.31 9.17996 51.65 14.53 51.65 21.12Z" class="stroke-accent fill-tertiary" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M34.5303 21.21L38.5603 25.25L44.9103 16.98" class="fill-tertiary"/><path d="M34.5303 21.21L38.5603 25.25L44.9103 16.98" class="stroke-accent" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.55957 12.25H13.5596" class="stroke-primary" stroke-width="2.5"/><path d="M6.55957 22.25H13.5596" class="stroke-primary" stroke-width="2.5"/></g><defs><clipPath id="clip0_78_2366"><rect width="52.9" height="49.65" fill="white"/></clipPath></defs></svg>',
	'ico-box10': '<svg width="47" height="49" viewBox="0 0 47 49" fill="none"><g clip-path=""><path d="M44.93 1.25H1.25V34.23H44.93V1.25Z" class="stroke-primary fill-tertiary" stroke-width="2.5"/><path d="M19.3398 11.3599L30.3998 17.7399L19.3398 24.1299V11.3599Z" class="stroke-accent fill-white" stroke-width="2.5"/><path d="M0 43.96H15.87" class="stroke-accent" stroke-width="2.5"/><path d="M23.3604 43.96H46.1804" class="stroke-accent" stroke-width="2.5"/><path d="M23.3597 43.9601C23.3597 45.9301 21.7597 47.5201 19.7897 47.5201C17.8197 47.5201 16.2197 45.9201 16.2197 43.9601C16.2197 41.9901 17.8197 40.3901 19.7897 40.3901C21.7597 40.4001 23.3597 42.0001 23.3597 43.9601Z" class="stroke-accent fill-white" stroke-width="2.5"/></g><defs><clipPath id="clip0_79_18496"><rect width="46.18" height="48.78" fill="white"/></clipPath></defs></svg>',
	'ico-box11': '<svg width="56" height="47" viewBox="0 0 56 47" fill="none"><g clip-path=""><path d="M23.1602 18.17H15.9902V6.32C15.9902 3.52 18.2602 1.25 21.0702 1.25H48.7202C51.5202 1.25 53.7902 3.52 53.7902 6.32V25.35C53.7902 28.15 51.5202 30.42 48.7202 30.42H43.1402V42.09L30.8302 30.42H26.5502V21.56C26.5502 19.69 25.0302 18.17 23.1602 18.17Z" class="stroke-primary fill-white" stroke-width="2.5" stroke-linejoin="round"/><path d="M4.65 18.1699H23.16C25.03 18.1699 26.56 19.6899 26.56 21.5699V34.2999C26.56 36.1799 25.04 37.6999 23.16 37.6999H16.62L8.39 45.5099V37.6999H4.65C2.77 37.6999 1.25 36.1799 1.25 34.2999V21.5599C1.25 19.6899 2.77 18.1699 4.65 18.1699Z" class="stroke-primary fill-tertiary" stroke-width="2.5" stroke-linejoin="round"/><path d="M43.15 9.7002H35.54" class="stroke-accent" stroke-width="2.5"/><path d="M43.15 17.5601H35.54" class="stroke-accent" stroke-width="2.5"/></g><defs><clipPath id="clip0_79_18506"><rect width="55.03" height="46.76" fill="white"/></clipPath></defs></svg>',
	'ico-box12': '<svg width="54" height="51" viewBox="0 0 54 51" fill="none"><g clip-path=""><path d="M47.5198 44.0501C47.5198 45.4701 46.3698 46.6301 44.9398 46.6301H8.6298C7.2098 46.6301 6.0498 45.4801 6.0498 44.0501V11.4101C6.0498 9.99008 7.1998 8.83008 8.6298 8.83008H44.9398C46.3598 8.83008 47.5198 9.98008 47.5198 11.4101V44.0501Z" class="stroke-primary fill-tertiary" stroke-width="2.5"/><path d="M1.25 41.4199V44.8799C1.25 47.3199 3.23 49.2899 5.66 49.2899H47.91C50.35 49.2899 52.32 47.3099 52.32 44.8799V41.4199H1.25Z" class="stroke-primary fill-white" stroke-width="2.5"/><path d="M36.0803 1.25H19.0803C16.8703 1.25 15.0703 3.04 15.0703 5.26V16.41C15.0703 18.62 16.8603 20.42 19.0803 20.42H23.8403V27.89L30.1403 20.42H36.0703C38.2803 20.42 40.0703 18.63 40.0703 16.41V5.26C40.0903 3.04 38.2903 1.25 36.0803 1.25Z" class="stroke-accent fill-tertiary" stroke-width="2.5"/><path d="M23.1006 7.4502H32.0706" class="stroke-accent fill-tertiary" stroke-width="2.5"/><path d="M23.1006 13H32.0706" class="stroke-accent fill-tertiary" stroke-width="2.5"/></g><defs><clipPath id="clip0_63_7054"><rect width="53.58" height="50.54" fill="white"/></clipPath></defs></svg>'
};
let ICON_CATEGORIES = [];

async function loadIconCategories() {
	try {
		const res = await fetch(ICON_MANIFEST, { cache: 'no-store' });
		if (res.ok) ICON_CATEGORIES = normalizeIconCategories(await res.json());
	} catch (e) {
		console.warn('아이콘 매니페스트를 불러오지 못했습니다.', e);
	}
}

function normalizeAssetPath(path) {
	if (!path || /^data:/i.test(path) || /^https?:\/\//i.test(path) || path.startsWith('/')) return path;
	if (path.startsWith('templates/')) return `/${path}`;
	return path;
}

function normalizeIconCategories(categories) {
	return (categories || []).map(cat => ({
		...cat,
		icons: (cat.icons || []).map(icon => ({ ...icon, src: normalizeAssetPath(icon.src) })),
		groups: (cat.groups || []).map(group => ({
			...group,
			icons: (group.icons || []).map(icon => ({ ...icon, src: normalizeAssetPath(icon.src) }))
		}))
	}));
}

const componentTemplates = {};

const state = {
	blocks: [],
	nextBlockId: 1,
	dragPayload: '',
	templateFilter: 'all',
	sidebarTab: 'blocks',
	decorationFilter: 'all',
	selectedItem: null,
	tableCellDrag: null,
	overlays: [],
	customDecorations: [],
	undoStack: [],
	previewDevice: 'pc',
	newsletterStyle: { fontFamily: '', fontSize: '', lineHeight: '', fontWeight: '', blockGap: '' }
};

// 꾸밈 스튜디오 필터 목록
const DECORATION_FILTERS = [
	{ id: 'all', label: '전체' },
	{ id: 'kindergarten', label: '유치원' },
	{ id: 'elementary', label: '초등학교' },
	{ id: 'middle', label: '중학교' },
	{ id: 'high', label: '고등학교' },
	{ id: 'illustration', label: '일러스트' },
	{ id: 'deco-sticker', label: '데코 스티커' },
	{ id: 'etc', label: '기타' },
];

// 꾸밈 템플릿별 카테고리 매핑 (추후 확장)
const DECORATION_CATEGORIES = {
	'deco-01': 'kindergarten',
	'deco-02': 'kindergarten',
	'deco-03': 'elementary',
	'deco-04': 'middle',
	'deco-05': 'high',
	'deco-06': 'illustration',
};


function getDecorationCategory(templateId) {
	if (/^kinder-\d+/.test(templateId)) return 'kindergarten';
	if (/^elem-\d+/.test(templateId)) return 'elementary';
	if (/^middle-\d+/.test(templateId)) return 'middle';
	if (/^high-\d+/.test(templateId)) return 'high';
	if (/^illust-\d+/.test(templateId)) return 'illustration';
	return DECORATION_CATEGORIES[templateId] || 'etc';
}

// manifest.json 로드 시 자동으로 채워짐
const templateCategories = {};
const templateBasePaths = {}; // { 'box-01': 'templates/design_block/box/box-01', ... }

// 타이틀 계층 (낮을수록 상위 레벨)
const TITLE_HIERARCHY = ['title-01', 'title-02', 'title-03', 'title-04'];

function isTitleBlock(type) {
	return TITLE_HIERARCHY.includes(type);
}

function demoteTitleType(targetType) {
	const idx = TITLE_HIERARCHY.indexOf(targetType);
	if (idx < 0 || idx >= TITLE_HIERARCHY.length - 1) return null;
	return TITLE_HIERARCHY[idx + 1];
}

const canvasGrid = document.getElementById('canvasGrid');
const markupOutput = document.getElementById('markupOutput');
const layoutStatus = document.getElementById('layoutStatus');
const copyState = document.getElementById('copyState');
const previewToggle = document.getElementById('previewToggle');
const previewReturn = document.getElementById('previewReturn');
const savePreviewImageButton = document.getElementById('savePreviewImage');
const previewMarkupOpenButton = document.getElementById('previewMarkupOpen');
const markupToggle = document.getElementById('markupToggle');
const componentList = document.getElementById('componentList');

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function escapeAttr(value) {
	return escapeHtml(value);
}

function formatMultiline(value) {
	return escapeHtml(value).replace(/\n/g, '<br>');
}

function cloneData(data) {
	return JSON.parse(JSON.stringify(data));
}

// 블록 안 블록 공통 액션 버튼 HTML 생성
function _innerBlockActionsHtml(propsHtml, removeBtnHtml) {
	return `<div class="inner-block-actions">${propsHtml}${removeBtnHtml}</div>`;
}

// 혼합 블록 내부 참조 해석 (복합 ID: "outerBlockId::inner::idx" 또는 "outerBlockId::pstep::stepIdx::inner::innerIdx")
function resolveMixInnerRef(blockId) {
	// process-02 step inner ref: "blockId::pstep::N::inner::M"
	const mp = typeof blockId === 'string' && blockId.match(/^(.+)::pstep::(\d+)::inner::(\d+)$/);
	if (mp) {
		const outerBlock = state.blocks.find(b => b.id === mp[1]);
		if (!outerBlock) return null;
		const stepIdx = parseInt(mp[2], 10);
		const innerIdx = parseInt(mp[3], 10);
		const item = outerBlock.items?.[stepIdx];
		if (!item || !Array.isArray(item.innerBlocks)) return null;
		const innerBlock = item.innerBlocks[innerIdx];
		if (!innerBlock) return null;
		return { outerBlock, innerIdx, innerBlock };
	}
	// mix container inner ref: "blockId::inner::N"
	const m = typeof blockId === 'string' && blockId.match(/^(.+)::inner::(\d+)$/);
	if (!m) return null;
	const outerBlock = state.blocks.find(b => b.id === m[1]);
	if (!outerBlock || !Array.isArray(outerBlock.innerBlocks)) return null;
	const innerIdx = parseInt(m[2], 10);
	const innerBlock = outerBlock.innerBlocks[innerIdx];
	if (!innerBlock) return null;
	return { outerBlock, innerIdx, innerBlock };
}

function resolveListInnerRef(blockId) {
	const m = typeof blockId === 'string' && blockId.match(/^(.+)::list::(\d+)$/);
	if (!m) return null;
	const outerBlock = state.blocks.find(b => b.id === m[1]);
	if (!outerBlock) return null;
	const colIdx = parseInt(m[2], 10);
	const item = outerBlock.items[colIdx];
	if (!item || !item.listBlock) return null;
	return { outerBlock, listBlock: item.listBlock, colIdx };
}

// 테이블 셀 내부 블록 참조 해석 (복합 ID: "outerBlockId::tcell::cellKey")
function resolveTableCellInnerRef(blockId) {
	const m = typeof blockId === 'string' && blockId.match(/^(.+)::tcell::(.+)$/);
	if (!m) return null;
	const outerBlock = state.blocks.find(b => b.id === m[1]);
	if (!outerBlock) return null;
	const cellKey = m[2];
	const innerBlockData = outerBlock.tableCellInnerBlocks?.[cellKey];
	if (!innerBlockData) return null;
	return { outerBlock, innerBlockData, cellKey };
}

function resolveBlockForRows(blockId) {
	const block = state.blocks.find(b => b.id === blockId);
	if (block) return block;
	const mixRef = resolveMixInnerRef(blockId);
	if (mixRef) {
		return { id: blockId, type: mixRef.innerBlock.type, items: mixRef.innerBlock.items };
	}
	const tcellRef = resolveTableCellInnerRef(blockId);
	if (tcellRef) {
		return { id: blockId, type: tcellRef.innerBlockData.type, items: tcellRef.innerBlockData.items };
	}
	return null;
}

function findItemByBlockId(blockId, columnIndex) {
	const mixRef = resolveMixInnerRef(blockId);
	if (mixRef) return mixRef.innerBlock.items[columnIndex] ?? null;
	const listRef = resolveListInnerRef(blockId);
	if (listRef) return listRef.listBlock.items[columnIndex] ?? null;
	const tcellRef = resolveTableCellInnerRef(blockId);
	if (tcellRef) return tcellRef.innerBlockData.items[columnIndex] ?? null;
	const block = state.blocks.find(b => b.id === blockId);
	return block?.items[columnIndex] ?? null;
}

function hasListWrap(blockType) {
	const template = componentTemplates[blockType];
	return !!(template && template.element.querySelector('.list-wrap'));
}

function switchFilterTab(filterValue) {
	const btn = document.querySelector(`[data-template-filter="${filterValue}"]`);
	if (!btn) return;
	state.templateFilter = filterValue;
	document.querySelectorAll('[data-template-filter]').forEach(b => b.classList.toggle('is-active', b === btn));
	renderComponentList();
}

const FONT_SIZES = ['14', '15', '16', '18', '20', '22', '24', '26'];
const MAX_HISTORY = 50;
let _historyGroupPending = false;
let _duplicatingBlock = false;

function pushHistory() {
	state.undoStack.push(cloneData(state.blocks));
	if (state.undoStack.length > MAX_HISTORY) state.undoStack.shift();
}

function pushHistoryGrouped() {
	if (_historyGroupPending) return;
	_historyGroupPending = true;
	pushHistory();
	setTimeout(() => { _historyGroupPending = false; }, 500);
}

function undo() {
	if (!state.undoStack.length) return;
	state.blocks = state.undoStack.pop();
	state.nextBlockId = state.blocks.reduce((max, b) => {
		const n = parseInt(b.id.replace('block-', ''), 10);
		return isNaN(n) ? max : Math.max(max, n + 1);
	}, 1);
	state.selectedItem = null;
	render();
}

function createDefaultStyle() {
	return {
		titleBorderColor: '#dfe5ee',
		titleBackgroundColor: '#7989a2',
		titleTextColor: '#ffffff',
		titleFontWeight: '700',
		bodyBorderColor: '#dfe5ee',
		bodyBackgroundColor: '#ffffff',
		bodyTextColor: '#101010',
		bodyFontWeight: '400',
		connectorColor: '#333333',
		connectorSize: '1'
	};
}

function getColumnStyle(item) {
	if (!item.style) {
		item.style = createDefaultStyle();
	}
	return item.style;
}

const ALIGN_TO_JUSTIFY = { left: 'flex-start', center: 'center', right: 'flex-end' };

function columnStyleVars(item) {
	const style = getColumnStyle(item);
	return [
		`--title-border: ${style.titleBorderColor}`,
		`--title-bg: ${style.titleBackgroundColor}`,
		`--title-text: ${style.titleTextColor}`,
		`--title-weight: ${style.titleFontWeight}`,
		style.titleFontSize != null && `--title-size: ${style.titleFontSize}px`,
		style.titleTextAlign && `--title-align: ${style.titleTextAlign}`,
		style.titleTextAlign && `--title-justify: ${ALIGN_TO_JUSTIFY[style.titleTextAlign] || style.titleTextAlign}`,
		`--body-border: ${style.bodyBorderColor}`,
		`--body-bg: ${style.bodyBackgroundColor}`,
		`--body-text: ${style.bodyTextColor}`,
		`--body-weight: ${style.bodyFontWeight}`,
		style.bodyFontSize != null && `--body-size: ${style.bodyFontSize}px`,
		style.bodyTextAlign && `--body-align: ${style.bodyTextAlign}`,
		`--connector-color: ${style.connectorColor}`,
		`--connector-size: ${style.connectorSize}`
	].filter(Boolean).join('; ');
}

function columnMarkupStyle(item) {
	return ` style="${columnStyleVars(item)}"`;
}

function toStyleKey(rawKey) {
	return rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function readDefaultStyle(root) {
	return Array.from(root.attributes).reduce((style, attr) => {
		if (!attr.name.startsWith('data-style-')) return style;
		style[toStyleKey(attr.name.replace('data-style-', ''))] = attr.value;
		return style;
	}, {});
}

function setFieldContent(element, value) {
	element.innerHTML = String(value || '');
}

function stripEditorAttributes(root) {
	Array.from(root.attributes).forEach(attr => {
		if (attr.name.startsWith('data-template-') || attr.name.startsWith('data-style-')) {
			root.removeAttribute(attr.name);
		}
	});
	root.querySelectorAll('[contenteditable]').forEach(element => element.removeAttribute('contenteditable'));
	root.querySelectorAll('[data-block-id]').forEach(element => element.removeAttribute('data-block-id'));
	root.querySelectorAll('[data-column-index]').forEach(element => element.removeAttribute('data-column-index'));
	root.classList.remove('add-row-wrap', 'block-item');
	root.querySelectorAll('.add-row-wrap').forEach(element => element.classList.remove('add-row-wrap'));
	root.querySelectorAll('.block-item').forEach(element => element.classList.remove('block-item'));
	root.querySelectorAll('[data-box-img]').forEach(element => element.removeAttribute('data-box-img'));
	root.querySelectorAll('[data-tab-block-id]').forEach(element => element.removeAttribute('data-tab-block-id'));
	root.querySelectorAll('[data-tab-item-idx]').forEach(element => element.removeAttribute('data-tab-item-idx'));
}

function renderTemplateElement(template, item, block = null, columnIndex = null, editable = false) {
	const element = template.element.cloneNode(true);
	Array.from(element.attributes).forEach(attr => {
		if (attr.name.startsWith('data-template-') || attr.name.startsWith('data-style-')) {
			element.removeAttribute(attr.name);
		}
	});
	element.querySelectorAll('[data-edit-field]').forEach(field => {
		const fieldName = field.dataset.editField;
		setFieldContent(field, item[fieldName] || '');
		if (fieldName === 'icon' && (item.iconWidth || item.iconHeight)) {
			const img = field.querySelector('.block-icon-img');
			if (img) {
				if (item.iconWidth) { img.style.width = `${item.iconWidth}px`; img.style.maxWidth = 'none'; }
				if (item.iconHeight) { img.style.height = `${item.iconHeight}px`; }
			}
		}
		if (editable && block) {
			field.dataset.blockId = block.id;
			field.dataset.columnIndex = String(columnIndex);
			return;
		}
		field.removeAttribute('data-edit-field');
	});

	if (!editable) {
		stripEditorAttributes(element);
	}

	return element;
}

function elementToHtml(element) {
	const wrapper = document.createElement('div');
	wrapper.appendChild(element);
	return wrapper.innerHTML.trim();
}

function htmlToLines(html) {
	return html.split('\n').map(line => line.trimEnd());
}

function getDefaultData(element) {
	const data = {};
	element.querySelectorAll('[data-edit-field]').forEach(field => {
		data[field.dataset.editField] = field.innerHTML;
	});
	return data;
}

function normalizeTemplatePath(path) {
	let normalized;
	if (/^https?:\/\//i.test(path) || path.startsWith('/')) {
		normalized = path;
	} else if (path.startsWith('templates/')) {
		normalized = `/${path}`;
	} else {
		normalized = TEMPLATE_DIR + path;
	}
	if (TEMPLATE_FILE_PATTERN.test(normalized) || TEMPLATE_IMAGE_PATTERN.test(normalized)) return normalized;
	return normalized.replace(/\/?$/, '/') + 'index.html';
}

function normalizeTemplateFolder(path) {
	let normalized;
	if (/^https?:\/\//i.test(path) || path.startsWith('/')) {
		normalized = path;
	} else if (path.startsWith('templates/')) {
		normalized = `/${path}`;
	} else {
		normalized = TEMPLATE_DIR + path;
	}
	return normalized.replace(/\/?$/, '');
}

function inferCntBuilderTemplateCategory(path) {
	if (/\/design_template\//.test(path)) return 'design-template';
	if (/\/common\/decoration\//.test(path)) return 'decoration';
	const match = path.match(/\/design_block\/([^/]+)\//);
	return match ? match[1] : '';
}

function inferCntBuilderTemplateId(path) {
	const normalized = path.replace(/\\/g, '/');
	const parts = normalized.split('/').filter(Boolean);
	const file = parts.at(-1) || '';
	const folder = parts.at(-2) || '';
	if (/^index\.html$/i.test(file) || !/\.[^.]+$/i.test(file)) return folder;
	if (/\/common\/decoration\/(kinder|elem|middle|high|illust|deco)\//.test(normalized)) {
		const n = file.replace(/\.[^.]+$/i, '').padStart(2, '0');
		return `${folder}-${n}`;
	}
	return file.replace(/\.[^.]+$/, '');
}

function parseDirectoryListing(html) {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return Array.from(doc.querySelectorAll('a[href]'))
		.map(link => link.getAttribute('href'))
		.filter(Boolean)
		.map(href => href.split('?')[0].split('#')[0].replace(/\\/g, '/'))
		.filter(href => !href.startsWith('/') && !href.includes('..'))
		.filter(href => TEMPLATE_FILE_PATTERN.test(href) || TEMPLATE_IMAGE_PATTERN.test(href) || /\/$/.test(href))
		.map(normalizeTemplatePath);
}

async function discoverTemplatePaths() {
	const manifests = await Promise.all([
		fetchTemplateManifest(DESIGN_BLOCK_MANIFEST, true),
		fetchTemplateManifest(DECORATION_MANIFEST, false)
	]);
	const entries = manifests.flat();

	const paths = await Promise.all(entries.map(expandTemplateManifestEntry));
	return paths.flat();
}

async function fetchTemplateManifest(url, required) {
	const response = await fetch(url, { cache: 'no-store' });
	if (!response.ok) {
		if (required) throw new Error(`${url} 파일을 읽을 수 없습니다.`);
		return [];
	}
	const manifest = await response.json();
	return Array.isArray(manifest) ? manifest : (manifest.groups || []);
}

async function expandTemplateManifestEntry(entry) {
	if (typeof entry === 'string') {
		const path = normalizeTemplatePath(entry);
		const id = inferCntBuilderTemplateId(path);
		const category = inferCntBuilderTemplateCategory(path);
		if (id && category) {
			templateCategories[id] = category;
			templateBasePaths[id] = normalizeTemplateFolder(path.replace(/\/?index\.html$/i, '').replace(/\/[^/]+\.[^.]+$/i, ''));
		}
		return [path];
	}

	if (entry.type === 'image-set') {
		const groupBasePath = normalizeTemplateFolder(entry.path || entry.id);
		const config = await loadTemplateConfig(`${groupBasePath}/index.html`);
		return (config.images || []).map(image => {
			const path = normalizeTemplatePath(`${groupBasePath}/${image}`);
			const id = inferCntBuilderTemplateId(path);
			const category = inferCntBuilderTemplateCategory(path);
			if (id && category) {
				templateCategories[id] = category;
				templateBasePaths[id] = groupBasePath;
			}
			return path;
		});
	}

	const paths = [];
	const groupBasePath = normalizeTemplateFolder(entry.path || entry.id);
	for (const id of (entry.items || [])) {
		templateCategories[id] = entry.id;
		templateBasePaths[id] = `${groupBasePath}/${id}`;
		paths.push(`${groupBasePath}/${id}/index.html`);
	}
	return paths;
}

function getTemplateCssPath(htmlPath) {
	return htmlPath.replace(/[^/]+$/, 'style.css');
}

function getTemplateConfigPath(htmlPath) {
	return htmlPath.replace(/[^/]+$/, 'config.json');
}

async function loadTemplateConfig(htmlPath) {
	try {
		const res = await fetch(getTemplateConfigPath(htmlPath), { cache: 'no-store' });
		if (res.ok) return await res.json();
	} catch (e) {}
	return {};
}

function normalizeTemplateAssetPaths(element) {
	element.querySelectorAll('img[src]').forEach(img => {
		img.setAttribute('src', normalizeAssetPath(img.getAttribute('src')));
	});
	element.querySelectorAll('[style]').forEach(node => {
		const style = node.getAttribute('style');
		if (style && style.includes('url(')) {
			node.setAttribute('style', style.replace(/url\((['"]?)(\/?templates\/[^'")]+)\1\)/g, (_, quote, assetPath) => {
				return `url(${quote}${normalizeAssetPath(assetPath)}${quote})`;
			}));
		}
	});
}

function loadTemplateCss(htmlPath) {
	const cssPath = getTemplateCssPath(htmlPath);
	if (loadedTemplateStyles.has(cssPath)) return loadedTemplateStyles.get(cssPath);

	const promise = new Promise(resolve => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssPath;
		link.dataset.templateStyle = cssPath;
		link.addEventListener('load', resolve, { once: true });
		link.addEventListener('error', resolve, { once: true });
		document.head.appendChild(link);
	});
	loadedTemplateStyles.set(cssPath, promise);
	return promise;
}

async function loadHtmlTemplate(path) {
	const response = await fetch(path, { cache: 'no-store' });
	if (!response.ok) throw new Error(`${path} 파일을 읽을 수 없습니다.`);
	const source = await response.text();
	const doc = new DOMParser().parseFromString(source, 'text/html');
	const element = doc.querySelector('[data-template-id]') || doc.body.firstElementChild;
	if (!element || element.tagName.toLowerCase() !== 'div') {
		throw new Error(`${path} 템플릿은 최상위 div가 필요합니다.`);
	}

	const id = element.dataset.templateId || path.split('/').pop().replace(/\.[^.]+$/, '');
	const name = element.dataset.templateName || id;
	element.dataset.templateId = id;
	normalizeTemplateAssetPaths(element);
	const [, config] = await Promise.all([loadTemplateCss(path), loadTemplateConfig(path)]);

	const addRowWrap = element.querySelector('.add-row-wrap') || element;
	const autoDirection = addRowWrap === element ? 'row' : 'column';
	const addDirection = config.addDirection || autoDirection;
	const isRootWrap = addDirection === 'row';

	const max = Number(config.max) || 4;

	const editListEl = element.querySelector('.edit-list');
	const editListLiTemplate = editListEl ? editListEl.querySelector('li') : null;

	const styleOptions = config.styleOptions || null;
	const defaultInnerType = config.defaultInnerType || null;
	const cssVarDefaults = readCssVarDefaults(element);
	const recommend = config.recommend || null;
	const templateFilters = config.templateFilters || [];
	const blockRules = config.blockRules || null;
	const isInline = !!config.inline;
	const inlineHtml = config.inlineHtml || '';
	const isSmartInline = !!config.smartInline;
	const tabDefaults = config.tabDefaults || null;
	const accordionDefaults = config.accordionDefaults || null;
	const discloserDefaults = config.discloserDefaults || null;

	return {
		id,
		name,
		path,
		recommend,
		templateFilters,
		blockRules,
		isInline,
		inlineHtml,
		isSmartInline,
		tabDefaults,
		accordionDefaults,
		discloserDefaults,
		element,
		addRowWrap,
		isRootWrap,
		addDirection,
		max,
		editListLiTemplate,
		styleOptions,
		defaultInnerType,
		cssVarDefaults,
		getDefaultData: () => getDefaultData(element),
		getDefaultStyle: () => readDefaultStyle(element),
		render: (block, item, columnIndex, editable = true) => elementToHtml(renderTemplateElement(componentTemplates[id], item, block, columnIndex, editable)),
		markup: item => htmlToLines(elementToHtml(renderTemplateElement(componentTemplates[id], item)))
	};
}

async function loadImageTemplate(path) {
	const id = inferCntBuilderTemplateId(path);
	const folder = path.split('/').filter(Boolean).at(-2) || id;
	const name = id;
	const element = document.createElement('div');
	element.className = folder;
	element.dataset.templateId = id;
	element.dataset.templateName = name;

	const img = document.createElement('img');
	img.className = `${folder}-char`;
	img.src = normalizeAssetPath(path);
	img.alt = '';
	element.appendChild(img);

	const [, config] = await Promise.all([loadTemplateCss(path), loadTemplateConfig(path)]);
	const addRowWrap = element.querySelector('.add-row-wrap') || element;
	const addDirection = config.addDirection || 'row';
	const styleOptions = config.styleOptions || null;
	const defaultInnerType = config.defaultInnerType || null;
	const cssVarDefaults = readCssVarDefaults(element);
	const recommend = config.recommend || null;
	const templateFilters = config.templateFilters || [];

	return {
		id,
		name,
		path,
		recommend,
		templateFilters,
		element,
		addRowWrap,
		isRootWrap: addDirection === 'row',
		addDirection,
		max: Number(config.max) || 1,
		editListLiTemplate: null,
		styleOptions,
		defaultInnerType,
		cssVarDefaults,
		getDefaultData: () => ({}),
		getDefaultStyle: () => readDefaultStyle(element),
		render: (block, item, columnIndex, editable = true) => elementToHtml(renderTemplateElement(componentTemplates[id], item, block, columnIndex, editable)),
		markup: item => htmlToLines(elementToHtml(renderTemplateElement(componentTemplates[id], item)))
	};
}

function readCssVarDefaults(element) {
	const el = element.cloneNode(false);
	el.style.cssText = 'visibility:hidden;position:absolute;pointer-events:none;left:-9999px;';
	document.body.appendChild(el);
	const c = getComputedStyle(el);
	const get = name => c.getPropertyValue(name).trim() || null;
	const map = {
		'--title-border': 'titleBorderColor',
		'--title-bg':     'titleBackgroundColor',
		'--title-text':   'titleTextColor',
		'--title-weight': 'titleFontWeight',
		'--body-border':  'bodyBorderColor',
		'--body-bg':      'bodyBackgroundColor',
		'--body-text':    'bodyTextColor',
		'--body-weight':  'bodyFontWeight',
	};
	const result = {};
	Object.entries(map).forEach(([cssVar, key]) => {
		const val = get(cssVar);
		if (val) result[key] = val;
	});
	document.body.removeChild(el);
	return result;
}

async function loadJsTemplate(path) {
	const before = new Set(Object.keys(componentTemplates));
	await import(`../${path}?v=${Date.now()}`);
	const added = Object.keys(componentTemplates).filter(id => !before.has(id));
	if (!added.length) throw new Error(`${path} 파일에서 템플릿이 등록되지 않았습니다.`);
}

window.registerDesignTemplate = function registerDesignTemplate(template) {
	if (!template || !template.id) return;
	componentTemplates[template.id] = template;
};

async function loadTemplates() {
	const paths = await discoverTemplatePaths();
	const htmlPaths = paths.filter(path => /\.html$/i.test(path));
	const imagePaths = paths.filter(path => TEMPLATE_IMAGE_PATTERN.test(path));
	const jsPaths = paths.filter(path => /\.js$/i.test(path));

	for (const path of htmlPaths) {
		const template = await loadHtmlTemplate(path);
		componentTemplates[template.id] = template;
		if ((templateCategories[template.id] || '') === 'design-template') {
			registerDesignTemplateSections(template);
		}
	}

	for (const path of imagePaths) {
		const template = await loadImageTemplate(path);
		componentTemplates[template.id] = template;
	}

	for (const path of jsPaths) {
		await loadJsTemplate(path);
	}
}

function applyStyleOptionsDefaults(style, styleOptions) {
	Object.keys(styleOptions).forEach(target => {
		const fields = styleOptions[target]?.fields;
		if (!fields) return;
		fields.forEach(f => {
			if (!f.key || f.default === undefined) return;
			const styleKey = `${target}${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`;
			style[styleKey] = f.default;
		});
	});
}

function createStyleForType(type) {
	const template = componentTemplates[type];
	const style = {
		...createDefaultStyle(),
		...(template.cssVarDefaults || {}),
		...(template.getDefaultStyle ? template.getDefaultStyle() : {})
	};
	if (template.styleOptions) applyStyleOptionsDefaults(style, template.styleOptions);
	return style;
}

function createSectionTemplate(parentTemplate, sectionElement, index) {
	const id = `${parentTemplate.id}__section_${index + 1}`;
	const element = document.createElement('div');
	element.className = parentTemplate.element.className;
	element.dataset.templateId = id;
	element.dataset.templateName = `${parentTemplate.name} ${index + 1}`;
	element.appendChild(sectionElement.cloneNode(true));

	return {
		...parentTemplate,
		id,
		name: element.dataset.templateName,
		element,
		addRowWrap: element,
		isRootWrap: true,
		addDirection: 'row',
		max: 1,
		editListLiTemplate: null,
		getDefaultData: () => getDefaultData(element),
		getDefaultStyle: () => readDefaultStyle(element),
		render: (block, item, columnIndex, editable = true) => elementToHtml(renderTemplateElement(componentTemplates[id], item, block, columnIndex, editable)),
		markup: item => htmlToLines(elementToHtml(renderTemplateElement(componentTemplates[id], item)))
	};
}

function registerDesignTemplateSections(template) {
	const sections = Array.from(template.element.children).filter(child => child.nodeType === 1);
	template.designSectionTypes = sections.map((section, index) => {
		const sectionTemplate = createSectionTemplate(template, section, index);
		componentTemplates[sectionTemplate.id] = sectionTemplate;
		templateCategories[sectionTemplate.id] = 'design-template-section';
		templateBasePaths[sectionTemplate.id] = templateBasePaths[template.id];
		return sectionTemplate.id;
	});
}

function createBlock(type) {
	const template = componentTemplates[type];
	const defaultData = template.getDefaultData ? template.getDefaultData() : {};
	const isDesignTemplateSection = (templateCategories[type] || '') === 'design-template-section';
	const block = {
		id: `block-${state.nextBlockId++}`,
		type,
		columns: 1,
		columnMode: '1',
		marginTop: 0,
		marginBottom: isDesignTemplateSection ? 0 : 10,
		marginLeft: 0,
		marginRight: 0,
		blockWidth: template.element.firstElementChild?.tagName.toLowerCase() === 'a' ? 'auto' : '',
		blockAlign: '',
		items: [{ ...cloneData(defaultData), style: createStyleForType(type) }]
	};
	// 혼합 블록 및 mix-inner-slot 보유 박스 컨테이너: 내부 블록 배열 초기화
	if (isMixContainer(type)) {
		block.innerBlocks = [];
	}
	// title-list 블록: list-wrap 상태 초기화 (기본 예)
	if (templateCategories[type] === 'title-list' && template.element.querySelector('.list-wrap')) {
		block.useList = true;
		block.items.forEach(item => { item.listBlock = null; });
	}
	// list 블록: rows 구조 초기화
	if (templateCategories[type] === 'list') {
		ensureListRows(block);
	}
	// tab 블록: tabItems / tabCols 초기화
	if (templateCategories[type] === 'tab' && template.tabDefaults) {
		block.tabItems = cloneData(template.tabDefaults.items);
		block.tabCols = template.tabDefaults.cols || '4';
	}
	// accordion 블록: accordionItems / accordionSize 초기화
	if (templateCategories[type] === 'accordion' && template.accordionDefaults) {
		block.accordionItems = cloneData(template.accordionDefaults.items);
		block.accordionSize = template.accordionDefaults.size || '';
	}
	// discloser 블록: discloserTitle / discloserContent 초기화
	if (type === 'accordion-03' && template.discloserDefaults) {
		block.discloserTitle = template.discloserDefaults.title || 'Discloser';
		block.discloserContent = template.discloserDefaults.content || '';
	}
	// button 블록: 기본값 초기화
	if (templateCategories[type] === 'button') {
		block.blockWidth = type === 'button-00' ? '' : 'auto';
		block.btnSize = '';
		block.btnOpenType = 'default';
		if (type === 'button-05' || type === 'button-06') {
			block.btnIcon = 'ri-external-link-line';
		}
		if (type === 'button-05') {
			block.btnIconPos = 'before';
		}
	}
	// table 블록: 기본값 초기화
	if (templateCategories[type] === 'table') {
		initTableBlock(block);
	}
	// process 블록: 4개 기본 단계 초기화
	if (templateCategories[type] === 'process') {
		block.columns = 4;
		block.items = [
			{ title: '단계 1', sub: '설명', style: createStyleForType(type), innerBlocks: [] },
			{ title: '단계 2', sub: '설명', style: createStyleForType(type), innerBlocks: [] },
			{ title: '단계 3', sub: '설명', style: createStyleForType(type), innerBlocks: [] },
			{ title: '단계 4', sub: '', style: createStyleForType(type), innerBlocks: [] }
		];
	}
	return block;
}

let _placementToastTimer = null;
function showPlacementToast(message, type = 'error') {
	let toast = document.getElementById('placementToast');
	if (!toast) {
		toast = document.createElement('div');
		toast.id = 'placementToast';
		document.body.appendChild(toast);
	}
	toast.className = `placement-toast placement-toast--${type}`;
	toast.textContent = message;
	toast.classList.add('is-visible');
	clearTimeout(_placementToastTimer);
	_placementToastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

function validateBlockPlacement(type, targetBlockId = null, position = 'after') {
	const template = componentTemplates[type];
	if (!template?.blockRules) return { valid: true };
	const rules = template.blockRules;

	if (rules.requiresPredecessorType) {
		const required = [].concat(rules.requiresPredecessorType);
		// 삽입 위치 기준으로 앞에 오는 블록만 체크
		const insertIndex = targetBlockId
			? state.blocks.findIndex(b => b.id === targetBlockId) + (position === 'before' ? 0 : 1)
			: state.blocks.length;
		const precedingBlocks = state.blocks.slice(0, insertIndex);
		const exists = precedingBlocks.some(b => required.includes(b.type));
		if (!exists) {
			return {
				valid: false,
				message: rules.errorMessage || `이 블록은 ${required.join(', ')} 블록 하위에만 추가할 수 있습니다.`
			};
		}
	}

	if (rules.maxCount != null) {
		const existingCount = state.blocks.filter(b => b.type === type).length;
		if (existingCount >= rules.maxCount) {
			return {
				valid: false,
				message: rules.maxCountMsg || `이 블록은 최대 ${rules.maxCount}개까지만 배치할 수 있습니다.`
			};
		}
	}

	if (rules.discouraged) {
		return { valid: true, warning: rules.warningMessage };
	}

	return { valid: true };
}

function addBlock(type, targetBlockId = null, position = 'after') {
	const validation = validateBlockPlacement(type, targetBlockId, position);
	if (!validation.valid) {
		showPlacementToast(validation.message, 'error');
		return;
	}
	if (validation.warning) {
		showPlacementToast(validation.warning, 'warning');
	}
	pushHistory();
	const block = createBlock(type);
	const targetIndex = targetBlockId ? state.blocks.findIndex(item => item.id === targetBlockId) : -1;
	if (targetIndex >= 0) state.blocks.splice(targetIndex + (position === 'before' ? 0 : 1), 0, block);
	else state.blocks.push(block);
	render();
	const newEl = canvasGrid.querySelector(`[data-block-id="${block.id}"]`);
	if (newEl) newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	selectBlock(block.id);
}

function addDesignTemplate(type, targetBlockId = null, position = 'after') {
	const template = componentTemplates[type];
	const sectionTypes = template?.designSectionTypes || [];
	if (!sectionTypes.length) {
		addBlock(type, targetBlockId, position);
		return;
	}
	pushHistory();
	const blocks = sectionTypes.map(sectionType => createBlock(sectionType));
	const targetIndex = targetBlockId ? state.blocks.findIndex(item => item.id === targetBlockId) : -1;
	if (targetIndex >= 0) {
		state.blocks.splice(targetIndex + (position === 'before' ? 0 : 1), 0, ...blocks);
	} else {
		state.blocks.push(...blocks);
	}
	render();
	const firstBlock = blocks[0];
	const newEl = firstBlock ? canvasGrid.querySelector(`[data-block-id="${firstBlock.id}"]`) : null;
	if (newEl) newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	if (firstBlock) selectBlock(firstBlock.id);
}

function moveBlock(blockId, targetBlockId = null, position = 'after') {
	if (blockId === targetBlockId) return;
	pushHistory();
	const currentIndex = state.blocks.findIndex(block => block.id === blockId);
	if (currentIndex < 0) return;
	const [block] = state.blocks.splice(currentIndex, 1);
	const targetIndex = targetBlockId ? state.blocks.findIndex(item => item.id === targetBlockId) : -1;
	if (targetIndex >= 0) state.blocks.splice(targetIndex + (position === 'before' ? 0 : 1), 0, block);
	else state.blocks.push(block);
	render();
}

function removeBlock(blockId) {
	pushHistory();
	if (state.selectedItem?.blockId === blockId) state.selectedItem = null;
	state.blocks = state.blocks.filter(block => block.id !== blockId);
	render();
}

function convertAndInsertTitleBlock(payload, targetBlockId, demotedType) {
	pushHistory();
	const newTemplate = componentTemplates[demotedType];
	const newDefaultData = newTemplate?.getDefaultData ? newTemplate.getDefaultData() : {};

	if (payload.startsWith('new-block:') || payload.startsWith('new-design-template:')) {
		const block = createBlock(demotedType);
		const targetIndex = state.blocks.findIndex(b => b.id === targetBlockId);
		state.blocks.splice(targetIndex + 1, 0, block);
		render();
		const newEl = canvasGrid.querySelector(`[data-block-id="${block.id}"]`);
		if (newEl) newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		selectBlock(block.id);
	} else if (payload.startsWith('copy-block:')) {
		const srcBlock = state.blocks.find(b => b.id === payload.replace('copy-block:', ''));
		const block = createBlock(demotedType);
		// 원본 블록의 타이틀 텍스트 복사
		if (srcBlock?.items?.[0]?.title !== undefined) {
			block.items[0].title = srcBlock.items[0].title;
		}
		const targetIndex = state.blocks.findIndex(b => b.id === targetBlockId);
		state.blocks.splice(targetIndex + 1, 0, block);
		render();
		const newEl = canvasGrid.querySelector(`[data-block-id="${block.id}"]`);
		if (newEl) newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		selectBlock(block.id);
	} else if (payload.startsWith('existing-block:')) {
		const blockId = payload.replace('existing-block:', '');
		if (blockId === targetBlockId) return;
		const movingBlock = state.blocks.find(b => b.id === blockId);
		if (!movingBlock) return;
		// 기존 타이틀 텍스트 보존
		const savedTitle = movingBlock.items[0]?.title;
		// 타입 변경 및 items를 새 타입 기준으로 완전 재초기화 (HTML 태그 포함 템플릿 교체 보장)
		movingBlock.type = demotedType;
		movingBlock.items = [{
			...cloneData(newDefaultData),
			title: savedTitle !== undefined ? savedTitle : (newDefaultData.title || ''),
			style: createStyleForType(demotedType)
		}];
		const currentIndex = state.blocks.findIndex(b => b.id === blockId);
		state.blocks.splice(currentIndex, 1);
		const targetIndex = state.blocks.findIndex(b => b.id === targetBlockId);
		state.blocks.splice(targetIndex + 1, 0, movingBlock);
		render();
		selectBlock(blockId);
	}
}

/* ── list 블록 동적 행 관리 ── */

function getListDepthConfig(templateElement) {
	const ulClasses = [];
	const hasMarker = !!templateElement.querySelector('span.mrk');
	function collectClasses(ulEl, depth) {
		ulClasses[depth] = ulEl.className || '';
		// 모든 li를 순회해서 중첩 ul을 찾음 (list-01은 두 번째 li에만 중첩 ul이 있음)
		for (const liEl of ulEl.querySelectorAll(':scope > li')) {
			const innerUl = liEl.querySelector(':scope > ul');
			if (innerUl) { collectClasses(innerUl, depth + 1); break; }
		}
	}
	const rootUl = templateElement.querySelector('ul');
	if (rootUl) collectClasses(rootUl, 0);
	return { ulClasses, hasMarker };
}

function parseListTemplateStructure(templateElement, item, prefix) {
	const rootUl = templateElement.querySelector('ul');
	if (!rootUl) return [];
	let n = 0;
	function parseUl(ulEl) {
		return Array.from(ulEl.querySelectorAll(':scope > li')).map(liEl => {
			const textSpan = Array.from(liEl.querySelectorAll(':scope > [data-edit-field]'))
				.find(s => !s.classList.contains('mrk'));
			const oldKey = textSpan?.dataset.editField;
			const newKey = `${prefix}r${n++}`;
			item[newKey] = oldKey && item[oldKey] !== undefined
				? item[oldKey]
				: (textSpan?.textContent?.trim() || '새 항목');
			const innerUl = liEl.querySelector(':scope > ul');
			return { key: newKey, children: innerUl ? parseUl(innerUl) : [] };
		});
	}
	return parseUl(rootUl);
}

function ensureListRows(block) {
	if (templateCategories[block.type] !== 'list') return;
	const template = componentTemplates[block.type];
	if (!template) return;
	// 블록 ID 기반 prefix로 블록 간 키 충돌 방지
	const prefix = block.id.replace(/[^a-zA-Z0-9]/g, '_') + '_';
	block.items.forEach((item, idx) => {
		if (item.rows) return;
		item.rows = parseListTemplateStructure(template.element, item, `${prefix}${idx}_`);
	});
}

function renderListDynamically(block, item, columnIndex, templateElement, editable) {
	const config = getListDepthConfig(templateElement);
	const wrapDiv = document.createElement('div');
	function buildUl(rows, depth) {
		if (!rows || !rows.length) return null;
		const ul = document.createElement('ul');
		if (config.ulClasses[depth]) ul.className = config.ulClasses[depth];
		rows.forEach((row, idx) => {
			const li = document.createElement('li');
			if (config.hasMarker) {
				const mrk = document.createElement('span');
				mrk.className = 'mrk';
				mrk.textContent = depth === 0
					? String.fromCharCode(65 + idx)
					: String(idx + 1).padStart(2, '0');
				li.appendChild(mrk);
			}
			if (editable && block) {
				const textSpan = document.createElement('span');
				setFieldContent(textSpan, item[row.key] || '');
				textSpan.dataset.editField = row.key;
				textSpan.dataset.blockId = block.id;
				textSpan.dataset.columnIndex = String(columnIndex);
				li.appendChild(textSpan);
			} else {
				li.insertAdjacentHTML('beforeend', item[row.key] || '');
			}
			if (row.children && row.children.length > 0) {
				const childUl = buildUl(row.children, depth + 1);
				if (childUl) li.appendChild(childUl);
			}
			ul.appendChild(li);
		});
		return ul;
	}
	const rootUl = buildUl(item.rows, 0);
	if (rootUl) wrapDiv.appendChild(rootUl);
	if (!editable) stripEditorAttributes(wrapDiv);
	return wrapDiv;
}

let _rowSeq = 0;

function _newRowKey(block) {
	const prefix = block.id.replace(/[^a-zA-Z0-9]/g, '_');
	return `${prefix}_rX${_rowSeq++}`;
}

function addListRowToBlock(blockId) {
	const block = resolveBlockForRows(blockId);
	if (!block) return;
	ensureListRows(block);
	pushHistory();
	block.items.forEach(item => {
		if (!item.rows) item.rows = [];
		const newKey = _newRowKey(block);
		item[newKey] = '새 항목';
		item.rows.push({ key: newKey, children: [] });
	});
	render();
}

// 특정 행 뒤에 형제 행 추가 (같은 depth)
function addSiblingRowToBlock(blockId, afterRowKey) {
	const block = resolveBlockForRows(blockId);
	if (!block) return;
	ensureListRows(block);
	pushHistory();
	block.items.forEach(item => {
		if (!item.rows) return;
		function insertAfter(rows) {
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].key === afterRowKey) {
					const newKey = _newRowKey(block);
					item[newKey] = '새 항목';
					rows.splice(i + 1, 0, { key: newKey, children: [] });
					return true;
				}
				if (insertAfter(rows[i].children)) return true;
			}
			return false;
		}
		insertAfter(item.rows);
	});
	render();
}

// 특정 행의 children 배열 끝에 자식 행 추가
function addChildRowToBlock(blockId, parentRowKey) {
	const block = resolveBlockForRows(blockId);
	if (!block) return;
	ensureListRows(block);
	pushHistory();
	block.items.forEach(item => {
		if (!item.rows) return;
		function findRow(rows) {
			for (const row of rows) {
				if (row.key === parentRowKey) return row;
				const found = findRow(row.children);
				if (found) return found;
			}
			return null;
		}
		const parent = findRow(item.rows);
		if (!parent) return;
		const newKey = _newRowKey(block);
		item[newKey] = '새 항목';
		parent.children.push({ key: newKey, children: [] });
	});
	render();
}

function removeListRowFromBlock(blockId, rowKey) {
	const block = resolveBlockForRows(blockId);
	if (!block) return;
	function findAndRemove(rows) {
		for (let i = 0; i < rows.length; i++) {
			if (rows[i].key === rowKey) return rows.splice(i, 1)[0];
			const found = findAndRemove(rows[i].children);
			if (found) return found;
		}
		return null;
	}
	function collectKeys(row) {
		return [row.key, ...row.children.flatMap(collectKeys)];
	}
	pushHistory();
	block.items.forEach(item => {
		if (!item.rows) return;
		const removed = findAndRemove(item.rows);
		if (removed) collectKeys(removed).forEach(k => delete item[k]);
	});
	render();
}

function renderPropsListRows(block) {
	const container = document.getElementById('propsListRowsContainer');
	if (!container) return;
	const item = block.items[0];
	if (!item || !item.rows) { container.innerHTML = ''; return; }

	const template = componentTemplates[block.type];
	const maxDepth = template ? getListDepthConfig(template.element).ulClasses.length - 1 : 3;

	const flat = [];
	function flatten(rows, depth) {
		rows.forEach(row => {
			flat.push({ row, depth, siblings: rows });
			flatten(row.children, depth + 1);
		});
	}
	flatten(item.rows, 0);

	container.innerHTML = flat.map(({ row, depth, siblings }) => {
		const rawText = (item[row.key] || '').replace(/<[^>]+>/g, '').slice(0, 22) || '(빈 항목)';
		const canRemove = !(depth === 0 && siblings.length <= 1);
		const canAddChild = depth < maxDepth;
		return `<div class="props-list-row">
			<span class="props-list-row-indent" style="width:${depth * 12}px;flex-shrink:0"></span>
			<span class="props-list-row-dot"></span>
			<span class="props-list-row-text">${rawText}</span>
			<button type="button" class="props-list-row-add-btn" data-block-id="${block.id}" data-row-key="${row.key}" title="아래에 행 추가">
				<i class="ri-add-line"></i>
			</button>
			<button type="button" class="props-list-row-child-btn" data-block-id="${block.id}" data-row-key="${row.key}" title="하위 행 추가"${canAddChild ? '' : ' disabled'}>
				<i class="ri-corner-down-right-line"></i>
			</button>
			<button type="button" class="props-list-row-remove-btn" data-block-id="${block.id}" data-row-key="${row.key}" title="행 삭제"${canRemove ? '' : ' disabled'}>
				<i class="ri-subtract-line"></i>
			</button>
		</div>`;
	}).join('');
	// 이벤트는 컨테이너 위임 방식으로 처리 (initBlockPropsPanelRowDelegation에서 등록)
}

/* ── table 블록 동적 렌더링 ── */

let _tableRowSeq = 0;

function _newTableRowKey(block) {
	const prefix = block.id.replace(/[^a-zA-Z0-9]/g, '_');
	return `${prefix}_tr${_tableRowSeq++}`;
}

function initTableBlock(block) {
	block.tableColCount = 4;
	block.tableColWidthMode = 'auto';
	block.tableColWidths = ['25%', '25%', '25%', '25%'];
	block.tableHasThead = true;
	block.tableHasTbody = true;
	block.tableHasTfoot = false;

	const item = block.items[0];

	const r0 = _newTableRowKey(block);
	block.tableTheadRows = [{ key: r0, thAlign: '', tdAlign: '' }];
	for (let c = 0; c < 4; c++) item[`${r0}_c${c}`] = 'th';

	const r1 = _newTableRowKey(block);
	const r2 = _newTableRowKey(block);
	block.tableTbodyRows = [
		{ key: r1, thAlign: '', tdAlign: '', cellTags: Array(4).fill('td') },
		{ key: r2, thAlign: '', tdAlign: '', cellTags: Array(4).fill('td') }
	];
	for (let c = 0; c < 4; c++) item[`${r1}_c${c}`] = 'td';
	for (let c = 0; c < 4; c++) item[`${r2}_c${c}`] = 'td';

	block.tableTfootRows = [];
	if (!block.cellSpan) block.cellSpan = {};
	if (!block.tableScroll) block.tableScroll = '';
}

function generateTableCaption(block, item) {
	const colCount = block.tableColCount || 4;
	let texts = [];

	if (block.tableHasThead && block.tableTheadRows && block.tableTheadRows.length > 0) {
		const row = block.tableTheadRows[0];
		for (let c = 0; c < colCount; c++) {
			const t = (item[`${row.key}_c${c}`] || '').replace(/<[^>]+>/g, '').trim();
			if (t) texts.push(t);
		}
	}

	if (texts.length === 0 && block.tableTbodyRows && block.tableTbodyRows.length > 0) {
		const row = block.tableTbodyRows[0];
		for (let c = 0; c < colCount; c++) {
			const t = (item[`${row.key}_c${c}`] || '').replace(/<[^>]+>/g, '').trim();
			if (t) texts.push(t);
		}
	}

	if (texts.length === 0) return '테이블 정보를 보여주는 테이블입니다.';
	return `${texts.join(', ')} 정보를 보여주는 테이블입니다.`;
}

function _computeTableHiddenCells(block, rows) {
	const hiddenCells = new Set();
	const colCount = block.tableColCount || 4;
	const cellSpan = block.cellSpan || {};
	rows.forEach((rowData, rowIdx) => {
		for (let c = 0; c < colCount; c++) {
			const cellKey = `${rowData.key}_c${c}`;
			if (hiddenCells.has(cellKey)) continue;
			const span = cellSpan[cellKey];
			if (!span) continue;
			const colspan = Math.min(Math.max(span.colspan || 1, 1), colCount - c);
			const rowspan = Math.min(Math.max(span.rowspan || 1, 1), rows.length - rowIdx);
			for (let dr = 0; dr < rowspan; dr++) {
				for (let dc = 0; dc < colspan; dc++) {
					if (dr === 0 && dc === 0) continue;
					const futureRow = rows[rowIdx + dr];
					if (!futureRow) continue;
					hiddenCells.add(`${futureRow.key}_c${c + dc}`);
				}
			}
		}
	});
	return hiddenCells;
}

function _buildTableTr(block, item, rowData, sectionTag, editable, hiddenCells) {
	const tr = document.createElement('tr');
	const colCount = block.tableColCount || 4;
	const isThSection = sectionTag === 'thead' || sectionTag === 'tfoot';
	const cellSpan = block.cellSpan || {};

	for (let c = 0; c < colCount; c++) {
		const cellKey = `${rowData.key}_c${c}`;
		if (hiddenCells && hiddenCells.has(cellKey)) continue;
		// thead: always th; tfoot/tbody: respect per-cell cellTags
		const cellTag = sectionTag === 'thead' ? 'th' : (rowData.cellTags?.[c] || (sectionTag === 'tfoot' ? 'th' : 'td'));
		const alignVal = (rowData.cellAligns?.[c]) ?? (cellTag === 'th' ? (rowData.thAlign || '') : (rowData.tdAlign || ''));
		const cell = document.createElement(cellTag);
		if (alignVal) cell.className = alignVal;
		if (cellTag === 'th') cell.setAttribute('scope', sectionTag === 'thead' ? 'col' : 'row');
		const span = cellSpan[cellKey];
		if (span?.colspan > 1) cell.setAttribute('colspan', String(span.colspan));
		if (span?.rowspan > 1) cell.setAttribute('rowspan', String(span.rowspan));

		const isBlockZone = !!(block.tableCellBlockZones?.[cellKey]);
		if (isBlockZone && editable) {
			cell.dataset.cellBlockZone = 'true';
			cell.dataset.blockId = block.id;
			cell.dataset.cellKey = cellKey;
		}

		const innerBlockData = block.tableCellInnerBlocks?.[cellKey];
		if (isBlockZone && innerBlockData) {
			const innerTemplate = componentTemplates[innerBlockData.type];
			if (innerTemplate) {
				const isListInner = templateCategories[innerBlockData.type] === 'list';
				const fakeBlock = { id: `${block.id}::tcell::${cellKey}`, type: innerBlockData.type, columns: innerBlockData.items?.length || 1, items: innerBlockData.items };
				const zoneEl = document.createElement('div');
				zoneEl.className = 'table-cell-block-zone has-block';
				if (editable) {
					const propsHtml = isListInner
						? `<button type="button" class="table-cell-inner-props inner-block-btn inner-block-btn--props" data-tcell-inner-props-id="${escapeAttr(`${block.id}::tcell::${cellKey}`)}" title="행 관리" aria-label="행 관리"><i class="ri-list-settings-line"></i></button>`
						: '';
					const removeHtml = `<button type="button" class="table-cell-inner-remove inner-block-btn inner-block-btn--remove" data-block-id="${escapeAttr(block.id)}" data-cell-key="${escapeAttr(cellKey)}" title="블록 제거"><i class="ri-close-line"></i></button>`;
					zoneEl.insertAdjacentHTML('afterbegin', _innerBlockActionsHtml(propsHtml, removeHtml));
				}
				let innerEl;
				if (isListInner && fakeBlock.items[0]?.rows) {
					innerEl = renderListDynamically(fakeBlock, fakeBlock.items[0], 0, innerTemplate.element, false);
				} else {
					innerEl = buildColumnBlock(innerTemplate, fakeBlock, false, editable);
				}
				if (typeof innerEl === 'string') { zoneEl.innerHTML += innerEl; }
				else { zoneEl.appendChild(innerEl); }
				cell.appendChild(zoneEl);
			}
		} else if (isBlockZone) {
			const zoneEl = document.createElement('div');
			zoneEl.className = 'table-cell-block-zone is-empty';
			if (editable) {
				zoneEl.dataset.cellBlockZone = 'true';
				zoneEl.dataset.blockId = block.id;
				zoneEl.dataset.cellKey = cellKey;
			}
			zoneEl.innerHTML = '<div class="mix-slot-placeholder"><i class="ri-add-circle-line"></i> 디자인 블록을 드래그해서 넣으세요.</div>';
			cell.appendChild(zoneEl);
		} else {
			cell.innerHTML = item[cellKey] || '';
		}

		if (editable) {
			cell.dataset.editField = cellKey;
			cell.dataset.blockId = block.id;
			cell.dataset.columnIndex = '0';
			cell.dataset.tableSection = sectionTag;
			cell.dataset.tableRowKey = rowData.key;
			cell.dataset.tableColIdx = String(c);
		}
		tr.appendChild(cell);
	}
	return tr;
}

function renderTableDynamically(block, item, columnIndex, editable) {
	const wrapper = document.createElement('div');
	wrapper.className = block.tableScroll ? `tbl-st ${block.tableScroll}` : 'tbl-st';

	const table = document.createElement('table');

	const caption = document.createElement('caption');
	caption.textContent = generateTableCaption(block, item);
	table.appendChild(caption);

	const colgroup = document.createElement('colgroup');
	const colCount = block.tableColCount || 4;
	if (block.tableColWidthMode === 'manual' && Array.isArray(block.tableColWidths) && block.tableColWidths.length === colCount) {
		block.tableColWidths.forEach(w => {
			const col = document.createElement('col');
			col.style.width = w;
			colgroup.appendChild(col);
		});
	} else {
		const col = document.createElement('col');
		col.setAttribute('span', String(colCount));
		col.style.width = `calc(100% / ${colCount})`;
		colgroup.appendChild(col);
	}
	table.appendChild(colgroup);

	if (block.tableHasThead && block.tableTheadRows && block.tableTheadRows.length) {
		const thead = document.createElement('thead');
		const theadHidden = _computeTableHiddenCells(block, block.tableTheadRows);
		block.tableTheadRows.forEach(row => thead.appendChild(_buildTableTr(block, item, row, 'thead', editable, theadHidden)));
		table.appendChild(thead);
	}

	if (block.tableHasTbody && block.tableTbodyRows && block.tableTbodyRows.length) {
		const tbody = document.createElement('tbody');
		const tbodyHidden = _computeTableHiddenCells(block, block.tableTbodyRows);
		block.tableTbodyRows.forEach(row => tbody.appendChild(_buildTableTr(block, item, row, 'tbody', editable, tbodyHidden)));
		table.appendChild(tbody);
	}

	if (block.tableHasTfoot && block.tableTfootRows && block.tableTfootRows.length) {
		const tfoot = document.createElement('tfoot');
		const tfootHidden = _computeTableHiddenCells(block, block.tableTfootRows);
		block.tableTfootRows.forEach(row => tfoot.appendChild(_buildTableTr(block, item, row, 'tfoot', editable, tfootHidden)));
		table.appendChild(tfoot);
	}

	wrapper.appendChild(table);
	if (!editable) stripEditorAttributes(wrapper);
	return wrapper;
}

function _addTableSection(block, sectionTag) {
	const hasKey = sectionTag === 'thead' ? 'tableHasThead' : sectionTag === 'tfoot' ? 'tableHasTfoot' : 'tableHasTbody';
	const rowsKey = sectionTag === 'thead' ? 'tableTheadRows' : sectionTag === 'tfoot' ? 'tableTfootRows' : 'tableTbodyRows';
	block[hasKey] = true;
	if (!block[rowsKey] || !block[rowsKey].length) {
		block[rowsKey] = [];
		_addTableRow(block, sectionTag);
	}
}

function _removeTableSection(block, sectionTag) {
	if (sectionTag === 'tbody') return;
	const hasKey = sectionTag === 'thead' ? 'tableHasThead' : 'tableHasTfoot';
	const rowsKey = sectionTag === 'thead' ? 'tableTheadRows' : 'tableTfootRows';
	const colCount = block.tableColCount || 4;
	const rows = block[rowsKey] || [];
	rows.forEach(row => {
		for (let c = 0; c < colCount; c++) {
			block.items.forEach(item => { delete item[`${row.key}_c${c}`]; });
			if (block.cellSpan) delete block.cellSpan[`${row.key}_c${c}`];
		}
	});
	block[hasKey] = false;
	block[rowsKey] = [];
}

function _addTableRow(block, sectionTag) {
	const rowsKey = sectionTag === 'thead' ? 'tableTheadRows' : sectionTag === 'tfoot' ? 'tableTfootRows' : 'tableTbodyRows';
	if (!block[rowsKey]) block[rowsKey] = [];
	const rowKey = _newTableRowKey(block);
	const rowInit = { key: rowKey, thAlign: '', tdAlign: '' };
	if (sectionTag === 'tbody') rowInit.cellTags = Array(block.tableColCount || 4).fill('td');
	block[rowsKey].push(rowInit);
	const colCount = block.tableColCount || 4;
	const defaultContent = sectionTag === 'tbody' ? 'td' : 'th';
	block.items.forEach(item => {
		for (let c = 0; c < colCount; c++) item[`${rowKey}_c${c}`] = defaultContent;
	});
}

function _removeTableRow(block, sectionTag, rowKey) {
	const rowsKey = sectionTag === 'thead' ? 'tableTheadRows' : sectionTag === 'tfoot' ? 'tableTfootRows' : 'tableTbodyRows';
	const rows = block[rowsKey] || [];
	if (sectionTag === 'tbody' && rows.length <= 1) return;
	const idx = rows.findIndex(r => r.key === rowKey);
	if (idx < 0) return;
	rows.splice(idx, 1);
	const colCount = block.tableColCount || 4;
	block.items.forEach(item => {
		for (let c = 0; c < colCount; c++) delete item[`${rowKey}_c${c}`];
	});
	if (block.cellSpan) {
		for (let c = 0; c < colCount; c++) delete block.cellSpan[`${rowKey}_c${c}`];
	}
}

function _syncTableCellKeys(block, oldCount, newCount) {
	const sectionDefs = [
		{ rowsKey: 'tableTheadRows', sectionTag: 'thead' },
		{ rowsKey: 'tableTbodyRows', sectionTag: 'tbody' },
		{ rowsKey: 'tableTfootRows', sectionTag: 'tfoot' }
	];
	sectionDefs.forEach(({ rowsKey, sectionTag }) => {
		const rows = block[rowsKey] || [];
		const defaultContent = sectionTag === 'tbody' ? 'td' : 'th';
		rows.forEach(row => {
			if (newCount > oldCount) {
				block.items.forEach(item => {
					for (let c = oldCount; c < newCount; c++) item[`${row.key}_c${c}`] = defaultContent;
				});
				if (sectionTag === 'tbody') {
					if (!row.cellTags) row.cellTags = Array(oldCount).fill('td');
					for (let c = oldCount; c < newCount; c++) row.cellTags.push('td');
				}
			} else {
				block.items.forEach(item => {
					for (let c = newCount; c < oldCount; c++) delete item[`${row.key}_c${c}`];
				});
				if (block.cellSpan) {
					for (let c = newCount; c < oldCount; c++) delete block.cellSpan[`${row.key}_c${c}`];
				}
				if (sectionTag === 'tbody' && row.cellTags) {
					row.cellTags = row.cellTags.slice(0, newCount);
				}
			}
		});
	});
}

function _renderTableSectionRows(block, sectionTag, rows) {
	if (!rows || !rows.length) return '';
	const colCount = block.tableColCount || 4;
	return `<div class="props-table-mini" style="--props-table-cols:${colCount + 1}">${rows.map((row, idx) => {
		const removeDisabled = sectionTag === 'tbody' && rows.length <= 1;
		const cellTags = row.cellTags || [];
		const rowControls = `<span class="props-table-mini-cell props-table-row-control-cell">
			<button type="button" class="props-list-row-remove-btn props-table-tr-remove-btn" data-block-id="${block.id}" data-section="${sectionTag}" data-row-key="${row.key}" title="행 삭제"${removeDisabled ? ' disabled' : ''}><i class="ri-subtract-line"></i></button>
		</span>`;
		const cells = Array.from({ length: colCount }, (_, c) => {
			const cellKey = `${row.key}_c${c}`;
			// thead: always th, no toggle
			if (sectionTag === 'thead') {
				return `<span class="props-table-mini-cell is-th" title="${cellKey}"><span class="props-mini-cell-tag">th</span></span>`;
			}
			// tfoot / tbody
			const defaultTag = sectionTag === 'tfoot' ? 'th' : 'td';
			const t = cellTags[c] || defaultTag;
			const isBlockZone = !!(block.tableCellBlockZones?.[cellKey]);
			const hasInner = !!(block.tableCellInnerBlocks?.[cellKey]);
			// tbody td: tag toggle btn + zone toggle btn
			if (sectionTag === 'tbody' && t === 'td') {
				return `<div class="props-table-mini-cell${isBlockZone ? ' is-block-zone' : ''}" title="${cellKey}">
					<button type="button" class="props-mini-cell-tag-btn props-table-cell-tag-btn" data-block-id="${block.id}" data-row-key="${row.key}" data-col-idx="${c}" data-section="tbody" title="th/td 전환">td</button>
					<button type="button" class="props-mini-cell-zone-btn${isBlockZone ? ' is-active' : ''}" data-block-id="${block.id}" data-row-key="${row.key}" data-col-idx="${c}" data-cell-key="${cellKey}" title="디자인블록으로 변경${isBlockZone ? ' (해제)' : ''}"><i class="ri-layout-grid-line" aria-hidden="true"></i></button>
				</div>`;
			}
			// tfoot or tbody th: single toggle button
			return `<button type="button" class="props-table-mini-cell is-th props-table-cell-tag-btn" data-block-id="${block.id}" data-row-key="${row.key}" data-col-idx="${c}" data-section="${sectionTag}" title="th/td 전환"><span class="props-mini-cell-tag">${t}</span></button>`;
		}).join('');
		return `<div class="props-table-mini-row">
			<div class="props-table-mini-cells">${rowControls}${cells}</div>
		</div>`;
	}).join('')}</div>`;
}

function _renderTableSectionAlignControls(block, sectionTag, rows) {
	if (!rows || !rows.length) return '';
	const getSharedAlign = () => {
		const first = rows[0]?.thAlign || '';
		const sameTh = rows.every(row => (row.thAlign || '') === first);
		if (sectionTag !== 'tbody') return sameTh ? first : '';
		const sameTd = rows.every(row => (row.tdAlign || '') === first);
		return sameTh && sameTd ? first : '';
	};
	const currentAlign = getSharedAlign();
	const alignBtnGroup = ['al', 'ac', 'ar'].map(a => `<button type="button" class="props-table-align-btn${currentAlign === a ? ' is-active' : ''}" data-block-id="${block.id}" data-section="${sectionTag}" data-row-key="__all__" data-cell-type="all" data-align="${a}" title="${a === 'al' ? '왼쪽' : a === 'ac' ? '중앙' : '오른쪽'}"><i class="ri-align-${a === 'al' ? 'left' : a === 'ac' ? 'center' : 'right'}"></i></button>`).join('');
	return `<div class="props-table-row-aligns props-table-section-aligns">
		<div class="props-table-align-btns"><span class="props-table-align-label">정렬</span>${alignBtnGroup}</div>
	</div>`;
}

function renderPropsTableStructure(block) {
	const container = document.getElementById('propsTableStructure');
	if (!container) return;

	const sections = [
		{ tag: 'thead', hasKey: 'tableHasThead', rowsKey: 'tableTheadRows', canRemove: true },
		{ tag: 'tbody', hasKey: 'tableHasTbody', rowsKey: 'tableTbodyRows', canRemove: false },
		{ tag: 'tfoot', hasKey: 'tableHasTfoot', rowsKey: 'tableTfootRows', canRemove: true }
	];

	container.innerHTML = sections.map(({ tag, hasKey, rowsKey, canRemove }) => {
		const hasSection = !!block[hasKey];
		const rows = block[rowsKey] || [];

		if (!hasSection) {
			return `<div class="props-table-section-wrap">
				<div class="props-table-outer-heading">
					<p class="props-section-label props-table-outer-label">${tag}</p>
				</div>
				<div class="props-table-section-empty props-table-section-box">
					<button type="button" class="props-add-row-btn props-table-add-section-btn" data-block-id="${block.id}" data-section="${tag}">
						<i class="ri-add-line" aria-hidden="true"></i> ${tag} 추가
					</button>
				</div>
			</div>`;
		}

		return `<div class="props-table-section-wrap">
			<div class="props-table-outer-heading">
				<p class="props-section-label props-table-outer-label">${tag}</p>
				${canRemove ? `<button type="button" class="props-table-title-text-btn props-table-remove-section-btn" data-block-id="${block.id}" data-remove-section="${tag}">사용하지 않기</button>` : ''}
				${_renderTableSectionAlignControls(block, tag, rows)}
			</div>
			<div class="props-table-section-group props-table-section-box">
				${_renderTableSectionRows(block, tag, rows)}
				<div class="props-table-bottom-actions">
					<button type="button" class="props-table-bottom-btn" data-block-id="${block.id}" data-add-tr="${tag}">
						<i class="ri-add-line" aria-hidden="true"></i> 행 추가
					</button>
				</div>
			</div>
		</div>`;
	}).join('');
}

function renderPropsTableSection(block) {
	const colCountInput = document.getElementById('propTableColCount');
	const colWidthModeSelect = document.getElementById('propTableColWidthMode');
	const colWidthsCard = document.getElementById('propsTableColWidthsCard');
	const colWidthsContainer = document.getElementById('propsTableColWidthsContainer');
	const notice = document.getElementById('propsTableColWidthsNotice');

	if (colCountInput) colCountInput.value = block.tableColCount || 4;
	if (colWidthModeSelect) colWidthModeSelect.value = block.tableColWidthMode || 'auto';
	const scrollSelect = document.getElementById('propTableScroll');
	if (scrollSelect) scrollSelect.value = block.tableScroll || '';

	const isManual = block.tableColWidthMode === 'manual';
	if (colWidthsCard) colWidthsCard.style.display = isManual ? '' : 'none';
	if (notice) notice.style.display = 'none';

	if (isManual && colWidthsContainer) {
		const colCount = block.tableColCount || 4;
		const widths = Array.isArray(block.tableColWidths) && block.tableColWidths.length === colCount
			? block.tableColWidths
			: Array(colCount).fill('');
		colWidthsContainer.innerHTML = Array.from({ length: colCount }, (_, i) => `
			<div class="props-row${i === colCount - 1 ? ' props-row--last' : ''}">
				<span class="props-label">열 ${i + 1}</span>
				<div class="props-input-unit">
					<input type="text" class="props-input props-table-col-width-input" style="width:4rem" data-col-idx="${i}" placeholder="예:25" value="${escapeAttr((widths[i] || '').replace('%', ''))}">
					<span class="props-unit">%</span>
				</div>
			</div>`).join('');
	}

	renderPropsTableStructure(block);
}

function getTableRowsKey(sectionTag) {
	return sectionTag === 'thead' ? 'tableTheadRows' : sectionTag === 'tfoot' ? 'tableTfootRows' : 'tableTbodyRows';
}

let _tableCellPopoverInfo = null;
let _tableCellDragEventsBound = false;
let _tableSelection = null;

function openTableCellSpanPopover(cell) {
	if (document.body.classList.contains('preview-mode')) return;
	const blockId = cell.dataset.blockId;
	const cellKey = cell.dataset.editField;
	const sectionTag = cell.dataset.tableSection;
	if (!blockId || !cellKey || !sectionTag) return;

	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;

	if (!block.cellSpan) block.cellSpan = {};
	const span = block.cellSpan[cellKey] || {};

	const rowsKey = sectionTag === 'thead' ? 'tableTheadRows' : sectionTag === 'tfoot' ? 'tableTfootRows' : 'tableTbodyRows';
	const rows = block[rowsKey] || [];
	const rowKey = cell.dataset.tableRowKey;
	const rowIdx = rows.findIndex(r => r.key === rowKey);
	const colCount = block.tableColCount || 4;
	const parts = cellKey.split('_c');
	const colIdx = parseInt(parts[parts.length - 1]);
	const maxColspan = colCount - colIdx;
	const maxRowspan = rows.length - rowIdx;

	const popover = document.getElementById('tableCellSpanPopover');
	if (!popover) return;

	const colspanInput = document.getElementById('tableCellColspan');
	const rowspanInput = document.getElementById('tableCellRowspan');
	if (colspanInput) { colspanInput.value = span.colspan || 1; colspanInput.max = String(maxColspan); }
	if (rowspanInput) { rowspanInput.value = span.rowspan || 1; rowspanInput.max = String(maxRowspan); }

	_tableCellPopoverInfo = { blockId, cellKey };

	const rect = cell.getBoundingClientRect();
	const popW = 180;
	let left = rect.left;
	if (left + popW > window.innerWidth - 10) left = window.innerWidth - popW - 10;
	let top = rect.top - 120;
	if (top < 8) top = rect.bottom + 6;

	popover.style.left = `${left}px`;
	popover.style.top = `${top}px`;
	popover.style.display = 'block';
}

function closeTableCellSpanPopover() {
	const popover = document.getElementById('tableCellSpanPopover');
	if (popover) popover.style.display = 'none';
	_tableCellPopoverInfo = null;
}

function applyTableCellSpan() {
	if (!_tableCellPopoverInfo) return;
	const { blockId, cellKey } = _tableCellPopoverInfo;
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;

	const colspan = Math.max(1, parseInt(document.getElementById('tableCellColspan')?.value) || 1);
	const rowspan = Math.max(1, parseInt(document.getElementById('tableCellRowspan')?.value) || 1);

	if (!block.cellSpan) block.cellSpan = {};
	if (colspan === 1 && rowspan === 1) {
		delete block.cellSpan[cellKey];
	} else {
		block.cellSpan[cellKey] = { colspan, rowspan };
	}

	pushHistory();
	closeTableCellSpanPopover();
	render();
}

function getTableCellDragInfo(cell) {
	const blockId = cell.dataset.blockId;
	const cellKey = cell.dataset.editField;
	const sectionTag = cell.dataset.tableSection;
	const rowKey = cell.dataset.tableRowKey;
	const colIdx = parseInt(cell.dataset.tableColIdx, 10);
	if (!blockId || !cellKey || !sectionTag || !rowKey || Number.isNaN(colIdx)) return null;

	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return null;
	const rows = block[getTableRowsKey(sectionTag)] || [];
	const rowIdx = rows.findIndex(row => row.key === rowKey);
	if (rowIdx < 0) return null;
	return { block, blockId, cellKey, sectionTag, rowKey, rowIdx, colIdx };
}

function clearTableDragRange() {
	document.querySelectorAll('.is-table-drag-range').forEach(cell => cell.classList.remove('is-table-drag-range'));
}

function closeTableContextMenu(clearSelection = false) {
	const menu = document.getElementById('tableContextMenu');
	if (menu) menu.style.display = 'none';
	if (clearSelection) {
		_tableSelection = null;
		clearTableDragRange();
	}
}

function getTableSelectionBounds(start, end) {
	if (!start || !end || start.blockId !== end.blockId || start.sectionTag !== end.sectionTag) return null;
	const minRow = Math.min(start.rowIdx, end.rowIdx);
	const maxRow = Math.max(start.rowIdx, end.rowIdx);
	const minCol = Math.min(start.colIdx, end.colIdx);
	const maxCol = Math.max(start.colIdx, end.colIdx);
	const rows = start.block[getTableRowsKey(start.sectionTag)] || [];
	const topLeftRow = rows[minRow];
	if (!topLeftRow) return null;
	return {
		block: start.block,
		blockId: start.blockId,
		sectionTag: start.sectionTag,
		rows,
		minRow,
		maxRow,
		minCol,
		maxCol,
		topLeftKey: `${topLeftRow.key}_c${minCol}`,
		colspan: maxCol - minCol + 1,
		rowspan: maxRow - minRow + 1,
		cellCount: (maxRow - minRow + 1) * (maxCol - minCol + 1)
	};
}

function updateTableDragRange(targetCell) {
	const drag = state.tableCellDrag;
	const target = targetCell ? getTableCellDragInfo(targetCell) : null;
	if (!drag || !target) return;
	if (drag.blockId !== target.blockId || drag.sectionTag !== target.sectionTag) return;

	drag.end = target;
	drag.moved = drag.moved || drag.start.rowIdx !== target.rowIdx || drag.start.colIdx !== target.colIdx;
	clearTableDragRange();

	const minRow = Math.min(drag.start.rowIdx, target.rowIdx);
	const maxRow = Math.max(drag.start.rowIdx, target.rowIdx);
	const minCol = Math.min(drag.start.colIdx, target.colIdx);
	const maxCol = Math.max(drag.start.colIdx, target.colIdx);
	const table = targetCell.closest('table');
	if (!table) return;

	table.querySelectorAll(`[data-block-id="${CSS.escape(drag.blockId)}"][data-table-section="${drag.sectionTag}"]`).forEach(cell => {
		const info = getTableCellDragInfo(cell);
		if (!info) return;
		if (info.rowIdx >= minRow && info.rowIdx <= maxRow && info.colIdx >= minCol && info.colIdx <= maxCol) {
			cell.classList.add('is-table-drag-range');
		}
	});
}

function startTableCellDrag(cell, event) {
	const start = getTableCellDragInfo(cell);
	if (!start) return;
	closeTableContextMenu(false);
	state.tableCellDrag = { start, end: start, blockId: start.blockId, sectionTag: start.sectionTag, moved: false };
	clearTableDragRange();
	cell.classList.add('is-table-drag-range');
	event.preventDefault();
	event.stopPropagation();
	document.body.classList.add('is-table-cell-dragging');
	closeTableCellSpanPopover();
}

function applyTableMerge(selection = _tableSelection) {
	if (!selection || selection.cellCount < 2) return;
	const { block, rows, minRow, maxRow, minCol, maxCol, topLeftKey, colspan, rowspan } = selection;

	if (!block.cellSpan) block.cellSpan = {};
	pushHistory();
	for (let r = minRow; r <= maxRow; r++) {
		const row = rows[r];
		if (!row) continue;
		for (let c = minCol; c <= maxCol; c++) {
			delete block.cellSpan[`${row.key}_c${c}`];
		}
	}
	block.cellSpan[topLeftKey] = { colspan, rowspan };
	closeTableContextMenu(true);
	render();
}

function splitTableCell(selection = _tableSelection) {
	if (!selection) return;
	const span = selection.block.cellSpan?.[selection.topLeftKey];
	if (!span || ((span.colspan || 1) <= 1 && (span.rowspan || 1) <= 1)) return;
	pushHistory();
	delete selection.block.cellSpan[selection.topLeftKey];
	closeTableContextMenu(true);
	render();
}

function alignTableSelection(align) {
	const selection = _tableSelection;
	if (!selection) return;
	const { rows, minRow, maxRow, minCol, maxCol } = selection;
	pushHistory();
	for (let r = minRow; r <= maxRow; r++) {
		const row = rows[r];
		if (!row) continue;
		if (!row.cellAligns) row.cellAligns = {};
		for (let c = minCol; c <= maxCol; c++) {
			row.cellAligns[c] = align;
		}
	}
	closeTableContextMenu(false);
	render();
}

function getTableContextMenu() {
	let menu = document.getElementById('tableContextMenu');
	if (menu) return menu;

	menu = document.createElement('div');
	menu.id = 'tableContextMenu';
	menu.className = 'table-context-menu';
	menu.innerHTML = `
		<div class="table-context-menu-group">
			<p class="table-context-menu-title">정렬</p>
			<div class="table-context-aligns">
				<button type="button" data-table-menu-align="al" title="왼쪽"><i class="ri-align-left" aria-hidden="true"></i></button>
				<button type="button" data-table-menu-align="ac" title="가운데"><i class="ri-align-center" aria-hidden="true"></i></button>
				<button type="button" data-table-menu-align="ar" title="오른쪽"><i class="ri-align-right" aria-hidden="true"></i></button>
			</div>
		</div>
		<button type="button" class="table-context-menu-item" data-table-menu-action="merge">셀 합치기</button>
		<button type="button" class="table-context-menu-item" data-table-menu-action="split">셀 나누기</button>
		<button type="button" class="table-context-menu-item" data-table-menu-action="block-zone">디자인블록으로 변경</button>
	`;
	document.body.appendChild(menu);

	menu.addEventListener('click', event => {
		const alignBtn = event.target.closest('[data-table-menu-align]');
		if (alignBtn) {
			alignTableSelection(alignBtn.dataset.tableMenuAlign);
			return;
		}
		const actionBtn = event.target.closest('[data-table-menu-action]');
		if (!actionBtn || actionBtn.disabled) return;
		if (actionBtn.dataset.tableMenuAction === 'merge') applyTableMerge();
		if (actionBtn.dataset.tableMenuAction === 'split') splitTableCell();
		if (actionBtn.dataset.tableMenuAction === 'block-zone') {
			const sel = _tableSelection;
			if (!sel || sel.sectionTag !== 'tbody') return;
			const { rows, minRow, maxRow, minCol, maxCol, blockId } = sel;
			pushHistory();
			const block = sel.block;
			if (!block.tableCellBlockZones) block.tableCellBlockZones = {};
			for (let r = minRow; r <= maxRow; r++) {
				const row = rows[r];
				if (!row) continue;
				for (let c = minCol; c <= maxCol; c++) {
					const cellTag = row.cellTags?.[c] || 'td';
					if (cellTag !== 'td') continue;
					const cellKey = `${row.key}_c${c}`;
					if (block.tableCellBlockZones[cellKey]) {
						delete block.tableCellBlockZones[cellKey];
						if (block.tableCellInnerBlocks?.[cellKey]) delete block.tableCellInnerBlocks[cellKey];
					} else {
						block.tableCellBlockZones[cellKey] = true;
						(block.items || []).forEach(item => { if (cellKey in item) item[cellKey] = ''; });
					}
				}
			}
			closeTableContextMenu(false);
			render();
			renderPropsTableSection(block);
		}
	});
	return menu;
}

function selectTableRange(start, end) {
	const bounds = getTableSelectionBounds(start, end);
	if (!bounds) return null;
	_tableSelection = bounds;
	clearTableDragRange();
	const table = document.querySelector(`[data-block-id="${CSS.escape(bounds.blockId)}"][data-table-section="${bounds.sectionTag}"]`)?.closest('table');
	if (!table) return bounds;
	table.querySelectorAll(`[data-block-id="${CSS.escape(bounds.blockId)}"][data-table-section="${bounds.sectionTag}"]`).forEach(cell => {
		const info = getTableCellDragInfo(cell);
		if (!info) return;
		if (info.rowIdx >= bounds.minRow && info.rowIdx <= bounds.maxRow && info.colIdx >= bounds.minCol && info.colIdx <= bounds.maxCol) {
			cell.classList.add('is-table-drag-range');
		}
	});
	return bounds;
}

function openTableContextMenu(cell, event) {
	if (document.body.classList.contains('preview-mode')) return;
	const info = getTableCellDragInfo(cell);
	if (!info) return;
	event.preventDefault();
	event.stopPropagation();
	closeTableCellSpanPopover();

	if (!_tableSelection || _tableSelection.blockId !== info.blockId || _tableSelection.sectionTag !== info.sectionTag ||
		info.rowIdx < _tableSelection.minRow || info.rowIdx > _tableSelection.maxRow ||
		info.colIdx < _tableSelection.minCol || info.colIdx > _tableSelection.maxCol) {
		selectTableRange(info, info);
	}

	const menu = getTableContextMenu();
	const canMerge = _tableSelection && _tableSelection.cellCount >= 2;
	const splitSpan = _tableSelection?.block.cellSpan?.[_tableSelection.topLeftKey];
	const canSplit = !!splitSpan && ((splitSpan.colspan || 1) > 1 || (splitSpan.rowspan || 1) > 1);
	menu.querySelector('[data-table-menu-action="merge"]').disabled = !canMerge;
	menu.querySelector('[data-table-menu-action="split"]').disabled = !canSplit;
	const blockZoneBtn = menu.querySelector('[data-table-menu-action="block-zone"]');
	const isInTbody = _tableSelection?.sectionTag === 'tbody';
	blockZoneBtn.style.display = isInTbody ? '' : 'none';
	if (isInTbody) {
		const sel = _tableSelection;
		let hasTd = false, hasSomeZone = false;
		for (let r = sel.minRow; r <= sel.maxRow; r++) {
			const row = sel.rows[r]; if (!row) continue;
			for (let c = sel.minCol; c <= sel.maxCol; c++) {
				const cellKey = `${row.key}_c${c}`;
				if ((row.cellTags?.[c] || 'td') === 'td') hasTd = true;
				if (sel.block.tableCellBlockZones?.[cellKey]) hasSomeZone = true;
			}
		}
		blockZoneBtn.disabled = !hasTd;
		blockZoneBtn.textContent = hasSomeZone ? '디자인블록 해제' : '디자인블록으로 변경';
	}

	menu.style.display = 'block';
	const mw = menu.offsetWidth;
	const mh = menu.offsetHeight;
	let left = event.clientX + 8;
	let top = event.clientY;
	if (left + mw > window.innerWidth - 8) left = event.clientX - mw - 8;
	if (top + mh > window.innerHeight - 8) top = window.innerHeight - mh - 8;
	menu.style.left = `${Math.max(8, left)}px`;
	menu.style.top = `${Math.max(8, top)}px`;
}

function finishTableCellDrag() {
	const drag = state.tableCellDrag;
	if (!drag) return;
	state.tableCellDrag = null;
	document.body.classList.remove('is-table-cell-dragging');

	const { start, end, moved } = drag;
	if (!moved || !end) {
		clearTableDragRange();
		return;
	}

	const minRow = Math.min(start.rowIdx, end.rowIdx);
	const maxRow = Math.max(start.rowIdx, end.rowIdx);
	const minCol = Math.min(start.colIdx, end.colIdx);
	const maxCol = Math.max(start.colIdx, end.colIdx);
	const colspan = maxCol - minCol + 1;
	const rowspan = maxRow - minRow + 1;
	if (colspan === 1 && rowspan === 1) {
		clearTableDragRange();
		return;
	}

	selectTableRange(start, end);
}

function renderPropsTabItems(block) {
	const container = document.getElementById('propsTabItemsContainer');
	if (!container) return;
	const items = block.tabItems || [];
	const TAB_TYPE_LABELS = { normal: '일반', new_window: '새창', disabled: '비활성' };
	container.innerHTML = items.map((item, idx) => {
		const canRemove = items.length > 1;
		const textVal = escapeAttr(item.text || '');
		return `<div class="props-list-row" data-tab-props-idx="${idx}">
			<input type="text" class="props-input props-tab-text-input" style="flex:1;min-width:0;height:1.5rem" data-block-id="${block.id}" data-tab-text-idx="${idx}" placeholder="탭 명칭 입력" value="${textVal}">
			<select class="props-select props-tab-type-select" data-tab-type-idx="${idx}" data-block-id="${block.id}" style="width:5rem;flex-shrink:0">
				<option value="normal"${item.type === 'normal' ? ' selected' : ''}>일반</option>
				<option value="new_window"${item.type === 'new_window' ? ' selected' : ''}>새창</option>
				<option value="disabled"${item.type === 'disabled' ? ' selected' : ''}>비활성</option>
			</select>
			<button type="button" class="props-list-row-remove-btn props-tab-remove-btn" data-tab-remove-idx="${idx}" data-block-id="${block.id}"${canRemove ? '' : ' disabled'}>
				<i class="ri-subtract-line"></i>
			</button>
		</div>`;
	}).join('');
}

function renderPropsButtonInnerItems(block) {
	const container = document.getElementById('propsButtonInnerContainer');
	if (!container) return;
	const items = block.innerBlocks || [];
	if (items.length === 0) {
		container.innerHTML = '<p style="color:#888;font-size:0.8rem;padding:0.3rem 0">추가된 버튼이 없습니다.</p>';
		return;
	}
	const BTN_TYPE_NAMES = { 'button-01': '주요버튼', 'button-02': '보조버튼', 'button-03': '기본버튼', 'button-04': '강조버튼', 'button-05': '아이콘버튼', 'button-06': '아이콘전용' };
	container.innerHTML = items.map((ib, idx) => {
		const typeName = BTN_TYPE_NAMES[ib.type] || ib.type;
		const isIconBtn = ib.type === 'button-05' || ib.type === 'button-06';
		const isNewWindow = (ib.btnOpenType || 'default') === 'new-window';
		const bid = escapeAttr(block.id);
		const sizeOpts = [['', '기본'], ['size-sm', 'Small'], ['size-lg', 'Large'], ['size-exlg', 'Extra Large']]
			.map(([v, l]) => `<option value="${v}"${(ib.btnSize || '') === v ? ' selected' : ''}>${l}</option>`).join('');
		const openOpts = [['default', '기본'], ['new-window', '새창']]
			.map(([v, l]) => `<option value="${v}"${(ib.btnOpenType || 'default') === v ? ' selected' : ''}>${l}</option>`).join('');
		const iconOpts = [['ri-external-link-line', '새창 아이콘'], ['ri-phone-fill', '전화 아이콘']]
			.map(([v, l]) => `<option value="${v}"${(ib.btnIcon || 'ri-external-link-line') === v ? ' selected' : ''}>${l}</option>`).join('');
		const posOpts = [['before', '텍스트 앞'], ['after', '텍스트 뒤']]
			.map(([v, l]) => `<option value="${v}"${(ib.btnIconPos || 'before') === v ? ' selected' : ''}>${l}</option>`).join('');
		return `<div class="props-card" style="margin-bottom:0.5rem">
			<div class="props-row" style="background:var(--color-tertiary,#f5f5f5);border-radius:0.2rem;padding:0.2rem 0.5rem">
				<span class="props-label" style="font-weight:700">${idx + 1}. ${typeName}</span>
			</div>
			<div class="props-row">
				<span class="props-label">크기</span>
				<select class="props-select props-btn-inner-size" data-block-id="${bid}" data-ib-idx="${idx}">${sizeOpts}</select>
			</div>
			<div class="props-row${!isIconBtn ? ' props-row--last' : ''}">
				<span class="props-label">이동 방식</span>
				<select class="props-select props-btn-inner-opentype" data-block-id="${bid}" data-ib-idx="${idx}">${openOpts}</select>
			</div>
			${isIconBtn ? `<div class="props-row">
				<span class="props-label">아이콘</span>
				<select class="props-select props-btn-inner-icon" data-block-id="${bid}" data-ib-idx="${idx}"${isNewWindow ? ' disabled' : ''}>${iconOpts}</select>
			</div>` : ''}
			${ib.type === 'button-05' ? `<div class="props-row${ib.type === 'button-05' ? ' props-row--last' : ''}">
				<span class="props-label">아이콘 위치</span>
				<select class="props-select props-btn-inner-iconpos" data-block-id="${bid}" data-ib-idx="${idx}">${posOpts}</select>
			</div>` : ''}
			${ib.type === 'button-06' ? `<div class="props-row props-row--last" style="flex-direction:column;align-items:stretch;gap:0.3rem">
				<span class="props-label">버튼 목적 (숨김 텍스트)</span>
				<div style="display:flex;gap:0.3rem">
					<input type="text" class="props-input props-btn-inner-hid" data-block-id="${bid}" data-ib-idx="${idx}"
						style="flex:1;text-align:left;height:1.5rem" value="${escapeAttr((ib.items[0] || {}).hid || '')}" placeholder="예: 전화 연결">
					<button type="button" class="props-add-row-btn props-btn-inner-apply-hid" data-block-id="${bid}" data-ib-idx="${idx}" style="padding:0 0.5rem;margin:0;flex-shrink:0">적용</button>
				</div>
			</div>` : ''}
		</div>`;
	}).join('');
}

function renderPropsAccordionItems(block) {
	const container = document.getElementById('propsAccordionItemsContainer');
	if (!container) return;
	const items = block.accordionItems || [];
	container.innerHTML = items.map((item, idx) => {
		const canRemove = items.length > 1;
		const textVal = escapeAttr(item.text || '');
		const contentVal = escapeHtml(item.content || '');
		return `<div class="props-list-row" style="flex-wrap:wrap;align-items:flex-start;padding:0.4rem 0.5rem;gap:0.25rem">
			<span class="props-list-row-dot" style="margin-top:0.35rem;flex-shrink:0"></span>
			<input type="text" class="props-input props-accordion-text-input" style="flex:1;min-width:0;height:1.5rem"
				data-block-id="${block.id}" data-item-idx="${idx}"
				placeholder="메뉴명 입력" value="${textVal}">
			<label style="display:inline-flex;align-items:center;gap:0.2rem;font-size:0.575rem;flex-shrink:0;cursor:pointer">
				<input type="checkbox" class="props-accordion-dis-check"
					data-block-id="${block.id}" data-item-idx="${idx}"${item.disabled ? ' checked' : ''}>
				비활성
			</label>
			${canRemove ? `<button type="button" class="props-list-row-remove-btn props-accordion-remove-btn" data-block-id="${block.id}" data-item-idx="${idx}" title="항목 삭제"><i class="ri-subtract-line"></i></button>` : '<span style="width:1.25rem;flex-shrink:0"></span>'}
			<textarea class="props-input props-accordion-content-input" style="flex:1 0 100%;min-width:0;width:100%;height:3rem;resize:vertical;margin-top:0.2rem;line-height:1.4"
				data-block-id="${block.id}" data-item-idx="${idx}"
				placeholder="내용 입력 (비우면 '내용이 없습니다.' 표시)">${contentVal}</textarea>
		</div>`;
	}).join('');
}

let _propsBlockId = null;

function openBlockProps(blockId) {
	let block = state.blocks.find(b => b.id === blockId);
	let isMixInnerBlock = false;
	if (!block) {
		const mixRef = resolveMixInnerRef(blockId);
		if (mixRef) {
			block = { id: blockId, type: mixRef.innerBlock.type, items: mixRef.innerBlock.items, blockWidth: null, marginBottom: mixRef.innerBlock.marginBottom ?? 10, blockAlign: '' };
			isMixInnerBlock = true;
		} else {
			const tcellRef = resolveTableCellInnerRef(blockId);
			if (!tcellRef) return;
			block = { id: blockId, type: tcellRef.innerBlockData.type, items: tcellRef.innerBlockData.items, blockWidth: null, marginBottom: tcellRef.innerBlockData.marginBottom ?? 0, blockAlign: '' };
			isMixInnerBlock = true;
		}
	}
	_propsBlockId = blockId;

	const panel = document.getElementById('blockPropsPanel');
	const titleEl = document.getElementById('blockPropsTitle');
	const widthSel = document.getElementById('propBlockWidth');
	const marginInput = document.getElementById('propMarginBottom');
	const marginTopInput = document.getElementById('propMarginTop');
	const marginLeftInput = document.getElementById('propMarginLeft');
	const marginRightInput = document.getElementById('propMarginRight');

	if (titleEl) titleEl.textContent = block.type || '블록';
	if (widthSel) widthSel.value = block.blockWidth || '';
	if (marginTopInput) marginTopInput.value = block.marginTop ?? 0;
	if (marginInput) marginInput.value = block.marginBottom ?? 10;
	if (marginLeftInput) marginLeftInput.value = block.marginLeft ?? 0;
	if (marginRightInput) marginRightInput.value = block.marginRight ?? 0;
	document.querySelectorAll('#propBlockAlign .props-align-btn').forEach(btn => {
		btn.classList.toggle('is-active', btn.dataset.align === (block.blockAlign || ''));
	});

	const listSection = document.getElementById('propsListSection');
	if (listSection) {
		const isListType = templateCategories[block.type] === 'list';
		listSection.style.display = isListType ? '' : 'none';
		if (isListType) {
			ensureListRows(block);
			renderPropsListRows(block);
		}
	}

	const linkSection = document.getElementById('propsLinkSection');
	if (linkSection) {
		const isLinkBlock = block.type === 'text-03';
		linkSection.style.display = isLinkBlock ? '' : 'none';
		if (isLinkBlock) {
			document.getElementById('propLinkHref').value = block.linkHref || '';
			document.getElementById('propLinkTarget').value = block.linkTarget || '_blank';
		}
	}

	const downloadSection = document.getElementById('propsDownloadSection');
	if (downloadSection) {
		const isDownloadBlock = block.type === 'text-04';
		downloadSection.style.display = isDownloadBlock ? '' : 'none';
		if (isDownloadBlock) {
			const notice = document.getElementById('propsDownloadNotice');
			if (notice) notice.style.display = 'none';
			const fileInput = document.getElementById('propDownloadFile');
			if (fileInput) fileInput.value = '';
		}
	}

	const boxImgSection = document.getElementById('propsBoxImgSection');
	if (boxImgSection) {
		const isBoxImg = !isMixInnerBlock && block.type === 'box-04';
		boxImgSection.style.display = isBoxImg ? '' : 'none';
		if (isBoxImg) {
			const altInput = document.getElementById('propBoxImgAlt');
			if (altInput) altInput.value = block.imgAlt || '';
			const fileInput = document.getElementById('propBoxImgFile');
			if (fileInput) fileInput.value = '';
		}
	}

	const boxIcoSection = document.getElementById('propsBoxIcoSection');
	if (boxIcoSection) {
		const isBox05 = !isMixInnerBlock && block.type === 'box-05';
		boxIcoSection.style.display = isBox05 ? '' : 'none';
		if (isBox05) {
			const icoSelect = document.getElementById('propBoxIco');
			if (icoSelect) icoSelect.value = block.icoId || 'ico-box1';
		}
	}

	const tabSection = document.getElementById('propsTabSection');
	if (tabSection) {
		const isTab = !isMixInnerBlock && templateCategories[block.type] === 'tab';
		tabSection.style.display = isTab ? '' : 'none';
		if (isTab) {
			const colsSelect = document.getElementById('propTabCols');
			if (colsSelect) colsSelect.value = block.tabCols || '4';
			renderPropsTabItems(block);
		}
	}

	const processSection = document.getElementById('propsProcessSection');
	if (processSection) {
		const isProcess = !isMixInnerBlock && templateCategories[block.type] === 'process';
		processSection.style.display = isProcess ? '' : 'none';
		if (isProcess) {
			const isHoriz = block.type === 'process-01';
			const horizCard = document.getElementById('propsProcessHorizCard');
			const addStepBtn = document.getElementById('propsAddProcessStep');
			if (horizCard) horizCard.style.display = isHoriz ? '' : 'none';
			if (addStepBtn) addStepBtn.style.display = !isHoriz ? '' : 'none';
			if (isHoriz) {
				const colsSelect = document.getElementById('propProcessCols');
				if (colsSelect) colsSelect.value = String(block.items.length);
			}
			renderPropsProcessSteps(block);
		}
	}

	const accordionSection = document.getElementById('propsAccordionSection');
	if (accordionSection) {
		const isAccordion = !isMixInnerBlock && templateCategories[block.type] === 'accordion' && block.type !== 'accordion-03';
		accordionSection.style.display = isAccordion ? '' : 'none';
		if (isAccordion) {
			const sizeSelect = document.getElementById('propAccordionSize');
			if (sizeSelect) sizeSelect.value = block.accordionSize || '';
			renderPropsAccordionItems(block);
		}
	}

	const discloserSection = document.getElementById('propsDiscloserSection');
	if (discloserSection) {
		const isDiscloser = !isMixInnerBlock && block.type === 'accordion-03';
		discloserSection.style.display = isDiscloser ? '' : 'none';
		if (isDiscloser) {
			const titleInput = document.getElementById('propDiscloserTitle');
			const contentInput = document.getElementById('propDiscloserContent');
			if (titleInput) titleInput.value = block.discloserTitle || '';
			if (contentInput) contentInput.value = block.discloserContent || '';
		}
	}

	const buttonInnerSection = document.getElementById('propsButtonInnerSection');
	if (buttonInnerSection) {
		const isButtonContainer = !isMixInnerBlock && block.type === 'button-00';
		buttonInnerSection.style.display = isButtonContainer ? '' : 'none';
		if (isButtonContainer) renderPropsButtonInnerItems(block);
	}

	const tableSection = document.getElementById('propsTableSection');
	if (tableSection) {
		const isTable = !isMixInnerBlock && templateCategories[block.type] === 'table';
		tableSection.style.display = isTable ? '' : 'none';
		if (isTable) renderPropsTableSection(block);
	}

	const buttonSection = document.getElementById('propsButtonSection');
	if (buttonSection) {
		const isButton = !isMixInnerBlock && templateCategories[block.type] === 'button' && block.type !== 'button-00';
		buttonSection.style.display = isButton ? '' : 'none';
		if (isButton) {
			const sizeSelect = document.getElementById('propBtnSize');
			if (sizeSelect) sizeSelect.value = block.btnSize || '';
			const openTypeSelect = document.getElementById('propBtnOpenType');
			if (openTypeSelect) openTypeSelect.value = block.btnOpenType || 'default';

			const isIconBtn = block.type === 'button-05' || block.type === 'button-06';
			const iconCard = document.getElementById('propsButtonIconCard');
			if (iconCard) iconCard.style.display = isIconBtn ? '' : 'none';

			if (isIconBtn) {
				const iconSelect = document.getElementById('propBtnIcon');
				if (iconSelect) iconSelect.value = block.btnIcon || 'ri-external-link-line';
				const iconPosRow = document.getElementById('propBtnIconPosRow');
				if (iconPosRow) iconPosRow.style.display = block.type === 'button-05' ? '' : 'none';
				const iconPosSelect = document.getElementById('propBtnIconPos');
				if (iconPosSelect && block.type === 'button-05') iconPosSelect.value = block.btnIconPos || 'before';
			}

			const hidCard = document.getElementById('propsButtonHidCard');
			if (hidCard) hidCard.style.display = block.type === 'button-06' ? '' : 'none';
			if (block.type === 'button-06') {
				const hidInput = document.getElementById('propBtnHidText');
				if (hidInput) hidInput.value = (block.items[0] || {}).hid || '';
			}

			const priNotice = document.getElementById('propsButtonPriNotice');
			if (priNotice) priNotice.style.display = block.type === 'button-01' ? '' : 'none';
		}
	}

	// 가정통신문 헤더 속성 패널
	const nlHeaderSection = document.getElementById('propsNewsletterHeaderSection');
	if (nlHeaderSection) {
		const isNlHeader = block.type === 'newsletter-01__section_1';
		nlHeaderSection.style.display = isNlHeader ? '' : 'none';
		if (isNlHeader) {
			const item = block.items[0] || {};
			const schoolNameInput = document.getElementById('propNlSchoolName');
			const deptInput = document.getElementById('propNlDept');
			const phoneInput = document.getElementById('propNlPhone');
			const logoFileInput = document.getElementById('propNlLogoFile');
			if (schoolNameInput) schoolNameInput.value = item.schoolName || '';
			if (deptInput) deptInput.value = item.dept || '';
			if (phoneInput) phoneInput.value = item.phone || '';
			if (logoFileInput) logoFileInput.value = '';
		}
	}

	// 가정통신문 푸터 속성 패널
	const nlFooterSection = document.getElementById('propsNewsletterFooterSection');
	if (nlFooterSection) {
		const isNlFooter = block.type === 'newsletter-01__section_4';
		nlFooterSection.style.display = isNlFooter ? '' : 'none';
		if (isNlFooter) {
			const item = block.items[0] || {};
			const yearInput = document.getElementById('propNlYear');
			const monthInput = document.getElementById('propNlMonth');
			const dayInput = document.getElementById('propNlDay');
			const schoolInput = document.getElementById('propNlFooterSchool');
			const stampSel = document.getElementById('propNlStamp');
			if (yearInput) yearInput.value = item.nlYear || '';
			if (monthInput) monthInput.value = item.nlMonth || '';
			if (dayInput) dayInput.value = item.nlDay || '';
			if (schoolInput) schoolInput.value = item.nlFooterSchool || '';
			if (stampSel) stampSel.value = item.nlStamp || 'omit';
		}
	}

	// 가정통신문 폰트 속성 패널 (section 블록)
	const nlFontSection = document.getElementById('propsNewsletterFontSection');
	if (nlFontSection) {
		const isNlBlock = block.type.startsWith('newsletter-01__section_');
		nlFontSection.style.display = isNlBlock ? '' : 'none';
		if (isNlBlock) {
			const ns = state.newsletterStyle;
			const fontFamilySel = document.getElementById('propNlFontFamily');
			const fontSizeInput = document.getElementById('propNlFontSize');
			const lineHeightSel = document.getElementById('propNlLineHeight');
			const fontWeightSel = document.getElementById('propNlFontWeight');
			if (fontFamilySel) fontFamilySel.value = ns.fontFamily || '';
			if (fontSizeInput) fontSizeInput.value = ns.fontSize || '';
			if (lineHeightSel) lineHeightSel.value = ns.lineHeight || '';
			if (fontWeightSel) fontWeightSel.value = ns.fontWeight || '';
			const blockGapInput = document.getElementById('propNlBlockGap');
			if (blockGapInput) blockGapInput.value = ns.blockGap || '';
		}
	}

	panel.classList.add('is-open');
}

function closeBlockProps() {
	_propsBlockId = null;
	const panel = document.getElementById('blockPropsPanel');
	panel.classList.remove('is-open');
}

function initNlInlineToolbar() {
	const toolbar = document.getElementById('nlInlineToolbar');
	if (!toolbar) return;

	let _savedRange = null;

	function saveRange() {
		const sel = window.getSelection();
		if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
			_savedRange = sel.getRangeAt(0).cloneRange();
			return true;
		}
		return false;
	}

	function restoreRange() {
		if (!_savedRange) return false;
		const node = _savedRange.commonAncestorContainer;
		const editEl = node.nodeType === 3 ? node.parentElement : node;
		const ceEl = editEl?.closest('[contenteditable]');
		if (ceEl) ceEl.focus();
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(_savedRange);
		return true;
	}

	// 툴바 클릭 시 contenteditable 포커스/선택 영역이 해제되지 않도록 방지
	// 숫자 input은 예외 처리 (포커스 받아야 입력 가능)
	toolbar.addEventListener('mousedown', e => {
		if (e.target.type === 'number') return;
		e.preventDefault();
	});

	function showToolbar(range) {
		const rect = range.getBoundingClientRect();
		if (!rect.width && !rect.height) return;
		let left = rect.left;
		let top = rect.top - 48;
		if (top < 8) top = rect.bottom + 8;
		if (left + 230 > window.innerWidth) left = window.innerWidth - 238;
		if (left < 8) left = 8;
		toolbar.style.left = left + 'px';
		toolbar.style.top = top + 'px';
		toolbar.style.display = 'flex';
	}

	// ── 크기 입력 모드 ──
	let _sizeMode = false;
	let _sizeBuf = '';
	let _sizeFirstKey = false; // 첫 키 입력 시 기존 값 덮어쓰기 플래그
	const sizeWrap = document.getElementById('nlItbSizeWrap');
	const sizeDisplay = document.getElementById('nlItbSizeDisplay');

	function startSizeMode() {
		_sizeMode = true;
		_sizeBuf = (sizeDisplay?.textContent || '').replace(/[^0-9]/g, '');
		_sizeFirstKey = true; // 첫 키 입력은 기존 값을 대체
		sizeWrap?.classList.add('size-active');
	}

	function endSizeMode() {
		_sizeMode = false;
		sizeWrap?.classList.remove('size-active');
	}

	function applySizeAndEnd() {
		if (!_sizeBuf || !restoreRange()) { endSizeMode(); return; }
		applySpanStyle({ fontSize: _sizeBuf + 'px' });
		if (sizeDisplay) sizeDisplay.textContent = _sizeBuf;
		endSizeMode();
	}

	function hideToolbar() {
		toolbar.style.display = 'none';
		_savedRange = null;
		endSizeMode();
	}

	function isInNlContent(node) {
		const el = node?.nodeType === 3 ? node.parentElement : node;
		return !!el?.closest('.nl-content-area, [contenteditable="true"]');
	}

	document.addEventListener('mouseup', e => {
		if (toolbar.contains(e.target)) return;
		const sel = window.getSelection();
		if (!sel || sel.isCollapsed || !sel.rangeCount) {
			if (!toolbar.contains(e.target)) hideToolbar();
			return;
		}
		const range = sel.getRangeAt(0);
		if (isInNlContent(range.commonAncestorContainer)) {
			saveRange();
			showToolbar(range);
		} else {
			hideToolbar();
		}
	});

	document.addEventListener('mousedown', e => {
		if (!toolbar.contains(e.target) && !e.target.closest('.nl-content-area, [contenteditable="true"]')) {
			hideToolbar();
		}
	});

	// 선택 텍스트를 <span style="...">으로 감싸는 공통 헬퍼
	// 기존 styled span 스타일을 병합하고 중첩 span을 제거하여 단일 span 유지
	function applySpanStyle(styleObj) {
		const sel = window.getSelection();
		if (!sel || !sel.rangeCount || sel.isCollapsed) return;
		const range = sel.getRangeAt(0);
		try {
			const frag = range.extractContents();
			const tmp = document.createElement('div');
			tmp.appendChild(frag);

			// 선택 전체가 하나의 styled span인 경우 기존 스타일 수집 후 병합
			const mergedStyles = {};
			const kids = Array.from(tmp.childNodes).filter(n => n.nodeType !== 3 || n.textContent.trim());
			if (kids.length === 1 && kids[0].nodeName === 'SPAN' && kids[0].style?.cssText) {
				for (const prop of kids[0].style) {
					mergedStyles[prop] = kids[0].style[prop];
				}
			}
			Object.assign(mergedStyles, styleObj); // 새 스타일이 우선

			// 기존 styled span 모두 제거 (텍스트와 비 span 요소는 유지)
			tmp.querySelectorAll('span[style]').forEach(s => s.replaceWith(...s.childNodes));

			// 병합된 스타일의 단일 span으로 감싸기
			const span = document.createElement('span');
			Object.assign(span.style, mergedStyles);
			while (tmp.firstChild) span.appendChild(tmp.firstChild);

			range.insertNode(span);
			const nr = document.createRange();
			nr.selectNode(span); // span 요소 자체를 선택 → 다음 적용 시 span 전체를 추출해 스타일 병합
			sel.removeAllRanges();
			sel.addRange(nr);
			saveRange();
			showToolbar(nr);
		} catch (err) {
			console.warn('nl inline style apply failed', err);
		}
	}

	// 글자 색상: change 이벤트로 색상 피커 확정 시 1회 적용 (input 이벤트는 span 다중 생성 문제)
	document.getElementById('nlItbColor')?.addEventListener('change', e => {
		if (!restoreRange()) return;
		applySpanStyle({ color: e.target.value });
	});

	// 크기 입력 모드: 클릭 시 활성화, 키보드 숫자 입력 캡처
	sizeWrap?.addEventListener('click', () => startSizeMode());

	document.addEventListener('keydown', e => {
		if (!_sizeMode) return;
		if (e.key >= '0' && e.key <= '9') {
			e.preventDefault();
			if (_sizeFirstKey) { _sizeBuf = e.key; _sizeFirstKey = false; } // 첫 키: 덮어쓰기
			else _sizeBuf += e.key;
			if (Number(_sizeBuf) > 200) _sizeBuf = '200';
			if (sizeDisplay) sizeDisplay.textContent = _sizeBuf;
		} else if (e.key === 'Backspace') {
			e.preventDefault();
			_sizeFirstKey = false;
			_sizeBuf = _sizeBuf.slice(0, -1);
			if (sizeDisplay) sizeDisplay.textContent = _sizeBuf || '—';
		} else if (e.key === 'Enter') {
			e.preventDefault();
			applySizeAndEnd();
		} else if (e.key === 'Escape') {
			endSizeMode();
		}
	});

	// 크기 적용 버튼
	document.getElementById('nlItbApplySize')?.addEventListener('click', applySizeAndEnd);

	// 굵기 토글
	document.getElementById('nlItbBold')?.addEventListener('click', () => {
		if (!restoreRange()) return;
		const sel = window.getSelection();
		if (!sel || !sel.rangeCount) return;
		const range = sel.getRangeAt(0);
		// selectNode(span) 이후에는 startContainer가 부모 → 직접 span 요소를 가져옴
		const parent = range.startContainer;
		const selectedNode = parent.nodeType === 1
			? parent.childNodes[range.startOffset]
			: parent;
		const checkEl = (selectedNode?.nodeType === 1 ? selectedNode : selectedNode?.parentElement) || parent;
		const isBold = Number(window.getComputedStyle(checkEl).fontWeight) >= 600;
		applySpanStyle({ fontWeight: isBold ? '400' : '700' });
	});

	// 서식 초기화: 선택 영역의 span 인라인 스타일 제거
	document.getElementById('nlItbReset')?.addEventListener('click', () => {
		if (!restoreRange()) return;
		const sel = window.getSelection();
		if (!sel || !sel.rangeCount || sel.isCollapsed) return;
		const range = sel.getRangeAt(0);
		try {
			const frag = range.extractContents();
			const tmp = document.createElement('div');
			tmp.appendChild(frag);
			// span의 인라인 스타일 제거, 내용만 남김
			tmp.querySelectorAll('span[style], font').forEach(node => {
				node.replaceWith(...node.childNodes);
			});
			range.insertNode(tmp);
			// tmp 언래핑
			const parent = tmp.parentNode;
			while (tmp.firstChild) parent.insertBefore(tmp.firstChild, tmp);
			parent.removeChild(tmp);
			saveRange();
		} catch (err) {
			console.warn('nl format reset failed', err);
		}
	});
}

function initBlockPropsPanel() {
	document.getElementById('blockPropsClose').addEventListener('click', closeBlockProps);

	document.getElementById('propBlockWidth')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block) return;
		pushHistory();
		block.blockWidth = this.value || null;
		render();
	});

	document.getElementById('propMarginTop')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block) return;
		pushHistory();
		block.marginTop = Number(this.value) || 0;
		render();
	});

	document.getElementById('propMarginBottom')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block) return;
		pushHistory();
		block.marginBottom = Number(this.value) || 0;
		render();
	});

	document.getElementById('propMarginLeft')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block) return;
		pushHistory();
		block.marginLeft = Number(this.value) || 0;
		render();
	});

	document.getElementById('propMarginRight')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block) return;
		pushHistory();
		block.marginRight = Number(this.value) || 0;
		render();
	});

	document.querySelectorAll('#propBlockAlign .props-align-btn').forEach(btn => {
		btn.addEventListener('click', function () {
			if (!_propsBlockId) return;
			const block = state.blocks.find(b => b.id === _propsBlockId);
			if (!block) return;
			pushHistory();
			const newAlign = block.blockAlign === this.dataset.align ? '' : this.dataset.align;
			block.blockAlign = newAlign;
			document.querySelectorAll('#propBlockAlign .props-align-btn').forEach(b => {
				b.classList.toggle('is-active', b.dataset.align === newAlign);
			});
			render();
		});
	});

	document.getElementById('propsAddRowTop')?.addEventListener('click', () => {
		if (_propsBlockId) addListRowToBlock(_propsBlockId);
	});

	document.getElementById('propLinkHref')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block) return;
		pushHistory();
		block.linkHref = this.value.trim();
		render();
	});

	document.getElementById('propLinkTarget')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block) return;
		pushHistory();
		block.linkTarget = this.value;
		render();
	});

	document.getElementById('propsApplyDownload')?.addEventListener('click', () => {
		const notice = document.getElementById('propsDownloadNotice');
		if (notice) notice.style.display = '';
	});

	// 이미지 박스(box-04): 이미지 업로드 후 즉시 적용
	document.getElementById('propBoxImgFile')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'box-04') return;
		const file = this.files?.[0];
		if (!file || !file.type.startsWith('image/')) return;
		const reader = new FileReader();
		reader.onload = () => {
			pushHistory();
			block.imgSrc = String(reader.result || '');
			render();
		};
		reader.readAsDataURL(file);
	});

	// 이미지 박스(box-04): 적용 버튼 → alt + 파일 동시 반영
	document.getElementById('propsApplyBoxImg')?.addEventListener('click', () => {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'box-04') return;
		const altInput = document.getElementById('propBoxImgAlt');
		if (altInput) {
			pushHistory();
			block.imgAlt = altInput.value.trim();
			render();
		}
	});

	// 아이콘 박스(box-05): 아이콘 선택
	document.getElementById('propBoxIco')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'box-05') return;
		pushHistory();
		block.icoId = this.value;
		render();
	});

	// 버튼 블록: 크기 선택
	document.getElementById('propBtnSize')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'button') return;
		pushHistory();
		block.btnSize = this.value;
		render();
	});

	// 버튼 블록: 이동 방식 선택
	document.getElementById('propBtnOpenType')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'button') return;
		pushHistory();
		block.btnOpenType = this.value;
		// 새창 선택 시 아이콘 버튼 아이콘 선택 비활성화 (새창 아이콘 고정)
		const iconSelect = document.getElementById('propBtnIcon');
		if (iconSelect) iconSelect.disabled = this.value === 'new-window';
		render();
	});

	// 버튼 블록: 아이콘 선택
	document.getElementById('propBtnIcon')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || (block.type !== 'button-05' && block.type !== 'button-06')) return;
		pushHistory();
		block.btnIcon = this.value;
		render();
	});

	// 버튼 블록: 아이콘 위치 선택 (button-05 전용)
	document.getElementById('propBtnIconPos')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'button-05') return;
		pushHistory();
		block.btnIconPos = this.value;
		render();
	});

	// 버튼 블록: 아이콘 전용(button-06) 숨김 텍스트 적용
	document.getElementById('propsApplyBtnHid')?.addEventListener('click', () => {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'button-06') return;
		const hidInput = document.getElementById('propBtnHidText');
		if (!hidInput) return;
		pushHistory();
		if (!block.items[0]) block.items[0] = {};
		block.items[0].hid = hidInput.value.trim() || '버튼의 목적';
		render();
	});

	// 버튼레이아웃(button-00) 내부 버튼 속성 이벤트 위임
	const btnInnerContainer = document.getElementById('propsButtonInnerContainer');
	if (btnInnerContainer) {
		btnInnerContainer.addEventListener('change', event => {
			const sel = event.target.closest('select');
			if (!sel) return;
			const blockId = sel.dataset.blockId;
			const ibIdx = Number(sel.dataset.ibIdx);
			const block = state.blocks.find(b => b.id === blockId);
			if (!block || block.type !== 'button-00' || !block.innerBlocks?.[ibIdx]) return;
			const ib = block.innerBlocks[ibIdx];
			pushHistory();
			if (sel.classList.contains('props-btn-inner-size')) {
				ib.btnSize = sel.value;
			} else if (sel.classList.contains('props-btn-inner-opentype')) {
				ib.btnOpenType = sel.value;
				// 새창 선택 시 아이콘 select 비활성화 처리
				const iconSel = btnInnerContainer.querySelector(`.props-btn-inner-icon[data-ib-idx="${ibIdx}"]`);
				if (iconSel) iconSel.disabled = sel.value === 'new-window';
			} else if (sel.classList.contains('props-btn-inner-icon')) {
				ib.btnIcon = sel.value;
			} else if (sel.classList.contains('props-btn-inner-iconpos')) {
				ib.btnIconPos = sel.value;
			} else {
				return;
			}
			render();
		});
		btnInnerContainer.addEventListener('click', event => {
			const btn = event.target.closest('.props-btn-inner-apply-hid');
			if (!btn) return;
			const blockId = btn.dataset.blockId;
			const ibIdx = Number(btn.dataset.ibIdx);
			const block = state.blocks.find(b => b.id === blockId);
			if (!block || block.type !== 'button-00' || !block.innerBlocks?.[ibIdx]) return;
			const ib = block.innerBlocks[ibIdx];
			const input = btnInnerContainer.querySelector(`.props-btn-inner-hid[data-ib-idx="${ibIdx}"]`);
			if (!input) return;
			pushHistory();
			if (!ib.items[0]) ib.items[0] = {};
			ib.items[0].hid = input.value.trim() || '버튼의 목적';
			render();
		});
	}

	// 행 관리 버튼 이벤트 위임: innerHTML이 교체되어도 컨테이너 리스너는 살아있음
	const rowsContainer = document.getElementById('propsListRowsContainer');
	if (rowsContainer) {
		rowsContainer.addEventListener('click', event => {
			const addBtn = event.target.closest('.props-list-row-add-btn');
			if (addBtn) {
				event.stopPropagation();
				addSiblingRowToBlock(addBtn.dataset.blockId, addBtn.dataset.rowKey);
				return;
			}
			const childBtn = event.target.closest('.props-list-row-child-btn');
			if (childBtn && !childBtn.disabled) {
				event.stopPropagation();
				addChildRowToBlock(childBtn.dataset.blockId, childBtn.dataset.rowKey);
				return;
			}
			const removeBtn = event.target.closest('.props-list-row-remove-btn');
			if (removeBtn && !removeBtn.disabled) {
				event.stopPropagation();
				removeListRowFromBlock(removeBtn.dataset.blockId, removeBtn.dataset.rowKey);
				return;
			}
		});
	}

	// 탭: 열 수 변경
	document.getElementById('propTabCols')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'tab') return;
		pushHistory();
		block.tabCols = this.value;
		render();
	});

	// 절차(가로형): 열 수 변경
	document.getElementById('propProcessCols')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'process-01') return;
		pushHistory();
		block.columns = Number(this.value) || 4;
		syncBlockItems(block);
		render();
		renderPropsProcessSteps(block);
	});

	// 절차: 단계별 설명(sub) 입력 변경 (위임)
	document.getElementById('propsProcessStepsContainer')?.addEventListener('change', event => {
		const input = event.target.closest('.props-process-sub-input');
		if (!input) return;
		const blockId = input.dataset.blockId;
		const stepIdx = Number(input.dataset.stepIdx);
		const block = state.blocks.find(b => b.id === blockId);
		if (!block || templateCategories[block.type] !== 'process') return;
		const item = block.items[stepIdx];
		if (!item) return;
		const newSub = input.value.trim();
		if (item.sub === newSub) return;
		pushHistory();
		item.sub = newSub;
		render();
	});

	// 절차(세로형): 단계 추가
	document.getElementById('propsAddProcessStep')?.addEventListener('click', () => {
		if (!_propsBlockId) return;
		addProcessStep(_propsBlockId);
	});

	// 절차(세로형): 단계 삭제 (위임)
	document.getElementById('propsProcessStepsContainer')?.addEventListener('click', event => {
		const btn = event.target.closest('.props-process-step-remove-btn');
		if (!btn || btn.disabled) return;
		removeProcessStep(btn.dataset.blockId, Number(btn.dataset.stepIdx));
	});

	// 탭: 항목 추가
	document.getElementById('propsAddTabItem')?.addEventListener('click', () => {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'tab') return;
		pushHistory();
		block.tabItems = block.tabItems || [];
		block.tabItems.push({ text: `탭 ${block.tabItems.length + 1}`, type: 'normal' });
		render();
		renderPropsTabItems(block);
	});

	// 탭: 명칭 변경 / 타입 변경 / 항목 삭제 (위임)
	document.getElementById('propsTabItemsContainer')?.addEventListener('change', function (e) {
		const textInput = e.target.closest('.props-tab-text-input');
		if (textInput) {
			const idx = Number(textInput.dataset.tabTextIdx);
			const block = state.blocks.find(b => b.id === textInput.dataset.blockId);
			if (!block || !block.tabItems || !block.tabItems[idx]) return;
			pushHistory();
			block.tabItems[idx].text = textInput.value;
			render();
			return;
		}
		const sel = e.target.closest('.props-tab-type-select');
		if (!sel) return;
		const idx = Number(sel.dataset.tabTypeIdx);
		const block = state.blocks.find(b => b.id === sel.dataset.blockId);
		if (!block || !block.tabItems || !block.tabItems[idx]) return;
		pushHistory();
		block.tabItems[idx].type = sel.value;
		render();
	});
	document.getElementById('propsTabItemsContainer')?.addEventListener('click', function (e) {
		const btn = e.target.closest('.props-tab-remove-btn');
		if (!btn || btn.disabled) return;
		const idx = Number(btn.dataset.tabRemoveIdx);
		const block = state.blocks.find(b => b.id === btn.dataset.blockId);
		if (!block || !block.tabItems || block.tabItems.length <= 1) return;
		pushHistory();
		block.tabItems.splice(idx, 1);
		render();
		renderPropsTabItems(block);
	});

	// 아코디언: 크기 변경
	document.getElementById('propAccordionSize')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'accordion') return;
		pushHistory();
		block.accordionSize = this.value;
		render();
	});

	// 아코디언: 항목 추가
	document.getElementById('propsAddAccordionItem')?.addEventListener('click', () => {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'accordion') return;
		pushHistory();
		block.accordionItems = block.accordionItems || [];
		block.accordionItems.push({ text: `메뉴 ${block.accordionItems.length + 1}`, content: '', disabled: false });
		render();
		renderPropsAccordionItems(block);
	});

	// 아코디언: 메뉴명 / 내용 / 비활성 / 삭제 (이벤트 위임)
	const accordionItemsContainer = document.getElementById('propsAccordionItemsContainer');
	if (accordionItemsContainer) {
		accordionItemsContainer.addEventListener('change', event => {
			const textInput = event.target.closest('.props-accordion-text-input');
			if (textInput) {
				const block = state.blocks.find(b => b.id === textInput.dataset.blockId);
				const idx = Number(textInput.dataset.itemIdx);
				if (!block || !block.accordionItems || !block.accordionItems[idx]) return;
				pushHistory();
				block.accordionItems[idx].text = textInput.value;
				render();
				return;
			}
			const contentInput = event.target.closest('.props-accordion-content-input');
			if (contentInput) {
				const block = state.blocks.find(b => b.id === contentInput.dataset.blockId);
				const idx = Number(contentInput.dataset.itemIdx);
				if (!block || !block.accordionItems || !block.accordionItems[idx]) return;
				pushHistory();
				block.accordionItems[idx].content = contentInput.value;
				render();
				return;
			}
			const disCheck = event.target.closest('.props-accordion-dis-check');
			if (disCheck) {
				const block = state.blocks.find(b => b.id === disCheck.dataset.blockId);
				const idx = Number(disCheck.dataset.itemIdx);
				if (!block || !block.accordionItems || !block.accordionItems[idx]) return;
				pushHistory();
				block.accordionItems[idx].disabled = disCheck.checked;
				render();
				return;
			}
		});
		accordionItemsContainer.addEventListener('click', event => {
			const btn = event.target.closest('.props-accordion-remove-btn');
			if (!btn || btn.disabled) return;
			const block = state.blocks.find(b => b.id === btn.dataset.blockId);
			const idx = Number(btn.dataset.itemIdx);
			if (!block || !block.accordionItems || block.accordionItems.length <= 1) return;
			pushHistory();
			block.accordionItems.splice(idx, 1);
			render();
			renderPropsAccordionItems(block);
		});
	}

	// discloser: 버튼 제목 변경
	document.getElementById('propDiscloserTitle')?.addEventListener('input', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'accordion-03') return;
		block.discloserTitle = this.value;
		render();
	});

	// discloser: 내용 변경
	document.getElementById('propDiscloserContent')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'accordion-03') return;
		pushHistory();
		block.discloserContent = this.value;
		render();
	});

	// canvasGrid 변경 감지 → 패널 행 관리 자동 갱신
	// render()가 canvasGrid.innerHTML을 교체할 때마다 MutationObserver가 마이크로태스크로 실행되어
	// 모든 render 사이클이 끝난 뒤 안정적으로 패널을 업데이트함
	const canvasGridEl = document.getElementById('canvasGrid');
	if (canvasGridEl) {
		const panelObserver = new MutationObserver(() => {
			if (!_propsBlockId) return;
			const b = resolveBlockForRows(_propsBlockId);
			if (!b) return;
			if (templateCategories[b.type] === 'list') {
				const listSection = document.getElementById('propsListSection');
				if (!listSection || listSection.style.display === 'none') return;
				renderPropsListRows(b);
			} else if (templateCategories[b.type] === 'tab') {
				const tabSection = document.getElementById('propsTabSection');
				if (!tabSection || tabSection.style.display === 'none') return;
				renderPropsTabItems(b);
			} else if (templateCategories[b.type] === 'accordion') {
				const accSection = document.getElementById('propsAccordionSection');
				if (!accSection || accSection.style.display === 'none') return;
				renderPropsAccordionItems(b);
			} else if (templateCategories[b.type] === 'table') {
				const tblSection = document.getElementById('propsTableSection');
				if (!tblSection || tblSection.style.display === 'none') return;
				renderPropsTableSection(b);
			}
		});
		panelObserver.observe(canvasGridEl, { childList: true });
	}

	// 테이블: 열 수 변경
	document.getElementById('propTableColCount')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'table') return;
		const newCount = Math.max(1, Math.min(12, Number(this.value) || 4));
		this.value = newCount;
		const oldCount = block.tableColCount || 4;
		if (newCount === oldCount) return;
		pushHistory();
		block.tableColCount = newCount;
		block.tableColWidths = Array.from({ length: newCount }, (_, i) => `${Math.round(100 / newCount)}%`);
		_syncTableCellKeys(block, oldCount, newCount);
		render();
		renderPropsTableSection(block);
	});

	// 테이블: 너비 조절 모드 변경
	document.getElementById('propTableColWidthMode')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'table') return;
		pushHistory();
		block.tableColWidthMode = this.value;
		if (this.value === 'manual') {
			const n = block.tableColCount || 4;
			block.tableColWidths = Array.from({ length: n }, () => `${Math.round(100 / n)}%`);
		}
		render();
		renderPropsTableSection(block);
	});

	// 테이블: 가로 스크롤 설정
	document.getElementById('propTableScroll')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'table') return;
		pushHistory();
		block.tableScroll = this.value;
		render();
	});

	// 테이블: 수동 너비 적용
	document.getElementById('propsApplyTableColWidths')?.addEventListener('click', () => {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || templateCategories[block.type] !== 'table') return;
		const inputs = document.querySelectorAll('#propsTableColWidthsContainer .props-table-col-width-input');
		const nums = [];
		let total = 0;
		let valid = true;
		inputs.forEach(input => {
			const val = parseFloat(input.value.trim());
			if (isNaN(val) || val <= 0) { valid = false; return; }
			nums.push(val);
			total += val;
		});
		const notice = document.getElementById('propsTableColWidthsNotice');
		if (!valid || Math.abs(total - 100) > 0.1) {
			if (notice) notice.style.display = '';
			return;
		}
		if (notice) notice.style.display = 'none';
		pushHistory();
		block.tableColWidths = nums.map(w => `${w}%`);
		render();
	});

	// 테이블: 구조 관리 (섹션 추가/제거, tr 추가/제거, 정렬)
	const tableStructureContainer = document.getElementById('propsTableStructure');
	if (tableStructureContainer) {
		tableStructureContainer.addEventListener('click', event => {
			// 섹션 추가
			const addSectionBtn = event.target.closest('.props-table-add-section-btn');
			if (addSectionBtn) {
				const blockId = addSectionBtn.dataset.blockId;
				const sectionTag = addSectionBtn.dataset.section;
				const block = state.blocks.find(b => b.id === blockId);
				if (!block) return;
				pushHistory();
				_addTableSection(block, sectionTag);
				render();
				renderPropsTableSection(block);
				return;
			}

			// 섹션 제거
			const removeSectionBtn = event.target.closest('.props-table-remove-section-btn, .props-table-remove-section-check');
			if (removeSectionBtn) {
				const blockId = removeSectionBtn.dataset.blockId;
				const sectionTag = removeSectionBtn.dataset.removeSection;
				const block = state.blocks.find(b => b.id === blockId);
				if (!block) return;
				pushHistory();
				_removeTableSection(block, sectionTag);
				render();
				renderPropsTableSection(block);
				return;
			}

			// tr 추가
			const addTrBtn = event.target.closest('[data-add-tr]');
			if (addTrBtn) {
				const blockId = addTrBtn.dataset.blockId;
				const sectionTag = addTrBtn.dataset.addTr;
				const block = state.blocks.find(b => b.id === blockId);
				if (!block) return;
				pushHistory();
				_addTableRow(block, sectionTag);
				render();
				renderPropsTableSection(block);
				return;
			}

			// tr 제거
			const removeTrBtn = event.target.closest('.props-table-tr-remove-btn');
			if (removeTrBtn && !removeTrBtn.disabled) {
				const blockId = removeTrBtn.dataset.blockId;
				const sectionTag = removeTrBtn.dataset.section;
				const rowKey = removeTrBtn.dataset.rowKey;
				const block = state.blocks.find(b => b.id === blockId);
				if (!block) return;
				pushHistory();
				_removeTableRow(block, sectionTag, rowKey);
				render();
				renderPropsTableSection(block);
				return;
			}

			// 셀별 태그 토글 (th ↔ td) — thead 제외
			const cellTagBtn = event.target.closest('.props-table-cell-tag-btn');
			if (cellTagBtn) {
				const blockId = cellTagBtn.dataset.blockId;
				const rowKey = cellTagBtn.dataset.rowKey;
				const colIdx = parseInt(cellTagBtn.dataset.colIdx);
				const sectionTag = cellTagBtn.dataset.section;
				if (sectionTag === 'thead') return;
				const block = state.blocks.find(b => b.id === blockId);
				if (!block) return;
				const rowsKey = getTableRowsKey(sectionTag);
				const row = (block[rowsKey] || []).find(r => r.key === rowKey);
				if (!row) return;
				const colCount = block.tableColCount || 4;
				const defaultTag = sectionTag === 'tfoot' ? 'th' : 'td';
				if (!row.cellTags) row.cellTags = Array(colCount).fill(defaultTag);
				pushHistory();
				row.cellTags[colIdx] = (row.cellTags[colIdx] || defaultTag) === 'th' ? 'td' : 'th';
				render();
				renderPropsTableSection(block);
				return;
			}

			// tbody td 셀 디자인블록 영역 토글
			const zoneBtn = event.target.closest('.props-mini-cell-zone-btn');
			if (zoneBtn) {
				const blockId = zoneBtn.dataset.blockId;
				const cellKey = zoneBtn.dataset.cellKey;
				const block = state.blocks.find(b => b.id === blockId);
				if (!block) return;
				toggleTableCellBlockZone(blockId, cellKey);
				return;
			}

			// 정렬 버튼
			const alignBtn = event.target.closest('.props-table-align-btn');
			if (alignBtn) {
				const blockId = alignBtn.dataset.blockId;
				const sectionTag = alignBtn.dataset.section;
				const rowKey = alignBtn.dataset.rowKey;
				const cellType = alignBtn.dataset.cellType;
				const align = alignBtn.dataset.align;
				const block = state.blocks.find(b => b.id === blockId);
				if (!block) return;
				const rowsKey = sectionTag === 'thead' ? 'tableTheadRows' : sectionTag === 'tfoot' ? 'tableTfootRows' : 'tableTbodyRows';
				const rows = block[rowsKey] || [];
				pushHistory();
				if (cellType === 'all') {
					const allActive = rows.length > 0 && rows.every(row => {
						const thActive = (row.thAlign || '') === align;
						const tdActive = sectionTag === 'tbody' ? (row.tdAlign || '') === align : true;
						return thActive && tdActive;
					});
					rows.forEach(row => {
						row.thAlign = allActive ? '' : align;
						if (sectionTag === 'tbody') row.tdAlign = allActive ? '' : align;
					});
				} else if (rowKey === '__all__') {
					const alignProp = cellType === 'th' ? 'thAlign' : 'tdAlign';
					const allActive = rows.length > 0 && rows.every(row => (row[alignProp] || '') === align);
					rows.forEach(row => { row[alignProp] = allActive ? '' : align; });
				} else {
					const row = rows.find(r => r.key === rowKey);
					if (!row) return;
					const alignProp = cellType === 'th' ? 'thAlign' : 'tdAlign';
					row[alignProp] = row[alignProp] === align ? '' : align;
				}
				render();
				renderPropsTableSection(block);
				return;
			}
		});

	}

	// 패널 외부 클릭 시 닫기
	document.addEventListener('mousedown', e => {
		const panel = document.getElementById('blockPropsPanel');
		if (!panel?.classList.contains('is-open')) return;
		if (panel.contains(e.target)) return;
		closeBlockProps();
	});

	// 테이블 셀 span 팝오버 적용
	document.getElementById('tableCellSpanApply')?.addEventListener('click', applyTableCellSpan);
	document.addEventListener('mousedown', e => {
		const popover = document.getElementById('tableCellSpanPopover');
		if (!popover || popover.style.display === 'none') return;
		if (popover.contains(e.target)) return;
		if (e.target.closest && e.target.closest('table [data-edit-field]')) return;
		closeTableCellSpanPopover();
	});

	// 가정통신문 헤더: 로고 파일 선택 시 즉시 적용
	document.getElementById('propNlLogoFile')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'newsletter-01__section_1') return;
		const file = this.files?.[0];
		if (!file || !file.type.startsWith('image/')) return;
		const reader = new FileReader();
		reader.onload = () => {
			pushHistory();
			block.nlLogoSrc = String(reader.result || '');
			const schoolNameInput = document.getElementById('propNlSchoolName');
			block.nlLogoAlt = (schoolNameInput?.value.trim()) || '학교 로고';
			render();
		};
		reader.readAsDataURL(file);
	});

	// 가정통신문 헤더: 적용 버튼 (학교명, 부서명, 연락처)
	document.getElementById('propsApplyNlHeader')?.addEventListener('click', () => {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'newsletter-01__section_1') return;
		const schoolName = document.getElementById('propNlSchoolName')?.value.trim() || '';
		const dept = document.getElementById('propNlDept')?.value.trim() || '';
		const phone = document.getElementById('propNlPhone')?.value.trim() || '';
		pushHistory();
		if (!block.items[0]) block.items[0] = {};
		if (schoolName) block.items[0].schoolName = schoolName;
		block.items[0].dept = dept;
		block.items[0].phone = phone;
		if (block.nlLogoSrc) block.nlLogoAlt = schoolName || '학교 로고';
		render();
	});


	// 가정통신문 푸터: 적용 버튼
	document.getElementById('propsApplyNlFooter')?.addEventListener('click', () => {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block || block.type !== 'newsletter-01__section_4') return;
		const year = document.getElementById('propNlYear')?.value.trim() || '';
		const month = document.getElementById('propNlMonth')?.value.trim() || '';
		const day = document.getElementById('propNlDay')?.value.trim() || '';
		const school = document.getElementById('propNlFooterSchool')?.value.trim() || '';
		const stamp = document.getElementById('propNlStamp')?.value || 'omit';
		pushHistory();
		if (!block.items[0]) block.items[0] = {};
		block.items[0].nlYear = year;
		block.items[0].nlMonth = month;
		block.items[0].nlDay = day;
		block.items[0].nlFooterSchool = school;
		block.items[0].nlStamp = stamp;
		const yr = year || '20';
		const mo = month || '';
		const dy = day || '';
		const dateParts = [yr + '&nbsp;년', mo ? mo + '&nbsp;월' : '&nbsp;&nbsp;&nbsp;&nbsp;월', dy ? dy + '&nbsp;일' : '&nbsp;&nbsp;&nbsp;&nbsp;일'];
		block.items[0].date = dateParts.join('&nbsp;&nbsp;&nbsp;');
		const schoolName = school || '○○학교';
		const stampText = stamp === 'use' ? '(직인)' : '(직인 생략)';
		block.items[0].principal = schoolName + '장&nbsp;' + stampText;
		render();
	});

	// 가정통신문 폰트: 적용 버튼
	document.getElementById('propsApplyNlFont')?.addEventListener('click', () => {
		const fontFamily = document.getElementById('propNlFontFamily')?.value || '';
		const fontSize = document.getElementById('propNlFontSize')?.value || '';
		const lineHeight = document.getElementById('propNlLineHeight')?.value || '';
		const fontWeight = document.getElementById('propNlFontWeight')?.value || '';
		const blockGap = document.getElementById('propNlBlockGap')?.value || '';
		state.newsletterStyle = { fontFamily, fontSize, lineHeight, fontWeight, blockGap };
		applyNewsletterStyles();
	});
}

function applyNewsletterStyles() {
	const ns = state.newsletterStyle;
	// 폰트 패밀리: 전체 템플릿에 적용
	document.querySelectorAll('.nl-template').forEach(el => {
		if (ns.fontFamily) el.style.setProperty('--nl-font-family', ns.fontFamily);
		else el.style.removeProperty('--nl-font-family');
	});
	// 폰트 크기/굵기/줄간격/블록간격: 본문 영역에만 적용
	document.querySelectorAll('.nl-content-area').forEach(el => {
		if (ns.fontSize) el.style.setProperty('--nl-font-size', `${ns.fontSize}px`);
		else el.style.removeProperty('--nl-font-size');
		if (ns.lineHeight) el.style.setProperty('--nl-line-height', ns.lineHeight);
		else el.style.removeProperty('--nl-line-height');
		if (ns.fontWeight) el.style.setProperty('--nl-font-weight', ns.fontWeight);
		else el.style.removeProperty('--nl-font-weight');
	});
}

// 혼합 블록에 허용되는 카테고리 (모듈 스코프)
const MIX_ALLOWED = new Set(['box', 'list', 'title-horizontal', 'title-vertical', 'divider', 'text', 'title', 'button']);

// mix-inner-slot을 가진 컨테이너 블록 여부 판별
function isMixContainer(type) {
	if (templateCategories[type] === 'mix') return true;
	const t = componentTemplates[type];
	return !!(t && t.element.querySelector('.mix-inner-slot'));
}

// ── 절차(process) 블록 관련 함수 ─────────────────────────────────────────

function renderPropsProcessSteps(block) {
	const container = document.getElementById('propsProcessStepsContainer');
	if (!container) return;
	const items = block.items || [];
	const minItems = 2;
	const isVerti = block.type === 'process-02';
	container.innerHTML = items.map((item, idx) => {
		const rawTitle = (item.title || '').replace(/<[^>]+>/g, '').slice(0, 14) || `단계 ${idx + 1}`;
		const isFin = idx === items.length - 1;
		const canRemove = isVerti && items.length > minItems;
		const subVal = (item.sub || '').replace(/<[^>]+>/g, '');
		return `<div class="props-list-row">
			<span class="props-list-row-dot"></span>
			<span class="props-list-row-text" style="flex-shrink:0;min-width:3.5rem">${escapeHtml(rawTitle)}${isFin ? '<em>*</em>' : ''}</span>
			<input type="text" class="props-input props-process-sub-input" style="flex:1;min-width:0"
				data-block-id="${block.id}" data-step-idx="${idx}"
				placeholder="설명 없음" value="${escapeAttr(subVal)}">
			${canRemove ? `<button type="button" class="props-list-row-remove-btn props-process-step-remove-btn" data-block-id="${block.id}" data-step-idx="${idx}" title="단계 삭제"><i class="ri-subtract-line"></i></button>` : ''}
		</div>`;
	}).join('');
}

function addProcessStep(blockId) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block || templateCategories[block.type] !== 'process') return;
	pushHistory();
	block.items.push({
		title: `단계 ${block.items.length + 1}`,
		sub: '',
		style: createStyleForType(block.type),
		innerBlocks: []
	});
	render();
	openBlockProps(blockId);
}

function removeProcessStep(blockId, stepIdx) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block || templateCategories[block.type] !== 'process') return;
	if (block.items.length <= 2) return;
	pushHistory();
	block.items.splice(stepIdx, 1);
	render();
	openBlockProps(blockId);
}

function addProcessStepInnerBlock(blockId, stepIdx, innerType) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	const item = block.items[stepIdx];
	if (!item) return;
	const innerTemplate = componentTemplates[innerType];
	if (!innerTemplate) return;
	pushHistory();
	const innerData = innerTemplate.getDefaultData ? innerTemplate.getDefaultData() : {};
	if (!Array.isArray(item.innerBlocks)) item.innerBlocks = [];
	const newIbIdx = item.innerBlocks.length;
	item.innerBlocks.push({
		type: innerType,
		marginBottom: 10,
		items: [{ ...cloneData(innerData), style: createStyleForType(innerType) }]
	});
	if (templateCategories[innerType] === 'list') {
		ensureListRows({ id: `${blockId}::pstep::${stepIdx}::inner::${newIbIdx}`, type: innerType, items: item.innerBlocks[newIbIdx].items });
	}
	render();
	selectBlock(blockId);
}

function addProcessStepInnerBlockFromExisting(blockId, stepIdx, sourceBlockId) {
	const block = state.blocks.find(b => b.id === blockId);
	const sourceBlock = state.blocks.find(b => b.id === sourceBlockId);
	if (!block || !sourceBlock) return;
	if (!MIX_ALLOWED.has(templateCategories[sourceBlock.type])) return;
	const item = block.items[stepIdx];
	if (!item) return;
	pushHistory();
	if (!Array.isArray(item.innerBlocks)) item.innerBlocks = [];
	item.innerBlocks.push({
		type: sourceBlock.type,
		marginBottom: sourceBlock.marginBottom ?? 10,
		items: cloneData(sourceBlock.items || [])
	});
	state.blocks = state.blocks.filter(b => b.id !== sourceBlockId);
	render();
	selectBlock(blockId);
}

function removeProcessStepInnerBlock(blockId, stepIdx, innerIdx) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	const item = block.items[stepIdx];
	if (!item || !Array.isArray(item.innerBlocks)) return;
	pushHistory();
	item.innerBlocks.splice(innerIdx, 1);
	render();
	selectBlock(blockId);
}

function toggleTableCellBlockZone(blockId, cellKey) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	pushHistory();
	if (!block.tableCellBlockZones) block.tableCellBlockZones = {};
	if (block.tableCellBlockZones[cellKey]) {
		delete block.tableCellBlockZones[cellKey];
		if (block.tableCellInnerBlocks?.[cellKey]) delete block.tableCellInnerBlocks[cellKey];
	} else {
		block.tableCellBlockZones[cellKey] = true;
		// 기존 셀 텍스트 내용 초기화
		(block.items || []).forEach(item => { if (cellKey in item) item[cellKey] = ''; });
	}
	render();
	renderPropsTableSection(block);
}

function addTableCellInnerBlock(blockId, cellKey, innerType) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	const innerTemplate = componentTemplates[innerType];
	if (!innerTemplate) return;
	pushHistory();
	const innerData = innerTemplate.getDefaultData ? innerTemplate.getDefaultData() : {};
	if (!block.tableCellInnerBlocks) block.tableCellInnerBlocks = {};
	block.tableCellInnerBlocks[cellKey] = {
		type: innerType,
		marginBottom: 0,
		items: [{ ...cloneData(innerData), style: createStyleForType(innerType) }]
	};
	if (templateCategories[innerType] === 'list') {
		ensureListRows({ id: `${blockId}::tcell::${cellKey}`, type: innerType, items: block.tableCellInnerBlocks[cellKey].items });
	}
	state.dragPayload = '';
	render();
	renderPropsTableSection(block);
}

function addTableCellInnerBlockFromExisting(blockId, cellKey, sourceBlockId) {
	const block = state.blocks.find(b => b.id === blockId);
	const sourceBlock = state.blocks.find(b => b.id === sourceBlockId);
	if (!block || !sourceBlock) return;
	if (!MIX_ALLOWED.has(templateCategories[sourceBlock.type])) return;
	pushHistory();
	if (!block.tableCellInnerBlocks) block.tableCellInnerBlocks = {};
	block.tableCellInnerBlocks[cellKey] = {
		type: sourceBlock.type,
		marginBottom: 0,
		items: cloneData(sourceBlock.items || [])
	};
	state.blocks = state.blocks.filter(b => b.id !== sourceBlockId);
	state.dragPayload = '';
	render();
	renderPropsTableSection(block);
}

function removeTableCellInnerBlock(blockId, cellKey) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block || !block.tableCellInnerBlocks?.[cellKey]) return;
	pushHistory();
	delete block.tableCellInnerBlocks[cellKey];
	render();
	renderPropsTableSection(block);
}

function moveProcessStepInnerBlock(blockId, stepIdx, fromIdx, toIdx) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	const item = block.items[stepIdx];
	if (!item || !Array.isArray(item.innerBlocks)) return;
	if (fromIdx < 0 || toIdx < 0 || fromIdx >= item.innerBlocks.length || toIdx >= item.innerBlocks.length) return;
	pushHistory();
	const [moved] = item.innerBlocks.splice(fromIdx, 1);
	item.innerBlocks.splice(toIdx, 0, moved);
	render();
	selectBlock(blockId);
}

// 혼합 블록에 내부 블록 추가
function addMixInnerBlock(blockId, innerType) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	const innerTemplate = componentTemplates[innerType];
	if (!innerTemplate) return;
	pushHistory();
	const innerData = innerTemplate.getDefaultData ? innerTemplate.getDefaultData() : {};
	if (!Array.isArray(block.innerBlocks)) block.innerBlocks = [];
	const newIb = {
		type: innerType,
		marginBottom: 10,
		items: [{ ...cloneData(innerData), style: createStyleForType(innerType) }]
	};
	if (block.type === 'button-00' && templateCategories[innerType] === 'button') {
		newIb.btnSize = '';
		newIb.btnOpenType = 'default';
		if (innerType === 'button-05' || innerType === 'button-06') newIb.btnIcon = 'ri-external-link-line';
		if (innerType === 'button-05') newIb.btnIconPos = 'before';
	}
	block.innerBlocks.push(newIb);
	render();
	if (block.type === 'button-00' && _propsBlockId === blockId) {
		openBlockProps(blockId);
	} else {
		selectBlock(blockId);
	}
}

// 혼합 블록 내부 순서 변경
function moveMixInnerBlock(blockId, fromIdx, toIdx) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block || !Array.isArray(block.innerBlocks)) return;
	if (fromIdx < 0 || toIdx < 0 || fromIdx >= block.innerBlocks.length || toIdx >= block.innerBlocks.length) return;
	pushHistory();
	const [moved] = block.innerBlocks.splice(fromIdx, 1);
	block.innerBlocks.splice(toIdx, 0, moved);
	render();
	selectBlock(blockId);
}

// 혼합 블록에 기존 캔버스 블록을 이동 (드래그 앤 드롭)
function addMixInnerBlockFromExisting(mixBlockId, sourceBlockId) {
	const mixBlock = state.blocks.find(b => b.id === mixBlockId);
	const sourceBlock = state.blocks.find(b => b.id === sourceBlockId);
	if (!mixBlock || !sourceBlock) return;
	if (!MIX_ALLOWED.has(templateCategories[sourceBlock.type])) return;
	pushHistory();
	if (!Array.isArray(mixBlock.innerBlocks)) mixBlock.innerBlocks = [];
	const movedIb = {
		type: sourceBlock.type,
		marginBottom: sourceBlock.marginBottom ?? 10,
		items: cloneData(sourceBlock.items || [])
	};
	if (mixBlock.type === 'button-00' && templateCategories[sourceBlock.type] === 'button') {
		movedIb.btnSize = sourceBlock.btnSize || '';
		movedIb.btnOpenType = sourceBlock.btnOpenType || 'default';
		movedIb.btnIcon = sourceBlock.btnIcon || 'ri-external-link-line';
		movedIb.btnIconPos = sourceBlock.btnIconPos || 'before';
	}
	mixBlock.innerBlocks.push(movedIb);
	state.blocks = state.blocks.filter(b => b.id !== sourceBlockId);
	render();
	selectBlock(mixBlockId);
}

// 혼합 블록에서 내부 블록 제거
function removeMixInnerBlock(blockId, innerIdx) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block || !Array.isArray(block.innerBlocks)) return;
	pushHistory();
	block.innerBlocks.splice(innerIdx, 1);
	render();
	selectBlock(blockId);
}

// title-list 블록 list-wrap 리스트 설정 (새 블록 드래그)
function setListWrapBlock(listWrapId, type) {
	const m = typeof listWrapId === 'string' && listWrapId.match(/^(.+)::list::(\d+)$/);
	if (!m) return;
	const outerBlock = state.blocks.find(b => b.id === m[1]);
	if (!outerBlock) return;
	const colIdx = parseInt(m[2], 10);
	if (!outerBlock.items[colIdx]) return;
	const innerTemplate = componentTemplates[type];
	if (!innerTemplate) return;
	pushHistory();
	const innerData = innerTemplate.getDefaultData ? innerTemplate.getDefaultData() : {};
	outerBlock.items[colIdx].listBlock = {
		type,
		columns: 1,
		items: [{ ...cloneData(innerData), style: createStyleForType(type) }]
	};
	render();
	selectBlock(m[1]);
}

// title-list 블록 list-wrap에 기존 캔버스 블록 이동
function setListWrapFromExisting(listWrapId, sourceBlockId) {
	const m = typeof listWrapId === 'string' && listWrapId.match(/^(.+)::list::(\d+)$/);
	if (!m) return;
	const outerBlock = state.blocks.find(b => b.id === m[1]);
	const sourceBlock = state.blocks.find(b => b.id === sourceBlockId);
	if (!outerBlock || !sourceBlock) return;
	const colIdx = parseInt(m[2], 10);
	if (!outerBlock.items[colIdx]) return;
	if (templateCategories[sourceBlock.type] !== 'list') return;
	pushHistory();
	outerBlock.items[colIdx].listBlock = { type: sourceBlock.type, columns: sourceBlock.items.length || 1, items: cloneData(sourceBlock.items || []) };
	state.blocks = state.blocks.filter(b => b.id !== sourceBlockId);
	render();
	selectBlock(m[1]);
}

// title-list 블록 list-wrap 리스트 제거
function clearListWrapBlock(listWrapId) {
	const m = typeof listWrapId === 'string' && listWrapId.match(/^(.+)::list::(\d+)$/);
	if (!m) return;
	const outerBlock = state.blocks.find(b => b.id === m[1]);
	const colIdx = parseInt(m[2], 10);
	if (!outerBlock || !outerBlock.items[colIdx]) return;
	pushHistory();
	outerBlock.items[colIdx].listBlock = null;
	render();
	selectBlock(blockId);
}

// title-list 블록 리스트 사용 여부 토글
function updateBlockUseList(blockId, useList) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	pushHistory();
	block.useList = useList;
	render();
	selectBlock(blockId);
}

function duplicateBlock(blockId) {
	duplicateBlockAt(blockId, blockId, 'after');
}

function duplicateBlockAt(blockId, targetBlockId, position = 'after') {
	if (_duplicatingBlock) return;
	const index = state.blocks.findIndex(b => b.id === blockId);
	if (index < 0) return;
	_duplicatingBlock = true;
	pushHistory();
	const cloned = cloneData(state.blocks[index]);
	cloned.id = `block-${state.nextBlockId++}`;
	const targetIndex = targetBlockId
		? state.blocks.findIndex(b => b.id === targetBlockId)
		: state.blocks.length - 1;
	if (targetIndex >= 0) {
		state.blocks.splice(targetIndex + (position === 'before' ? 0 : 1), 0, cloned);
	} else {
		state.blocks.push(cloned);
	}
	render();
	_duplicatingBlock = false;
	const newEl = canvasGrid.querySelector(`[data-block-id="${cloned.id}"]`);
	if (newEl) newEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	selectBlock(cloned.id);
}

function updateBlockColumns(blockId, count) {
	const listRef = resolveListInnerRef(blockId);
	if (listRef) {
		const { listBlock } = listRef;
		pushHistory();
		listBlock.columns = Number(count) || 1;
		syncListBlockItems(listBlock);
		render();
		return;
	}
	const block = state.blocks.find(item => item.id === blockId);
	if (!block) return;
	pushHistory();
	block.columns = Number(count) || 1;
	syncBlockItems(block);
	render();
}

function syncBlockItems(block) {
	const template = componentTemplates[block.type];
	const source = block.items[0] || (template.getDefaultData ? template.getDefaultData() : {});
	const hasTitleListWrap = templateCategories[block.type] === 'title-list' && template.element?.querySelector('.list-wrap');
	const isProcess = templateCategories[block.type] === 'process';
	while (block.items.length < block.columns) {
		const newItem = { ...cloneData(source), style: createStyleForType(block.type) };
		if (hasTitleListWrap) newItem.listBlock = null;
		if (isProcess) newItem.innerBlocks = [];
		block.items.push(newItem);
	}
	if (block.items.length > block.columns) block.items = block.items.slice(0, block.columns);
}

function syncListBlockItems(listBlock) {
	const template = componentTemplates[listBlock.type];
	const source = listBlock.items[0] || (template?.getDefaultData ? template.getDefaultData() : {});
	while (listBlock.items.length < listBlock.columns) {
		listBlock.items.push({ ...cloneData(source), style: createStyleForType(listBlock.type) });
	}
	if (listBlock.items.length > listBlock.columns) listBlock.items = listBlock.items.slice(0, listBlock.columns);
}

function clearCanvas() {
	pushHistory();
	state.blocks = [];
	state.nextBlockId = 1;
	state.dragPayload = '';
	state.overlays = [];
	state.selectedItem = null;
	renderOverlayItems();
	render();
}

// ── 템플릿 경로 헬퍼 ─────────────────────────────────────
function getTemplateBasePath(id) {
	return templateBasePaths[id] || `${TEMPLATE_DIR}${id}`;
}

// ── 썸네일 ──────────────────────────────────────────────
function getThumbUrl(templateId) {
	return `${getTemplateBasePath(templateId)}/screenshot.png`;
}

function getDecorationImageUrl(template) {
	const img = template?.element?.querySelector('img[src]');
	return img ? normalizeAssetPath(img.getAttribute('src')) : `${getTemplateBasePath(template.id)}/char.png`;
}

function loadCustomDecorations() {
	try {
		const raw = localStorage.getItem(CUSTOM_DECORATION_STORAGE_KEY);
		const items = raw ? JSON.parse(raw) : [];
		state.customDecorations = Array.isArray(items)
			? items.filter(item => item && item.id && item.src)
			: [];
	} catch (error) {
		state.customDecorations = [];
	}
}

function saveCustomDecorations() {
	localStorage.setItem(CUSTOM_DECORATION_STORAGE_KEY, JSON.stringify(state.customDecorations));
}

function getCustomDecoration(id) {
	return state.customDecorations.find(item => item.id === id);
}

function renderDecorationUploadControls() {
	return `
		<div class="decoration-upload">
			<input type="file" id="customDecorationUpload" accept="image/*" hidden>
			<button type="button" class="decoration-upload-button" id="customDecorationUploadButton">
				<i class="ri-upload-2-line" aria-hidden="true"></i>
				꾸밈요소 업로드
			</button>
		</div>
	`;
}

function renderCustomDecorationItems() {
	return state.customDecorations.map(item => `
		<div class="component-item component-item--decoration component-item--custom-decoration"
			draggable="true"
			data-decoration="true"
			data-custom-decoration-id="${escapeAttr(item.id)}">
			<div class="component-thumb" aria-hidden="true">
				<img src="${escapeAttr(item.src)}" alt="${escapeAttr(item.name || '사용자 꾸밈요소')}" class="component-thumb-img">
			</div>
			<button type="button" class="custom-decoration-remove" data-custom-decoration-remove="${escapeAttr(item.id)}" aria-label="사용자 꾸밈요소 삭제">
				<i class="ri-close-line" aria-hidden="true"></i>
			</button>
			<button type="button" class="component-add-btn" aria-label="${escapeAttr(item.name || item.id)} 추가">
				<i class="ri-add-line" aria-hidden="true"></i>
			</button>
		</div>
	`).join('');
}

function bindDecorationUploadEvents() {
	const input = document.getElementById('customDecorationUpload');
	const button = document.getElementById('customDecorationUploadButton');
	if (!input || !button) return;
	button.addEventListener('click', () => input.click());
	input.addEventListener('change', () => {
		const files = Array.from(input.files || []).filter(file => file.type.startsWith('image/'));
		if (!files.length) return;
		files.forEach(file => {
			const reader = new FileReader();
			reader.onload = () => {
				state.customDecorations.unshift({
					id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
					name: file.name.replace(/\.[^.]+$/, ''),
					src: String(reader.result || '')
				});
				saveCustomDecorations();
				renderDecorationPanel();
			};
			reader.readAsDataURL(file);
		});
		input.value = '';
	});
}

function renderComponentList() {
	const templates = Object.values(componentTemplates).filter(template => {
		const category = templateCategories[template.id] || 'box';
		if (category === 'design-template') return false;
		if (category === 'design-template-section') return false;
		if (category === 'decoration') return false; // 꾸밈 스튜디오 탭에서 별도 표시
		if (state.templateFilter === 'all') return true;
		return category === state.templateFilter;
	});

	if (!templates.length) {
		componentList.classList.add('is-empty-state');
		componentList.innerHTML = '<p class="template-empty">해당 필터의 디자인 블록이 없습니다.</p>';
		bindComponentEvents(componentList);
		return;
	}

	componentList.classList.remove('is-empty-state');
	componentList.innerHTML = templates.map(t => `
		<div class="component-item${t.isInline ? ' component-item--inline' : ''}" draggable="true" data-type="${t.id}">
			<div class="component-thumb component-thumb--loading" aria-hidden="true"></div>
			<span class="component-name">${escapeHtml(t.name)}</span>
			<button type="button" class="component-add-btn" aria-label="${escapeHtml(t.name)} 추가">
				<i class="ri-add-line" aria-hidden="true"></i>
			</button>
		</div>`).join('');
	bindComponentEvents(componentList);

	for (const template of templates) {
		const item = componentList.querySelector(`[data-type="${template.id}"]`);
		if (!item) continue;
		const thumb = item.querySelector('.component-thumb');
		thumb.classList.remove('component-thumb--loading');
		if ((templateCategories[template.id] || '') === 'mix') {
			thumb.innerHTML = `<div class="mix-thumb-placeholder">이미지 없음</div>`;
		} else {
			const img = document.createElement('img');
			img.src = getThumbUrl(template.id);
			img.alt = template.id;
			img.className = 'component-thumb-img';
			img.onerror = () => {
				thumb.innerHTML = '<div class="mix-thumb-placeholder">이미지 없음</div>';
			};
			thumb.appendChild(img);
		}
	}
}


function renderCustomPanel() {
	const customList = document.getElementById('customTemplateList');
	if (!customList) return;

	const templates = Object.values(componentTemplates).filter(t => {
		return (templateCategories[t.id] || '') === 'design-template';
	});

	if (!templates.length) {
		customList.classList.add('is-empty-state');
		customList.innerHTML = '<p class="template-empty">커스텀 템플릿이 없습니다.</p>';
		bindComponentEvents(customList);
		return;
	}

	customList.classList.remove('is-empty-state');
	customList.innerHTML = templates.map(t => `
		<div class="component-item" draggable="true" data-type="${t.id}">
			<div class="component-thumb component-thumb--loading" aria-hidden="true"></div>
			<span class="component-name">${escapeHtml(t.name)}</span>
			<button type="button" class="component-add-btn" aria-label="${escapeHtml(t.name)} 추가">
				<i class="ri-add-line" aria-hidden="true"></i>
			</button>
		</div>`).join('');
	bindComponentEvents(customList);

	for (const t of templates) {
		const item = customList.querySelector(`[data-type="${t.id}"]`);
		if (!item) continue;
		const thumb = item.querySelector('.component-thumb');
		thumb.classList.remove('component-thumb--loading');
		const img = document.createElement('img');
		img.src = getThumbUrl(t.id);
		img.alt = t.id;
		img.className = 'component-thumb-img';
		img.onerror = () => { thumb.innerHTML = '<div class="mix-thumb-placeholder">미리보기 없음</div>'; };
		thumb.appendChild(img);
	}

	const hasNewsletter = state.blocks.some(b => b.type.startsWith('newsletter-01__section_'));
	const exportSection = document.getElementById('customExportSection');
	if (exportSection) exportSection.style.display = hasNewsletter ? '' : 'none';
}


async function generateNewsletterHtml() {
	const newsletterBlocks = state.blocks.filter(b => b.type.startsWith('newsletter-01__section_'));
	if (!newsletterBlocks.length) return null;

	const fetchCss = async path => {
		try { const r = await fetch(path); return r.ok ? await r.text() : ''; }
		catch (_) { return ''; }
	};

	const baseCssPaths = [
		'/css/basic.css',
		'/css/common.css',
		'/css/con_com.css',
		'/css/theme.css',
		'/templates/design_template/newsletter-01/style.css'
	];
	const bodyBlocks = state.blocks.filter(b => b._isNlBodyBlock);
	const bodyBlockCssPaths = [...new Set(
		bodyBlocks
			.map(bb => componentTemplates[bb.type]?.path)
			.filter(Boolean)
			.map(p => getTemplateCssPath(p))
	)];
	const allCssPaths = [...baseCssPaths, ...bodyBlockCssPaths];
	const cssTexts = await Promise.all(allCssPaths.map(fetchCss));
	const inlinedCss = cssTexts.filter(Boolean).join('\n');

	const sections = newsletterBlocks.map(block => {
		const template = componentTemplates[block.type];
		if (!template) return '';
		const lines = template.markup(block.items[0] || {});
		let sectionHtml = Array.isArray(lines) ? lines.join('\n') : lines;
		// 헤더 섹션: 로고 이미지 및 연락처 처리
		if (block.type === 'newsletter-01__section_1') {
			const tmp = document.createElement('div');
			tmp.innerHTML = sectionHtml;
			const logoImg = tmp.querySelector('img[data-nl-logo]');
			if (logoImg) {
				if (block.nlLogoSrc) {
					logoImg.setAttribute('src', block.nlLogoSrc);
					logoImg.setAttribute('alt', block.nlLogoAlt || '');
					logoImg.style.display = '';
				} else {
					logoImg.remove();
				}
				if (tmp.querySelector('img[data-nl-logo]')) tmp.querySelector('img[data-nl-logo]').removeAttribute('data-nl-logo');
			}
			const deptVal = (block.items[0] || {}).dept || '';
			const phoneVal = (block.items[0] || {}).phone || '';
			const contactRow = tmp.querySelector('.nl-header-info');
			if (contactRow && !deptVal && !phoneVal) contactRow.remove();
			sectionHtml = tmp.innerHTML;
		}
		// 본문 섹션: 구조적 body 블록 내보내기
		if (block.type === 'newsletter-01__section_3') {
			const tmp = document.createElement('div');
			tmp.innerHTML = sectionHtml;
			const contentArea = tmp.querySelector('.nl-content-area');
			if (contentArea) {
				const bodyBlocks = state.blocks.filter(b => b._isNlBodyBlock && b._parentSectionId === block.id);
				if (bodyBlocks.length > 0) {
					contentArea.innerHTML = '';
					bodyBlocks.forEach(bb => {
						const bbTemplate = componentTemplates[bb.type];
						if (!bbTemplate) return;
						let bbHtml;
						if (bbTemplate.isRootWrap) {
							const bbEl = renderAddColumnWrapElement(bbTemplate, bb.items[0] || {}, bb, 0, false);
							stripEditorAttributes(bbEl);
							bbHtml = elementToHtml(bbEl);
						} else {
							const bbEl = buildColumnBlock(bbTemplate, bb, false);
							bbHtml = bbEl instanceof Element ? elementToHtml(bbEl) : String(bbEl);
						}
						const wrapper = document.createElement('div');
						wrapper.className = 'nl-block-insert';
						const gapPx = (bb.marginBottom !== undefined && bb.marginBottom !== null)
							? bb.marginBottom
							: (parseInt(state.newsletterStyle.blockGap) || 12);
						wrapper.style.marginBottom = gapPx + 'px';
						if (bb.blockWidth) wrapper.style.width = bb.blockWidth;
						if (bb.blockAlign === 'ac') { wrapper.style.marginLeft = 'auto'; wrapper.style.marginRight = 'auto'; }
						else if (bb.blockAlign === 'ar') { wrapper.style.marginLeft = 'auto'; }
						wrapper.innerHTML = bbHtml;
						contentArea.appendChild(wrapper);
					});
				}
			}
			sectionHtml = tmp.innerHTML;
		}
		return sectionHtml;
	}).join('\n');

	const ns = state.newsletterStyle;
	const nlFontFamily = ns.fontFamily || "'Pretendard', 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif";
	const nlFontSize = ns.fontSize ? `${ns.fontSize}px` : '15px';
	const nlLineHeight = ns.lineHeight || '1.9';
	const nlFontWeight = ns.fontWeight || 'normal';
	const nlBlockGap = ns.blockGap ? `${ns.blockGap}px` : '12px';

	return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=768">
<title>가정통신문</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
${inlinedCss}
  @page { size: A4 portrait; margin: 20mm 18mm; }
  body {
    font-family: ${nlFontFamily};
    background: #fff;
    margin: 0;
    padding: 0;
  }
  .nl-template {
    --nl-font-family: ${nlFontFamily};
  }
  .nl-content-area {
    --nl-font-size: ${nlFontSize};
    --nl-line-height: ${nlLineHeight};
    --nl-font-weight: ${nlFontWeight};
  }
  .nl-print-wrapper {
    max-width: 768px;
    margin: 0 auto;
    padding: 0;
  }
  .nl-content-area {
    --box-inr-padding: 0.75rem 1rem;
    --margin-default: 0.5rem;
    --title-size: 1.8rem;
  }
  @media print {
    .nl-content-area {
      --box-inr-padding: 0.75rem 1rem;
      --margin-default: 0.5rem;
      --title-size: 1.8rem;
    }
  }
</style>
</head>
<body>
<div class="nl-print-wrapper">
${sections}
</div>
</body>
</html>`;
}


async function exportNewsletterDoc() {
	const html = await generateNewsletterHtml();
	if (!html) {
		alert('캔버스에 가정통신문 블록이 없습니다.\n먼저 [디자인 커스텀] 탭에서 가정통신문 템플릿을 추가하세요.');
		return;
	}
	const blob = new Blob(['﻿' + html], { type: 'application/msword;charset=utf-8' });
	const url  = URL.createObjectURL(blob);
	const a    = document.createElement('a');
	a.href     = url;
	a.download = '가정통신문.doc';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}



async function exportNewsletterDownload() {
	const html = await generateNewsletterHtml();
	if (!html) {
		alert('캔버스에 가정통신문 블록이 없습니다.\n먼저 [디자인 커스텀] 탭에서 가정통신문 템플릿을 추가하세요.');
		return;
	}
	const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = '가정통신문.html';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}


function renderDecorationPanel() {
	// ── 필터 탭 ──
	const filtersEl = document.getElementById('decoFilters');
	if (filtersEl) {
		filtersEl.innerHTML = DECORATION_FILTERS.map(f => `
			<button type="button" class="deco-filter-btn${state.decorationFilter === f.id ? ' is-active' : ''}"
				data-deco-filter="${escapeHtml(f.id)}">${escapeHtml(f.label)}</button>
		`).join('');
		const panel = document.getElementById('panelDecoration') || filtersEl.parentElement || document;
		KlicBuilderShared.bindScrollableFilters(panel);
		KlicBuilderShared.bindFilterEvents({
			container: panel,
			onDecoFilter: filter => {
				state.decorationFilter = filter;
				renderDecorationPanel();
			}
		});
	}

	// ── 아이템 그리드 ──
	const panelEl = document.getElementById('decorationPanel');
	if (!panelEl) return;

	const decorationTemplates = Object.values(componentTemplates).filter(t => {
		if ((templateCategories[t.id] || '') !== 'decoration') return false;
		if (state.decorationFilter === 'all') return true;
		return getDecorationCategory(t.id) === state.decorationFilter;
	});

	const showCustom = state.decorationFilter === 'all' || state.decorationFilter === 'etc';
	const customItemsHtml = showCustom ? renderCustomDecorationItems() : '';

	if (!decorationTemplates.length && !customItemsHtml) {
		panelEl.classList.add('is-empty');
		panelEl.innerHTML = '<p class="template-empty deco-empty">꾸밈요소가 없습니다.</p>';
	} else {
		panelEl.classList.remove('is-empty');
		panelEl.innerHTML = customItemsHtml + decorationTemplates.map(t => `
			<div class="component-item component-item--decoration" draggable="true" data-type="${t.id}" data-decoration="true">
				<div class="component-thumb component-thumb--loading" aria-hidden="true"></div>
				<button type="button" class="component-add-btn" aria-label="${t.id} 추가">
					<i class="ri-add-line" aria-hidden="true"></i>
				</button>
			</div>`).join('');
	}

	// ── 업로드 버튼 (맨 아래 고정) ──
	const uploadEl = document.getElementById('decoUploadArea');
	if (uploadEl) {
		uploadEl.innerHTML = '';
		uploadEl.hidden = true;
	}

	bindComponentEvents(panelEl);

	for (const t of decorationTemplates) {
		const item = panelEl.querySelector(`[data-type="${t.id}"]`);
		if (!item) continue;
		const thumb = item.querySelector('.component-thumb');
		thumb.classList.remove('component-thumb--loading');
		thumb.innerHTML = `<img src="${escapeAttr(getDecorationImageUrl(t))}" alt="${t.id}" class="component-thumb-img">`;
	}
}

function getTemplateRecommend(templateOrId) {
	const template = typeof templateOrId === 'string' ? componentTemplates[templateOrId] : templateOrId;
	return template?.recommend || {};
}

function asRecommendTokens(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.map(item => String(item).toLowerCase());
	return [String(value).toLowerCase()];
}

function getCanvasRecommendTokens() {
	const tokens = [];
	state.blocks.forEach(block => {
		const meta = getTemplateRecommend(block.type);
		tokens.push(
			...asRecommendTokens(meta.category),
			...asRecommendTokens(meta.colors),
			...asRecommendTokens(meta.tone),
			...asRecommendTokens(meta.style),
			...asRecommendTokens(meta.keywords),
			...asRecommendTokens(meta.matchWith)
		);
	});
	return tokens;
}

function getCanvasPrimaryColors() {
	return state.blocks
		.map(block => asRecommendTokens(getTemplateRecommend(block.type).colors)[0])
		.filter(Boolean);
}

function scoreRecommendedTemplate(template) {
	const meta = getTemplateRecommend(template);
	const tokens = getCanvasRecommendTokens();
	const primaryColors = getCanvasPrimaryColors();
	const colors = asRecommendTokens(meta.colors);
	const ownTokens = [
		...asRecommendTokens(meta.category),
		...colors,
		...asRecommendTokens(meta.tone),
		...asRecommendTokens(meta.style),
		...asRecommendTokens(meta.keywords),
		...asRecommendTokens(meta.matchWith)
	];
	const overlap = ownTokens.reduce((score, token) => score + (tokens.includes(token) ? 1 : 0), 0);
	const primaryColorScore = primaryColors.includes(colors[0]) ? 100 : (colors.some(color => primaryColors.includes(color)) ? 20 : 0);
	const category = templateCategories[template.id] || '';
	const alreadyUsed = state.blocks.some(block => block.type === template.id);
	const usedCategoryCount = state.blocks.filter(block => (templateCategories[block.type] || '') === category).length;
	return primaryColorScore + overlap * 10 + (alreadyUsed ? -12 : 0) + (usedCategoryCount ? 1 : 5);
}

function getRecommendedBlocks(limit = 12) {
	return Object.values(componentTemplates)
		.filter(template => {
			const category = templateCategories[template.id] || 'box';
			if (!SHOW_MIX_BLOCKS && category === 'mix') return false;
			return category !== 'decoration' && category !== 'design-template' && category !== 'design-template-section' && category !== 'divider';
		})
		.sort((a, b) => scoreRecommendedTemplate(b) - scoreRecommendedTemplate(a) || a.id.localeCompare(b.id))
		.slice(0, limit);
}

function getRecommendedDecorations(limit = 12) {
	return Object.values(componentTemplates)
		.filter(template => (templateCategories[template.id] || '') === 'decoration')
		.sort((a, b) => scoreRecommendedTemplate(b) - scoreRecommendedTemplate(a) || a.id.localeCompare(b.id))
		.slice(0, limit);
}

function getRecommendedIcons(limit = 18) {
	const tokens = getCanvasRecommendTokens();
	const icons = ICON_CATEGORIES.flatMap(cat => {
		const catTokens = [cat.id, cat.label].filter(Boolean).map(item => String(item).toLowerCase());
		if (cat.groups?.length) {
			return cat.groups.flatMap(group => (group.icons || []).map(icon => ({
				...icon,
				_scoreTokens: [...catTokens, group.id, group.label, icon.name].filter(Boolean).map(item => String(item).toLowerCase())
			})));
		}
		return (cat.icons || []).map(icon => ({
			...icon,
			_scoreTokens: [...catTokens, icon.name].filter(Boolean).map(item => String(item).toLowerCase())
		}));
	});
	return icons
		.sort((a, b) => {
			const score = icon => icon._scoreTokens.reduce((sum, token) => sum + (tokens.some(base => token.includes(base) || base.includes(token)) ? 1 : 0), 0);
			return score(b) - score(a) || String(a.name || '').localeCompare(String(b.name || ''));
		})
		.slice(0, limit);
}

function getPanelCenterPoint() {
	const grid = document.getElementById('canvasGrid');
	const wrapper = document.getElementById('canvasWrapper');
	if (!grid || !wrapper) return { x: 100, y: 100 };
	const gRect = grid.getBoundingClientRect();
	const wRect = wrapper.getBoundingClientRect();
	return {
		x: Math.max(0, (wRect.left + wRect.width / 2) - gRect.left - 60),
		y: Math.max(0, (wRect.top + wRect.height / 2) - gRect.top - 60)
	};
}

function createRecommendationPanel() {
	let panel = document.getElementById('recommendPanel');
	if (panel) return panel;
	panel = document.createElement('aside');
	panel.id = 'recommendPanel';
	panel.className = 'recommend-panel';
	panel.dataset.recommendTab = 'blocks';
	panel.dataset.initialOffset = 'true';
	panel.innerHTML = `
		<div class="recommend-panel-head" data-recommend-drag-handle>
			<strong>추천디자인</strong>
			<button type="button" class="recommend-close" aria-label="추천디자인 닫기">
				<i class="ri-close-line" aria-hidden="true"></i>
			</button>
		</div>
		<div class="filter-scroll-shell recommend-tab-shell">
			<div class="component-filters recommend-tabs" role="tablist">
				<button type="button" class="is-active" data-recommend-tab="blocks">디자인블록</button>
				<button type="button" data-recommend-tab="decorations">꾸밈스튜디오</button>
			</div>
		</div>
		<div class="recommend-list"></div>
	`;
	document.body.appendChild(panel);
	bindRecommendationPanel(panel);
	return panel;
}

function bindRecommendationPanel(panel) {
	panel.querySelector('.recommend-close')?.addEventListener('click', () => {
		panel.dataset.dismissed = 'true';
		panel.dataset.wasOpened = 'true';
		panel.classList.remove('is-open');
		updateRecommendFab();
	});
	panel.querySelectorAll('[data-recommend-tab]').forEach(button => {
		button.addEventListener('click', () => {
			panel.dataset.recommendTab = button.dataset.recommendTab;
			panel.querySelectorAll('[data-recommend-tab]').forEach(btn => {
				btn.classList.toggle('is-active', btn === button);
			});
			renderRecommendationPanel();
		});
	});

	const handle = panel.querySelector('[data-recommend-drag-handle]');
	let dragging = false;
	let startX = 0;
	let startY = 0;
	let startLeft = 0;
	let startTop = 0;
	handle?.addEventListener('pointerdown', event => {
		if (event.button !== 0 || event.target.closest('button')) return;
		dragging = true;
		startX = event.clientX;
		startY = event.clientY;
		const rect = panel.getBoundingClientRect();
		startLeft = rect.left;
		startTop = rect.top;
		panel.classList.add('is-dragging');
		handle.setPointerCapture?.(event.pointerId);
	});
	handle?.addEventListener('pointermove', event => {
		if (!dragging) return;
		const width = panel.offsetWidth;
		const height = panel.offsetHeight;
		const left = Math.max(8, Math.min(window.innerWidth - width - 8, startLeft + event.clientX - startX));
		const top = Math.max(8, Math.min(window.innerHeight - height - 8, startTop + event.clientY - startY));
		panel.style.left = `${left}px`;
		panel.style.top = `${top}px`;
		panel.style.right = 'auto';
		panel.dataset.userPosition = 'true';
	});
	const stopDrag = event => {
		if (!dragging) return;
		dragging = false;
		panel.classList.remove('is-dragging');
		handle.releasePointerCapture?.(event.pointerId);
	};
	handle?.addEventListener('pointerup', stopDrag);
	handle?.addEventListener('pointercancel', stopDrag);
}

function shouldShowRecommendationPanel() {
	return false; // 추천디자인 패널 임시 비활성화
}

function positionRecommendationPanel(panel) {
	if (!panel || panel.dataset.userPosition === 'true') return;
	const anchor = document.getElementById('canvasWrapper');
	let top = anchor ? Math.max(8, anchor.getBoundingClientRect().top) : 8;
	if (panel.dataset.initialOffset === 'true') {
		top += 10;
		delete panel.dataset.initialOffset;
	}
	const propsPanel = document.getElementById('blockPropsPanel');
	const rightOffset = (propsPanel?.classList.contains('is-open') ? 280 : 0) + 8;
	panel.style.left = 'auto';
	panel.style.right = `${rightOffset}px`;
	panel.style.top = `${top}px`;
	panel.dataset.hasPosition = 'true';
}

function updateRecommendFab() {
	const button = document.getElementById('recommendPanelOpen');
	if (!button) return;
	const panel = document.getElementById('recommendPanel');
	const showButton = shouldShowRecommendationPanel() && panel?.dataset.dismissed === 'true' && panel?.dataset.wasOpened === 'true';
	button.hidden = !showButton;
}

function openRecommendationPanel() {
	const panel = createRecommendationPanel();
	panel.dataset.dismissed = 'false';
	panel.dataset.wasOpened = 'true';
	panel.classList.add('is-open');
	if (panel.dataset.hasPosition !== 'true') {
		positionRecommendationPanel(panel);
	}
	renderRecommendationPanel();
	updateRecommendFab();
}

function renderRecommendationPanel() {
	const shouldShow = shouldShowRecommendationPanel();
	if (!shouldShow) {
		const panel = document.getElementById('recommendPanel');
		if (panel) {
			panel.classList.remove('is-open');
		}
		updateRecommendFab();
		return;
	}
	const panel = createRecommendationPanel();
	if (panel.dataset.dismissed !== 'true') {
		panel.dataset.dismissed = 'false';
		panel.classList.add('is-open');
	} else {
		panel.classList.remove('is-open');
	}
	updateRecommendFab();

	const list = panel.querySelector('.recommend-list');
	if (!list) return;
	const tab = panel.dataset.recommendTab === 'decorations' ? 'decorations' : 'blocks';
	panel.dataset.recommendTab = tab;
	if (panel.dataset.initialOffset === 'true') {
		positionRecommendationPanel(panel);
	}
	if (tab === 'decorations') {
		const decorations = getRecommendedDecorations();
		list.innerHTML = decorations.length ? decorations.map(template => `
			<button type="button" class="recommend-item component-item component-item--decoration" data-recommend-decoration="${escapeAttr(template.id)}">
				<span class="component-thumb">
					<img src="${escapeAttr(getDecorationImageUrl(template))}" alt="${escapeAttr(template.id)}" class="component-thumb-img">
				</span>
				<span class="component-add-btn" aria-hidden="true">
					<i class="ri-add-line" aria-hidden="true"></i>
				</span>
			</button>
		`).join('') : '<p class="recommend-empty">추천 꾸밈요소가 없습니다.</p>';
		list.querySelectorAll('[data-recommend-decoration]').forEach(button => {
			button.addEventListener('click', event => {
				event.preventDefault();
				event.stopPropagation();
				const pos = getPanelCenterPoint();
				addOverlay(button.dataset.recommendDecoration, pos.x, pos.y);
			});
		});
		return;
	}
	const blocks = getRecommendedBlocks();
	list.innerHTML = blocks.map(template => `
		<button type="button" class="recommend-item component-item" data-recommend-block="${escapeAttr(template.id)}">
			<span class="component-thumb">
				<img src="${escapeAttr(getThumbUrl(template.id))}" alt="${escapeAttr(template.id)}" class="component-thumb-img">
			</span>
			<span class="component-add-btn" aria-hidden="true">
				<i class="ri-add-line" aria-hidden="true"></i>
			</span>
		</button>
	`).join('');
	list.querySelectorAll('[data-recommend-block]').forEach(button => {
		button.addEventListener('click', event => {
			event.preventDefault();
			addBlock(button.dataset.recommendBlock);
			const panel = document.getElementById('recommendPanel');
			if (panel) panel.classList.add('is-open');
		});
	});
}

function applyRecommendedIcon(src, name) {
	const selected = state.selectedItem;
	if (!selected || selected.columnIndex === null) return;
	const item = findItemByBlockId(selected.blockId, selected.columnIndex);
	if (!item || !Object.prototype.hasOwnProperty.call(item, 'icon')) return;
	pushHistory();
	item.icon = `<img src="${escapeAttr(src)}" alt="${escapeAttr(name || '아이콘')}" class="block-icon-img">`;
	render();
}

function switchSidebarTab(tab) {
	state.sidebarTab = tab;
	document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
		btn.classList.toggle('is-active', btn.dataset.sidebarTab === tab);
	});
	const panelBlocks = document.getElementById('panelBlocks');
	const panelCustom = document.getElementById('panelCustom');
	if (panelBlocks) panelBlocks.classList.toggle('is-hidden', tab !== 'blocks');
	if (panelCustom) panelCustom.classList.toggle('is-hidden', tab !== 'custom');
	if (tab === 'custom') renderCustomPanel();
	renderRecommendationPanel();
}

function openDecoStudio() {
	if (state.previewDevice !== 'pc') return;
	document.body.classList.add('deco-studio-open');
	renderDecorationPanel();
}

function closeDecoStudio() {
	document.querySelector('.sidebar')?.classList.remove('deco-studio-open');
	document.body.classList.remove('deco-studio-open');
}

function relocateDecoStudioDrawer() {
	const drawer = document.getElementById('decoStudioDrawer');
	if (drawer && drawer.parentElement !== document.body) {
		document.body.appendChild(drawer);
	}
}

function updateDecoStudioAvailability() {
	const button = document.getElementById('decoStudioOpen');
	const recommendButton = document.getElementById('recommendPanelOpen');
	const disabled = state.previewDevice !== 'pc';
	if (button) {
		button.classList.toggle('is-disabled', disabled);
		button.setAttribute('aria-disabled', String(disabled));
		button.setAttribute(
			'aria-label',
			disabled ? '태블릿·모바일 모드에서는\n꾸밈 스튜디오를 사용할 수 없습니다' : '꾸밈 스튜디오 열기'
		);
	}
	if (disabled) closeDecoStudio();

	// update tooltip fixed-position vars when disabled so it can escape overflow clipping
	try {
		const btn = document.getElementById('decoStudioOpen');
		if (btn && disabled) {
			setDecoTooltipFixedPosition(btn);
			document.documentElement.classList.add('deco-tooltip-fixed');
		} else {
			document.documentElement.classList.remove('deco-tooltip-fixed');
		}
	} catch (e) { /* ignore */ }
}

function setDecoTooltipFixedPosition(btn) {
    const rect = btn.getBoundingClientRect();
    const top = rect.top + rect.height / 2;
    const left = rect.left - 12; // place tooltip to left of button
    document.documentElement.style.setProperty('--deco-tooltip-top', `${top}px`);
    document.documentElement.style.setProperty('--deco-tooltip-left', `${left}px`);
}

window.addEventListener('resize', () => {
    const btn = document.getElementById('decoStudioOpen');
    if (btn && btn.getAttribute('aria-disabled') === 'true') setDecoTooltipFixedPosition(btn);
});

// Ensure hover shows tooltip for disabled deco button by adding a class and reusing the existing pseudo-element style.
function attachDecoTooltipHover() {
	const btn = document.getElementById('decoStudioOpen');
	if (!btn) return;
	btn.addEventListener('mouseenter', () => {
		if (btn.getAttribute('aria-disabled') === 'true') {
			setDecoTooltipFixedPosition(btn);
			document.documentElement.classList.add('deco-tooltip-hover');
		}
	});
	btn.addEventListener('mouseleave', () => {
		document.documentElement.classList.remove('deco-tooltip-hover');
	});
}

// try attach immediately; if scripts run before DOM ready, defer
if (document.readyState === 'complete' || document.readyState === 'interactive') {
	attachDecoTooltipHover();
} else {
	window.addEventListener('DOMContentLoaded', attachDecoTooltipHover);
}

function bindFilterEvents() {
	const panelBlocks = document.getElementById('panelBlocks') || document;
	KlicBuilderShared.bindFilterEvents({
		container: panelBlocks,
		onBlockFilter: switchFilterTab
	});
	KlicBuilderShared.bindScrollableFilters(panelBlocks);
}

function activateFilterButton(button) {
	if (!button) return;
	if (button.dataset.templateFilter) {
		switchFilterTab(button.dataset.templateFilter);
		return;
	}
	if (button.dataset.decoFilter) {
		state.decorationFilter = button.dataset.decoFilter;
		renderDecorationPanel();
	}
}

function initFilterScrollUI() {
	document.querySelectorAll('.filter-scroll-shell').forEach(shell => {
		const scroller = shell.querySelector('.component-filters, .deco-filters');
		if (!scroller || scroller.dataset.scrollUiBound === 'true') return;
		scroller.dataset.scrollUiBound = 'true';

		const updateEdges = () => {
			const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
			shell.classList.toggle('is-start', scroller.scrollLeft <= 1);
			shell.classList.toggle('is-end', scroller.scrollLeft >= max - 1);
			shell.classList.toggle('is-scrollable', max > 1);
		};

		let dragging = false;
		let didDrag = false;
		let startX = 0;
		let startLeft = 0;
		let pressButton = null;
		let suppressNextClick = false;

		scroller.addEventListener('pointerdown', event => {
			if (event.button !== 0) return;
			dragging = true;
			didDrag = false;
			startX = event.clientX;
			startLeft = scroller.scrollLeft;
			pressButton = event.target.closest('[data-template-filter], [data-deco-filter]');
			scroller.setPointerCapture?.(event.pointerId);
		});
		scroller.addEventListener('pointermove', event => {
			if (!dragging) return;
			const delta = event.clientX - startX;
			if (!didDrag && Math.abs(delta) < 5) return;
			didDrag = true;
			scroller.classList.add('is-dragging');
			event.preventDefault();
			scroller.scrollLeft = startLeft - (event.clientX - startX);
		});
		const stopDrag = event => {
			if (!dragging) return;
			const clickedButton = !didDrag ? pressButton : null;
			if (!didDrag && pressButton) {
				suppressNextClick = true;
			}
			dragging = false;
			pressButton = null;
			scroller.classList.remove('is-dragging');
			scroller.releasePointerCapture?.(event.pointerId);
			if (clickedButton) activateFilterButton(clickedButton);
		};
		scroller.addEventListener('click', event => {
			if (suppressNextClick) {
				event.preventDefault();
				event.stopPropagation();
				suppressNextClick = false;
				return;
			}
			if (!didDrag) return;
			event.preventDefault();
			event.stopPropagation();
			didDrag = false;
		}, true);
		scroller.addEventListener('dragstart', event => event.preventDefault());
		scroller.addEventListener('pointerup', stopDrag);
		scroller.addEventListener('pointercancel', stopDrag);
		scroller.addEventListener('mouseleave', () => {
			dragging = false;
			didDrag = false;
			pressButton = null;
			scroller.classList.remove('is-dragging');
		});
		scroller.addEventListener('wheel', event => {
			if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
			event.preventDefault();
			scroller.scrollLeft += event.deltaY;
		}, { passive: false });
		scroller.addEventListener('scroll', updateEdges);
		new ResizeObserver(updateEdges).observe(scroller);
		requestAnimationFrame(updateEdges);
	});
}


function applyItemStyles(container, item, template) {
	const so = template?.styleOptions;
	if (!so) return;
	const style = getColumnStyle(item);
	Object.entries(so).forEach(([targetKey, targetConfig]) => {
		if (targetKey === 'title' || targetKey === 'body') return;
		const cssClass = targetConfig.cssClass;
		if (!cssClass) return;
		container.querySelectorAll(cssClass).forEach(el => {
			(targetConfig.fields || []).forEach(f => {
				const val = style[`${targetKey}${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`];
				if (val == null) return;
				if (f.key === 'backgroundColor') el.style.backgroundColor = val;
				else if (f.key === 'textColor') el.style.color = val;
				else if (f.key === 'borderColor') el.style.borderColor = val;
			});
			const fw = style[`${targetKey}FontWeight`];
			const fs = style[`${targetKey}FontSize`];
			if (fw) el.style.fontWeight = fw;
			if (fs) el.style.fontSize = `${fs}px`;
		});
	});
}

function applyAllTemplateStyles() {
	state.blocks.forEach(block => {
		const template = componentTemplates[block.type];
		const blockEl = document.querySelector(`.builder-block[data-block-id="${block.id}"]`);
		if (!blockEl) return;
		// 외부 블록 아이템 스타일 적용 (list-wrap 내부 .block-item 제외)
		const outerItems = Array.from(blockEl.querySelectorAll('.block-item')).filter(el => {
			const bid = el.dataset.blockId || '';
			return !bid.match(/::list::\d+$/);
		});
		block.items.forEach((item, idx) => {
			if (outerItems[idx]) applyItemStyles(outerItems[idx], item, template);
		});
		// title-list 블록 list-wrap 내부 스타일 적용 (행별 독립)
		if (block.useList) {
			const listWraps = Array.from(blockEl.querySelectorAll('.list-wrap'));
			listWraps.forEach((listWrap, wrapIdx) => {
				const rowItem = block.items[wrapIdx];
				if (!rowItem || !rowItem.listBlock) return;
				const listTemplate = componentTemplates[rowItem.listBlock.type];
				if (!listTemplate) return;
				const innerItems = listWrap.querySelectorAll('.block-item');
				rowItem.listBlock.items.forEach((lb_item, idx) => {
					if (innerItems[idx]) applyItemStyles(innerItems[idx], lb_item, listTemplate);
				});
			});
		}
	});
}

function syncCanvasPresence() {
	const canvasBlockCount = state.blocks.filter(b => !b._isNlBodyBlock).length;
	const hasBlocks = canvasBlockCount > 0;
	const hasOverlays = state.overlays.length > 0;
	layoutStatus.textContent = hasOverlays
		? `${canvasBlockCount}개 블록 · ${state.overlays.length}개 꾸밈요소`
		: `${canvasBlockCount}개 블록`;
	const builderMain = document.getElementById('builderMain');
	builderMain.classList.toggle('has-blocks', hasBlocks);
	builderMain.classList.toggle('has-overlays', hasOverlays);
	return { hasBlocks, hasOverlays };
}

function syncCanvasGuideSize() {
	const guide = document.querySelector('.canvas-guide');
	if (!guide || !canvasGrid) return;
	const gridHeight = canvasGrid.scrollHeight || canvasGrid.offsetHeight || 0;
	const wrapper = document.getElementById('canvasWrapper');
	const wrapperHeight = wrapper?.clientHeight || 0;
	guide.style.height = `${Math.max(gridHeight, wrapperHeight)}px`;
}

function render() {
	state.blocks.forEach(block => {
		if (templateCategories[block.type] === 'list') ensureListRows(block);
		if (Array.isArray(block.innerBlocks)) {
			block.innerBlocks.forEach((ib, idx) => {
				if (templateCategories[ib.type] === 'list') {
					ensureListRows({ id: `${block.id}::inner::${idx}`, type: ib.type, items: ib.items });
				}
			});
		}
		// process 블록: 각 step의 inner list blocks rows 초기화
		if (templateCategories[block.type] === 'process') {
			block.items.forEach((item, stepIdx) => {
				(item.innerBlocks || []).forEach((ib, ibIdx) => {
					if (templateCategories[ib.type] === 'list') {
						ensureListRows({ id: `${block.id}::pstep::${stepIdx}::inner::${ibIdx}`, type: ib.type, items: ib.items });
					}
				});
			});
		}
		// 테이블 셀 내부 블록 list rows 초기화
		if (block.tableCellInnerBlocks) {
			Object.entries(block.tableCellInnerBlocks).forEach(([cellKey, ib]) => {
				if (templateCategories[ib.type] === 'list') {
					ensureListRows({ id: `${block.id}::tcell::${cellKey}`, type: ib.type, items: ib.items });
				}
			});
		}
	});
	const { hasBlocks, hasOverlays } = syncCanvasPresence();
	canvasGrid.className = hasBlocks ? 'canvas-grid' : 'canvas-grid is-empty';
	const canvasVisibleBlocks = state.blocks.filter(b => !b._isNlBodyBlock);
	canvasGrid.innerHTML = hasBlocks
		? canvasVisibleBlocks.map((block, idx) => renderBuilderBlock(block, idx, canvasVisibleBlocks.length)).join('')
		: hasOverlays
			? ''
		: '<div class="canvas-empty">왼쪽 디자인 블록을 여기로 드래그하세요</div>';
	bindRenderedEvents();
	applyAllTemplateStyles();
	applyNewsletterStyles();
	syncCanvasGuideSize();
	updateMarkup();
	renderRecommendationPanel();
	if (state.sidebarTab === 'custom') {
		const exportSection = document.getElementById('customExportSection');
		if (exportSection) {
			exportSection.style.display = state.blocks.some(b => b.type.startsWith('newsletter-01__section_')) ? '' : 'none';
		}
	}
	if (state.selectedItem) {
		const { blockId, columnIndex } = state.selectedItem;
		const block = state.blocks.find(b => b.id === blockId);
		if (block && (columnIndex === null || block.items[columnIndex])) {
			if (columnIndex !== null) {
				const el = document.querySelector(`.block-item[data-block-id="${blockId}"][data-column-index="${columnIndex}"]`);
				if (el) el.classList.add('is-selected');
			} else {
				const blockEl = document.querySelector(`.builder-block[data-block-id="${blockId}"]`);
				if (blockEl) blockEl.classList.add('is-selected');
			}
		} else {
			state.selectedItem = null;
		}
	}
	if (_propsBlockId) {
		const block = state.blocks.find(b => b.id === _propsBlockId);
		const mixRef = !block ? resolveMixInnerRef(_propsBlockId) : null;
		const resolvedBlock = block || (mixRef
			? { id: _propsBlockId, type: mixRef.innerBlock.type, items: mixRef.innerBlock.items, blockWidth: null, marginBottom: mixRef.innerBlock.marginBottom ?? 10, blockAlign: '' }
			: null);
		if (resolvedBlock) {
			const widthSel = document.getElementById('propBlockWidth');
			const marginInput = document.getElementById('propMarginBottom');
			if (widthSel) widthSel.value = resolvedBlock.blockWidth || '';
			if (marginInput) marginInput.value = resolvedBlock.marginBottom ?? 30;
			document.querySelectorAll('#propBlockAlign .props-align-btn').forEach(btn => {
				btn.classList.toggle('is-active', btn.dataset.align === (resolvedBlock.blockAlign || ''));
			});
			const icoSelect = document.getElementById('propBoxIco');
			if (icoSelect && resolvedBlock.type === 'box-05') icoSelect.value = resolvedBlock.icoId || 'ico-box1';
			if (resolvedBlock.type === 'button-00') {
				renderPropsButtonInnerItems(resolvedBlock);
			}
			if (templateCategories[resolvedBlock.type] === 'button' && resolvedBlock.type !== 'button-00') {
				const btnSizeSel = document.getElementById('propBtnSize');
				if (btnSizeSel) btnSizeSel.value = resolvedBlock.btnSize || '';
				const btnOpenTypeSel = document.getElementById('propBtnOpenType');
				if (btnOpenTypeSel) btnOpenTypeSel.value = resolvedBlock.btnOpenType || 'default';
				const btnIconSel = document.getElementById('propBtnIcon');
				if (btnIconSel) {
					btnIconSel.value = resolvedBlock.btnIcon || 'ri-external-link-line';
					btnIconSel.disabled = resolvedBlock.btnOpenType === 'new-window';
				}
				const btnIconPosSel = document.getElementById('propBtnIconPos');
				if (btnIconPosSel && resolvedBlock.type === 'button-05') btnIconPosSel.value = resolvedBlock.btnIconPos || 'before';
			}
			const processColsSelect = document.getElementById('propProcessCols');
			if (processColsSelect && resolvedBlock.type === 'process-01') {
				processColsSelect.value = String(resolvedBlock.items.length);
			}
			// process sub 입력 필드 동기화 (포커스 중인 필드는 건드리지 않음)
			if (templateCategories[resolvedBlock.type] === 'process') {
				const stepsContainer = document.getElementById('propsProcessStepsContainer');
				if (stepsContainer) {
					stepsContainer.querySelectorAll('.props-process-sub-input').forEach(input => {
						if (document.activeElement === input) return;
						const stepIdx = Number(input.dataset.stepIdx);
						const item = resolvedBlock.items[stepIdx];
						if (item) input.value = (item.sub || '').replace(/<[^>]+>/g, '');
					});
				}
			}
		} else {
			closeBlockProps();
		}
	}
	initCanvasReactTab();
	initCanvasAccordion();
}

function initCanvasAccordion() {
	if (typeof AccordionStyle === 'function') AccordionStyle();
}

function initCanvasReactTab() {
	if (typeof $ === 'undefined') return;
	// 빌더에서는 window 너비가 아닌 디바이스 설정 기준으로 reactTab 적용
	var isReact = state.previewDevice === 'tablet' || state.previewDevice === 'mobile';

	$(canvasGrid).find('.tab-st[class*="depth"]:not(".not-js")').each(function () {
		var $tab = $(this);

		// reactTab 클래스 적용/제거
		if (isReact) {
			$tab.addClass('reactTab');
		} else {
			$tab.removeClass('reactTab').find('> ul').removeAttr('style');
		}

		// 기존 .select 제거 후 재생성 (render() / 디바이스 전환마다 재실행)
		$tab.find('> a.select').remove();
		if (!isReact) return;

		// con_com.js의 reactTab()과 동일하게 .on li의 <a>를 복사해서 .select 생성
		var $onLi = $tab.find('> ul > li.on');
		if (!$onLi.length) return;
		var $linkCopy = $onLi.find('> a').clone().attr('class', 'select');
		$onLi.attr('title', $onLi.text().trim() + ' 선택된 페이지');
		$tab.find('> ul').before($linkCopy);

		// 직접 클릭 핸들러 바인딩
		// (block-item의 stopPropagation 때문에 document 위임 방식이 동작하지 않으므로 직접 등록)
		$linkCopy.on('click', function (e) {
			e.preventDefault();
			e.stopPropagation(); // block-item 선택 이벤트 차단
			var $tabBox = $tab.find('> ul');
			$tabBox.slideToggle(200);
			$(this).toggleClass('on');
		});
	});
}

// % 너비 + 수평 마진 조합 시 총 너비 초과 방지: calc(50% - 10px) 형태로 반환
function _calcEffectiveWidth(blockWidth, marginLeft, marginRight) {
	if (!blockWidth) return null;
	const ml = marginLeft || 0;
	const mr = marginRight || 0;
	if (blockWidth.endsWith('%') && (ml || mr)) {
		const deductions = [ml && `${ml}px`, mr && `${mr}px`].filter(Boolean).join(' - ');
		return `calc(${blockWidth} - ${deductions})`;
	}
	return blockWidth;
}

function renderBuilderBlock(block, idx = 0, total = 1) {
	const template = componentTemplates[block.type];
	const effectiveMarginBottom = (total <= 1 || idx === total - 1) ? 0 : (block.marginBottom ?? 10);
	const blockStyleParts = [`margin-bottom:${effectiveMarginBottom}px`];
	if (block.marginTop) blockStyleParts.push(`margin-top:${block.marginTop}px`);
	if (block.marginLeft) blockStyleParts.push(`margin-left:${block.marginLeft}px`);
	if (block.marginRight) blockStyleParts.push(`margin-right:${block.marginRight}px`);
	const effectiveWidth = _calcEffectiveWidth(block.blockWidth, block.marginLeft, block.marginRight);
	if (effectiveWidth) blockStyleParts.push(`width:${effectiveWidth}`);
	const dragHandle = templateCategories[block.type] === 'table'
		? `<span class="block-drag-handle" data-tooltip="이동" aria-label="블록 이동"><i class="ri-draggable" aria-hidden="true"></i></span>`
		: '';
	return `
		<section class="builder-block" draggable="true" data-block-id="${block.id}" style="${blockStyleParts.join(';')}">
			<div class="block-controls" aria-hidden="true">
				${dragHandle}
				<button type="button" class="block-props-btn" data-tooltip="속성" data-props-block-id="${block.id}" aria-label="블록 속성">
					<i class="ri-settings-3-line" aria-hidden="true"></i>
				</button>
				<button type="button" class="block-duplicate" data-tooltip="복사" data-duplicate-block-id="${block.id}" aria-label="블록 복사">
					<i class="ri-file-copy-line" aria-hidden="true"></i>
				</button>
				<button type="button" class="block-remove" data-tooltip="삭제" data-remove-block-id="${block.id}" aria-label="블록 삭제">
					<i class="ri-close-line" aria-hidden="true"></i>
				</button>
			</div>
			<div class="${template.addDirection === 'row' ? `builder-columns columns-${block.columns}` : `builder-rows rows-${block.columns}`}">
				${renderRepeatedColumns(block)}
			</div>
		</section>
	`;
}

function renderAddColumnWrapElement(template, item, block, columnIndex, editable) {
	if (block && templateCategories[block.type] === 'table') {
		return renderTableDynamically(block, item, columnIndex, editable);
	}
	if (item.rows && block && templateCategories[block.type] === 'list') {
		return renderListDynamically(block, item, columnIndex, template.element, editable);
	}
	const source = template.isRootWrap ? template.element : template.addRowWrap;
	const el = source.cloneNode(true);
	Array.from(el.attributes).forEach(attr => {
		if (attr.name.startsWith('data-template-') || attr.name.startsWith('data-style-')) {
			el.removeAttribute(attr.name);
		}
	});
	el.querySelectorAll('[data-edit-field]').forEach(field => {
		if (template.editListLiTemplate && field.closest('.edit-list')) return;
		const fieldName = field.dataset.editField;
		setFieldContent(field, item[fieldName] || '');
		if (editable && block) {
			field.dataset.blockId = block.id;
			field.dataset.columnIndex = String(columnIndex);
			return;
		}
		field.removeAttribute('data-edit-field');
	});
	if (template.editListLiTemplate) {
		renderEditListInElement(el, template.editListLiTemplate, item, block, columnIndex, editable);
	}
	// title-list: list-wrap .inner 표시/숨김 처리
	if (block && templateCategories[block.type] === 'title-list') {
		const listWrapEl = el.querySelector('.list-wrap');
		if (listWrapEl) {
			const listWrapId = `${block.id}::list::${columnIndex}`;
			if (editable) listWrapEl.dataset.listBlockId = listWrapId;
			const innerEl = listWrapEl.querySelector('.inner');
			const rowListBlock = item.listBlock ?? null;
			if (!block.useList) {
				if (innerEl) innerEl.remove();
			} else if (rowListBlock) {
				const listTemplate = componentTemplates[rowListBlock.type];
				if (listTemplate) {
					const fakeBlock = {
						id: listWrapId,
						type: rowListBlock.type,
						columns: rowListBlock.items.length || 1,
						items: rowListBlock.items
					};
					const rendered = buildColumnBlock(listTemplate, fakeBlock, editable);
					const renderedHtml = typeof rendered === 'string' ? rendered : elementToHtml(rendered);
					listWrapEl.innerHTML = editable
						? `<div class="inner list-wrap-inner">
							<button type="button" class="list-wrap-remove" data-list-block-id="${listWrapId}" aria-label="리스트 제거"><i class="ri-close-line"></i></button>
							${renderedHtml}
						</div>`
						: `<div class="inner">${renderedHtml}</div>`;
				}
			} else if (!editable) {
				if (innerEl) innerEl.innerHTML = '';
			}
		}
	}
	if (!editable) stripEditorAttributes(el);
	return el;
}

function getEditListItems(item) {
	return Object.keys(item)
		.filter(k => /^item\d+$/.test(k))
		.sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)))
		.map(k => ({ key: k, value: item[k] }));
}

function renderEditListInElement(outerEl, editListLiTemplate, item, block, columnIndex, editable) {
	const editList = outerEl.querySelector('.edit-list');
	if (!editList) return;
	const entries = getEditListItems(item);
	if (!entries.length) return;
	editList.innerHTML = '';
	entries.forEach(entry => {
		const li = editListLiTemplate.cloneNode(false);
		li.innerHTML = entry.value;
		if (editable && block) {
			li.dataset.editField = entry.key;
			li.dataset.blockId = block.id;
			li.dataset.columnIndex = String(columnIndex);
		} else {
			li.removeAttribute('data-edit-field');
		}
		editList.appendChild(li);
	});
}

function addListItem(blockId, columnIndex, afterFieldKey) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block || !block.items[columnIndex]) return;
	pushHistory();
	const item = block.items[columnIndex];
	const entries = getEditListItems(item);
	const idx = entries.findIndex(e => e.key === afterFieldKey);
	entries.splice(idx + 1, 0, { key: '', value: '새 항목' });
	entries.forEach((e, i) => { e.key = `item${i + 1}`; });
	Object.keys(item).filter(k => /^item\d+$/.test(k)).forEach(k => delete item[k]);
	entries.forEach(e => { item[e.key] = e.value; });
	render();
}

function deleteListItem(blockId, columnIndex, fieldKey) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block || !block.items[columnIndex]) return;
	const item = block.items[columnIndex];
	const entries = getEditListItems(item);
	if (entries.length <= 1) return;
	pushHistory();
	const newEntries = entries.filter(e => e.key !== fieldKey);
	newEntries.forEach((e, i) => { e.key = `item${i + 1}`; });
	Object.keys(item).filter(k => /^item\d+$/.test(k)).forEach(k => delete item[k]);
	newEntries.forEach(e => { item[e.key] = e.value; });
	render();
}

function renderRepeatedColumns(block) {
	const template = componentTemplates[block.type];

	if (templateCategories[block.type] === 'table') {
		const item = block.items[0];
		if (!item) return '';
		const el = renderTableDynamically(block, item, 0, true);
		el.setAttribute('style', columnStyleVars(item));
		el.classList.add('block-item');
		el.dataset.blockId = block.id;
		el.dataset.columnIndex = '0';
		return elementToHtml(el);
	}

	if (templateCategories[block.type] === 'list' && block.items[0]?.rows) {
		const item = block.items[0];
		const el = renderListDynamically(block, item, 0, template.element, true);
		el.setAttribute('style', columnStyleVars(item));
		el.classList.add('block-item');
		el.dataset.blockId = block.id;
		el.dataset.columnIndex = '0';
		const listFirstChild = el.firstElementChild;
		if (listFirstChild) {
			if (block.blockAlign) {
				listFirstChild.classList.remove('al', 'ac', 'ar');
				listFirstChild.classList.add(block.blockAlign);
			}
		}
		return elementToHtml(el);
	}

	if (template.isRootWrap) {
		return block.items.map((item, index) => {
			const el = renderAddColumnWrapElement(template, item, block, index, true);
			el.setAttribute('style', columnStyleVars(item));
			el.classList.add('block-item');
			el.dataset.blockId = block.id;
			el.dataset.columnIndex = String(index);
			// 가정통신문 헤더: 로고 이미지 및 연락처 visibility 처리
			if (block.type === 'newsletter-01__section_1') {
				const logoImg = el.querySelector('img[data-nl-logo]');
				const logoFrame = el.querySelector('.nl-logo-frame');
				if (logoImg) {
					if (block.nlLogoSrc) {
						logoImg.setAttribute('src', block.nlLogoSrc);
						logoImg.setAttribute('alt', block.nlLogoAlt || '');
						logoImg.style.display = '';
					} else {
						logoImg.style.display = 'none';
					}
				}
				if (logoFrame) logoFrame.dataset.hasLogo = block.nlLogoSrc ? '1' : '0';
				const deptVal = (item || {}).dept || '';
				const phoneVal = (item || {}).phone || '';
				const contactRow = el.querySelector('.nl-header-info');
				if (contactRow) contactRow.style.display = (!deptVal && !phoneVal) ? 'none' : '';
			}
			// 가정통신문 본문: 구조적 body 블록 렌더링
			if (block.type === 'newsletter-01__section_3') {
				const contentArea = el.querySelector('.nl-content-area');
				if (contentArea) {
					const bodyBlocks = state.blocks.filter(b => b._isNlBodyBlock && b._parentSectionId === block.id);
					if (bodyBlocks.length > 0) {
						contentArea.innerHTML = '';
						bodyBlocks.forEach(bb => {
							const bbTemplate = componentTemplates[bb.type];
							if (!bbTemplate) return;
							const wrapper = document.createElement('div');
							wrapper.className = 'nl-block-insert nl-body-block-wrap';
							wrapper.dataset.nlBodyBlockId = bb.id;
							const gapPx = (bb.marginBottom !== undefined && bb.marginBottom !== null)
								? bb.marginBottom
								: (parseInt(state.newsletterStyle.blockGap) || 12);
							if (bb.marginTop) wrapper.style.marginTop = bb.marginTop + 'px';
							wrapper.style.marginBottom = gapPx + 'px';
							if (bb.marginLeft && bb.blockAlign !== 'ac') wrapper.style.marginLeft = bb.marginLeft + 'px';
							if (bb.marginRight && bb.blockAlign !== 'ac' && bb.blockAlign !== 'ar') wrapper.style.marginRight = bb.marginRight + 'px';
							const nlEffectiveWidth = _calcEffectiveWidth(bb.blockWidth, bb.blockAlign ? 0 : bb.marginLeft, bb.blockAlign ? 0 : bb.marginRight);
							if (nlEffectiveWidth) wrapper.style.width = nlEffectiveWidth;
							if (bb.blockAlign === 'ac') { wrapper.style.marginLeft = 'auto'; wrapper.style.marginRight = 'auto'; }
							else if (bb.blockAlign === 'ar') { wrapper.style.marginLeft = 'auto'; }
							const bbInnerHtml = renderRepeatedColumns(bb);
							const ctrlHtml = _innerBlockActionsHtml(
								`<button type="button" class="inner-block-btn inner-block-btn--props" data-nl-body-props-id="${bb.id}" title="속성" aria-hidden="true"><i class="ri-settings-3-line"></i></button>`,
								`<button type="button" class="inner-block-btn inner-block-btn--remove" data-nl-body-delete-id="${bb.id}" title="삭제" aria-hidden="true"><i class="ri-delete-bin-line"></i></button>`
							);
							wrapper.innerHTML = ctrlHtml + bbInnerHtml;
							contentArea.appendChild(wrapper);
						});
					}
				}
			}
			return elementToHtml(el);
		}).join('');
	}

	return buildColumnBlock(template, block, true);
}

function buildColumnBlock(template, block, editable, innerTableEditable = false) {
	const outer = template.element.cloneNode(true);
	Array.from(outer.attributes).forEach(attr => {
		if (attr.name.startsWith('data-template-') || attr.name.startsWith('data-style-')) {
			outer.removeAttribute(attr.name);
		}
	});
	outer.setAttribute('style', columnStyleVars(block.items[0] || {}));

	if (editable) {
		outer.classList.add('block-item');
		outer.dataset.blockId = block.id;
		outer.dataset.columnIndex = '0';
	}

	const firstChild = outer.firstElementChild;
	if (firstChild) {
		if (block.blockAlign) {
			firstChild.classList.remove('al', 'ac', 'ar');
			firstChild.classList.add(block.blockAlign);
		}
	}

	const addRowWrapEl = outer.querySelector('.add-row-wrap');
	if (addRowWrapEl) {
		outer.querySelectorAll('[data-edit-field]').forEach(field => {
			if (addRowWrapEl.contains(field)) return;
			const fieldName = field.dataset.editField;
			setFieldContent(field, (block.items[0] || {})[fieldName] || '');
			if (editable || innerTableEditable) {
				field.dataset.blockId = block.id;
				field.dataset.columnIndex = '0';
			} else {
				field.removeAttribute('data-edit-field');
			}
		});

		const rowContainer = addRowWrapEl.parentElement;
		rowContainer.innerHTML = block.items.map((item, idx) => {
			const el = template.addRowWrap.cloneNode(true);
			el.querySelectorAll('[data-edit-field]').forEach(field => {
				const fieldName = field.dataset.editField;
				setFieldContent(field, item[fieldName] || '');
				if (editable || innerTableEditable) {
					field.dataset.blockId = block.id;
					field.dataset.columnIndex = String(idx);
				} else {
					field.removeAttribute('data-edit-field');
				}
			});
			if (!editable && !innerTableEditable) stripEditorAttributes(el);
			return elementToHtml(el);
		}).join('');
	} else {
		outer.querySelectorAll('[data-edit-field]').forEach(field => {
			const fieldName = field.dataset.editField;
			setFieldContent(field, (block.items[0] || {})[fieldName] || '');
			if (editable || innerTableEditable) {
				field.dataset.blockId = block.id;
				field.dataset.columnIndex = '0';
			} else {
				field.removeAttribute('data-edit-field');
			}
		});
	}

	// 이미지 박스(box-04): img src/alt를 block 데이터로 동기화
	if (block && block.type === 'box-04') {
		const boxImg = outer.querySelector('img[data-box-img]');
		if (boxImg) {
			if (block.imgSrc) boxImg.setAttribute('src', block.imgSrc);
			if (block.imgAlt !== undefined) boxImg.setAttribute('alt', block.imgAlt);
			if (!editable) boxImg.removeAttribute('data-box-img');
		}
	}

	// 가정통신문 헤더(newsletter-01__section_1): 로고 이미지 동기화
	if (block && block.type === 'newsletter-01__section_1') {
		const logoImg = outer.querySelector('img[data-nl-logo]');
		const logoFrame = outer.querySelector('.nl-logo-frame');
		if (logoImg) {
			if (block.nlLogoSrc) {
				logoImg.setAttribute('src', block.nlLogoSrc);
				logoImg.setAttribute('alt', block.nlLogoAlt || '');
				logoImg.style.display = '';
			} else {
				logoImg.style.display = 'none';
			}
			if (!editable) logoImg.removeAttribute('data-nl-logo');
		}
		if (logoFrame) logoFrame.dataset.hasLogo = block.nlLogoSrc ? '1' : '0';
		// 부서명/연락처 빈 값이면 contact-row 숨김
		const deptEl = outer.querySelector('.nl-dept');
		const phoneEl = outer.querySelector('.nl-phone');
		if (deptEl && phoneEl) {
			const deptVal = (block.items[0] || {}).dept || '';
			const phoneVal = (block.items[0] || {}).phone || '';
			const contactRow = outer.querySelector('.nl-header-info');
			if (contactRow) {
				contactRow.style.display = (!deptVal && !phoneVal) ? 'none' : '';
			}
		}
	}

	// 혼합 블록 및 mix-inner-slot 보유 컨테이너: .mix-inner-slot 처리
	if (block && isMixContainer(block.type)) {
		const slotEl = outer.querySelector('.mix-inner-slot');
		if (slotEl) {
			const innerBlocks = block.innerBlocks || [];
			if (innerBlocks.length > 0) {
				slotEl.innerHTML = innerBlocks.map((ib, idx) => {
					const innerTemplate = componentTemplates[ib.type];
					if (!innerTemplate) return '';
					if (editable) {
						const innerBlockId = `${block.id}::inner::${idx}`;
						const fakeBlock = { id: innerBlockId, type: ib.type, columns: ib.items.length || 1, items: ib.items,
							...(block.type === 'button-00' && templateCategories[ib.type] === 'button' ? { btnSize: ib.btnSize || '', btnOpenType: ib.btnOpenType || 'default', btnIcon: ib.btnIcon || 'ri-external-link-line', btnIconPos: ib.btnIconPos || 'before' } : {}) };
						const isListInner = templateCategories[ib.type] === 'list';
						let innerHtml;
						if (isListInner && fakeBlock.items[0]?.rows) {
							const listItem = fakeBlock.items[0];
							const listEl = renderListDynamically(fakeBlock, listItem, 0, innerTemplate.element, true);
							listEl.setAttribute('style', columnStyleVars(listItem));
							listEl.classList.add('block-item');
							listEl.dataset.blockId = innerBlockId;
							listEl.dataset.columnIndex = '0';
							innerHtml = elementToHtml(listEl);
						} else {
							innerHtml = buildColumnBlock(innerTemplate, fakeBlock, true);
						}
						const mbStyle = ib.marginBottom != null ? ` style="margin-bottom:${ib.marginBottom}px"` : '';
						const propsHtml = isListInner
							? `<button type="button" class="mix-inner-props inner-block-btn inner-block-btn--props" data-mix-inner-props-id="${innerBlockId}" title="행 관리" aria-label="행 관리"><i class="ri-list-settings-line"></i></button>`
							: '';
						const removeHtml = `<button type="button" class="mix-inner-remove inner-block-btn inner-block-btn--remove" data-mix-block-id="${block.id}" data-mix-inner-idx="${idx}" aria-label="내부 블록 제거"><i class="ri-close-line"></i></button>`;
						return `<div class="mix-inner-item" draggable="true" data-mix-block-id="${block.id}" data-mix-inner-idx="${idx}"${mbStyle}>
							<div class="mix-inner-drag-handle" title="드래그해서 순서 변경"><i class="ri-draggable"></i></div>
							${_innerBlockActionsHtml(propsHtml, removeHtml)}
							${innerHtml}
						</div>`;
					} else {
						const fakeBlock = { id: `${block.id}-inner-${idx}`, type: ib.type, columns: ib.items.length || 1, items: ib.items,
							...(block.type === 'button-00' && templateCategories[ib.type] === 'button' ? { btnSize: ib.btnSize || '', btnOpenType: ib.btnOpenType || 'default', btnIcon: ib.btnIcon || 'ri-external-link-line', btnIconPos: ib.btnIconPos || 'before' } : {}) };
						const isListInner = templateCategories[ib.type] === 'list';
						let innerContent;
						if (isListInner && fakeBlock.items[0]?.rows) {
							const listItem = fakeBlock.items[0];
							const listEl = renderListDynamically(fakeBlock, listItem, 0, innerTemplate.element, false);
							innerContent = elementToHtml(listEl);
						} else {
							const innerEl = buildColumnBlock(innerTemplate, fakeBlock, false);
							innerContent = elementToHtml(innerEl);
						}
						const mbStyle = ib.marginBottom != null ? ` style="margin-bottom:${ib.marginBottom}px"` : '';
						return `<div class="mix-inner-item"${mbStyle}>${innerContent}</div>`;
					}
				}).join('');
			} else if (editable) {
				// 빈 슬롯: 빨간 점선 + 안내 문구
				slotEl.classList.add('mix-slot-empty');
				slotEl.innerHTML = '<div class="mix-slot-placeholder"><i class="ri-add-circle-line"></i> 디자인 블록을 드래그해서 넣으세요.</div>';
			}
			if (editable) {
				slotEl.dataset.mixBlockId = block.id;
			}
		}
	}

	// title-list 블록: .list-wrap 처리 (column-direction 템플릿용, items[0] 기준)
	if (block && templateCategories[block.type] === 'title-list') {
		const listWrapEl = outer.querySelector('.list-wrap');
		if (listWrapEl) {
			const listWrapId = `${block.id}::list::0`;
			if (editable) listWrapEl.dataset.listBlockId = listWrapId;
			const innerEl = listWrapEl.querySelector('.inner');
			const rowListBlock = block.items[0]?.listBlock ?? null;
			if (!block.useList) {
				if (innerEl) innerEl.remove();
			} else if (rowListBlock) {
				const listTemplate = componentTemplates[rowListBlock.type];
				if (listTemplate) {
					const fakeBlock = {
						id: listWrapId,
						type: rowListBlock.type,
						columns: rowListBlock.items.length || 1,
						items: rowListBlock.items
					};
					const renderedHtml = buildColumnBlock(listTemplate, fakeBlock, editable);
					const rendered = typeof renderedHtml === 'string' ? renderedHtml : elementToHtml(renderedHtml);
					listWrapEl.innerHTML = editable
						? `<div class="inner list-wrap-inner">
							<button type="button" class="list-wrap-remove" data-list-block-id="${listWrapId}" aria-label="리스트 제거"><i class="ri-close-line"></i></button>
							${rendered}
						</div>`
						: `<div class="inner">${rendered}</div>`;
				}
			} else if (!editable) {
				if (innerEl) innerEl.innerHTML = '';
			}
		}
	}

	// data-link 속성이 있는 <a> 요소에 block.linkHref / block.linkTarget 적용
	const linkEl = outer.querySelector('a[data-link]');
	if (linkEl) {
		if (block.linkHref) linkEl.setAttribute('href', block.linkHref);
		if (block.linkTarget) linkEl.setAttribute('target', block.linkTarget);
		// text-03: target이 _blank이면 title="새창", 아니면 title 제거
		if (block.type === 'text-03') {
			const effectiveTarget = block.linkTarget || '_blank';
			if (effectiveTarget === '_blank') {
				linkEl.setAttribute('title', '새창');
			} else {
				linkEl.removeAttribute('title');
			}
		}
		linkEl.removeAttribute('data-link');
	}

	// box-05: .ico[data-ico] 요소에 SVG 주입
	outer.querySelectorAll('.ico[data-ico]').forEach(icoEl => {
		let icoId = icoEl.getAttribute('data-ico');
		if (block && block.type === 'box-05' && block.icoId) {
			icoId = block.icoId;
			icoEl.setAttribute('data-ico', icoId);
		}
		const svg = ICO_SVG_MAP[icoId];
		if (svg) icoEl.innerHTML = svg;
	});

	// 버튼 블록: 사이즈·새창·아이콘 처리 (button-00 컨테이너는 제외)
	if (block && templateCategories[block.type] === 'button' && !isMixContainer(block.type)) {
		const btnEl = outer.querySelector('button.btn-st');
		if (btnEl) {
			// 사이즈 클래스 적용
			btnEl.classList.remove('size-sm', 'size-lg', 'size-exlg');
			if (block.btnSize) btnEl.classList.add(block.btnSize);

			const isNewWindow = block.btnOpenType === 'new-window';
			if (isNewWindow) {
				btnEl.setAttribute('target', '_blank');
				btnEl.setAttribute('title', '새창 이동');
			} else {
				btnEl.removeAttribute('target');
				btnEl.removeAttribute('title');
			}

			// 텍스트 버튼(button-01~04): 새창 타입이면 새창 아이콘 자동 추가·제거
			if (['button-01','button-02','button-03','button-04'].includes(block.type)) {
				const existingIco = btnEl.querySelector('i[aria-hidden]');
				if (existingIco) existingIco.remove();
				if (isNewWindow) {
					btnEl.classList.add('icon');
					const icoEl = document.createElement('i');
					icoEl.className = 'ri-external-link-line';
					icoEl.setAttribute('aria-hidden', 'true');
					btnEl.appendChild(icoEl);
				} else {
					btnEl.classList.remove('icon');
				}
			}

			// 아이콘 버튼(button-05, button-06): 아이콘 클래스·위치 처리
			if (block.type === 'button-05' || block.type === 'button-06') {
				const icoEl = btnEl.querySelector('i');
				if (icoEl) {
					// 새창 타입이면 새창 아이콘 고정, 아니면 선택 아이콘 적용
					icoEl.className = isNewWindow ? 'ri-external-link-line' : (block.btnIcon || 'ri-external-link-line');
					icoEl.setAttribute('aria-hidden', 'true');

					// 아이콘 위치 처리 (button-05 전용)
					if (block.type === 'button-05') {
						const spanEl = btnEl.querySelector('span[data-edit-field]') || btnEl.querySelector('span:not(.hid)');
						if (spanEl) {
							if (block.btnIconPos === 'after') {
								if (btnEl.lastElementChild !== icoEl) btnEl.appendChild(icoEl);
							} else {
								if (btnEl.firstElementChild !== icoEl) btnEl.insertBefore(icoEl, btnEl.firstChild);
							}
						}
					}
				}
			}
		}
	}

	// process 블록: <ul> 에 li 항목 주입 + fin 클래스 + col 클래스(가로형)
	if (block && templateCategories[block.type] === 'process') {
		const ul = outer.querySelector('.prosess-st');
		if (ul) {
			const isHoriz = ul.classList.contains('horiz');
			const steps = block.items || [];
			if (isHoriz) {
				ul.classList.remove('col-2', 'col-3', 'col-4', 'col-5', 'col-6');
				if (steps.length >= 2 && steps.length <= 6) ul.classList.add(`col-${steps.length}`);
			}
			ul.innerHTML = steps.map((item, idx) => {
				const isFin = idx === steps.length - 1;
				const finClass = isFin ? ' class="fin"' : '';
				const titleVal = item.title || '';
				const subVal = item.sub || '';
				let titleHtml, subHtml;
				if (editable) {
					titleHtml = `<h6 data-edit-field="title" data-block-id="${escapeAttr(block.id)}" data-column-index="${idx}">${titleVal}</h6>`;
					subHtml = subVal ? `<p data-edit-field="sub" data-block-id="${escapeAttr(block.id)}" data-column-index="${idx}">${subVal}</p>` : '';
				} else {
					titleHtml = `<h6>${titleVal}</h6>`;
					subHtml = subVal ? `<p>${subVal}</p>` : '';
				}
				let inrHtml = '';
				if (!isHoriz && !isFin) {
					const innerBlocks = item.innerBlocks || [];
					if (editable) {
						const slotId = `${block.id}::pstep::${idx}`;
						const isEmpty = innerBlocks.length === 0;
						let innerItemsHtml;
						if (isEmpty) {
							innerItemsHtml = '<div class="mix-slot-placeholder"><i class="ri-add-circle-line"></i> 디자인 블록을 드래그해서 넣으세요.</div>';
						} else {
							innerItemsHtml = innerBlocks.map((ib, ibIdx) => {
								const innerTemplate = componentTemplates[ib.type];
								if (!innerTemplate) return '';
								const innerBlockId = `${slotId}::inner::${ibIdx}`;
								const fakeBlock = { id: innerBlockId, type: ib.type, columns: ib.items.length || 1, items: ib.items };
								const isListInner = templateCategories[ib.type] === 'list';
								let innerHtml;
								if (isListInner && fakeBlock.items[0]?.rows) {
									const listItem = fakeBlock.items[0];
									const listEl = renderListDynamically(fakeBlock, listItem, 0, innerTemplate.element, true);
									listEl.setAttribute('style', columnStyleVars(listItem));
									listEl.classList.add('block-item');
									listEl.dataset.blockId = innerBlockId;
									listEl.dataset.columnIndex = '0';
									innerHtml = elementToHtml(listEl);
								} else {
									innerHtml = buildColumnBlock(innerTemplate, fakeBlock, true);
								}
								const mbStyle = ib.marginBottom != null ? ` style="margin-bottom:${ib.marginBottom}px"` : '';
								const propsHtml = isListInner
									? `<button type="button" class="mix-inner-props inner-block-btn inner-block-btn--props" data-mix-inner-props-id="${innerBlockId}" title="행 관리" aria-label="행 관리"><i class="ri-list-settings-line"></i></button>`
									: '';
								const removeHtml = `<button type="button" class="mix-inner-remove pstep-inner-remove inner-block-btn inner-block-btn--remove" data-pstep-block-id="${escapeAttr(block.id)}" data-pstep-idx="${idx}" data-pstep-inner-idx="${ibIdx}" aria-label="내부 블록 제거"><i class="ri-close-line"></i></button>`;
								return `<div class="mix-inner-item pstep-inner-item" draggable="true" data-pstep-block-id="${escapeAttr(block.id)}" data-pstep-idx="${idx}" data-pstep-inner-idx="${ibIdx}"${mbStyle}>
									<div class="mix-inner-drag-handle" title="드래그해서 순서 변경"><i class="ri-draggable"></i></div>
									${_innerBlockActionsHtml(propsHtml, removeHtml)}
									${innerHtml}
								</div>`;
							}).join('');
						}
						inrHtml = `<div class="inr process-inner-slot${isEmpty ? ' mix-slot-empty' : ''}" data-pstep-block-id="${escapeAttr(block.id)}" data-pstep-idx="${idx}">${innerItemsHtml}</div>`;
					} else {
						let innerContent = '';
						if (innerBlocks.length > 0) {
							innerContent = innerBlocks.map((ib, ibIdx) => {
								const innerTemplate = componentTemplates[ib.type];
								if (!innerTemplate) return '';
								const fakeBlock = { id: `${block.id}-p${idx}-i${ibIdx}`, type: ib.type, columns: ib.items.length || 1, items: ib.items };
								const isListInner = templateCategories[ib.type] === 'list';
								let content;
								if (isListInner && fakeBlock.items[0]?.rows) {
									const listItem = fakeBlock.items[0];
									const listEl = renderListDynamically(fakeBlock, listItem, 0, innerTemplate.element, false);
									content = elementToHtml(listEl);
								} else {
									const innerEl = buildColumnBlock(innerTemplate, fakeBlock, false);
									content = typeof innerEl === 'string' ? innerEl : elementToHtml(innerEl);
								}
								const mbStyle = ib.marginBottom != null ? ` style="margin-bottom:${ib.marginBottom}px"` : '';
								return `<div class="mix-inner-item"${mbStyle}>${content}</div>`;
							}).join('');
						}
						inrHtml = `<div class="inr">${innerContent}</div>`;
					}
				}
				return `<li${finClass}><div class="tit">${titleHtml}${subHtml}</div>${inrHtml}</li>`;
			}).join('');
		}
	}

	// tab 블록: <ul> 에 li 항목 주입 + col 클래스 적용
	if (block && templateCategories[block.type] === 'tab') {
		const tabContainer = outer.querySelector('.tab-st');
		const tabUl = tabContainer ? tabContainer.querySelector('ul') : null;
		if (tabContainer && tabUl) {
			const tabItems = block.tabItems || [];
			const tabCols = block.tabCols || '4';
			tabContainer.classList.remove('col-2', 'col-3', 'col-4', 'col-5');
			tabContainer.classList.add(`col-${tabCols}`);

			tabUl.innerHTML = tabItems.map((item, idx) => {
				const isFirst = idx === 0;
				const isDisabled = item.type === 'disabled';
				const isNewWindow = item.type === 'new_window';
				const liClass = isFirst ? ' class="on"' : '';
				const liTitle = isFirst ? ` title="${escapeAttr(item.text)} 선택된 페이지"` : '';
				const aTarget = isNewWindow ? ` target="_blank"` : '';
				const aTitle = isNewWindow ? ` title="새창"` : '';
				const aDis = isDisabled ? ` class="dis"` : '';
				const tabIdxAttr = editable ? ` data-tab-block-id="${escapeAttr(block.id)}" data-tab-item-idx="${idx}"` : '';
				return `<li${liClass}${liTitle}><a href=""${aTarget}${aTitle}${aDis}${tabIdxAttr}>${escapeHtml(item.text)}</a></li>`;
			}).join('');
		}
	}

	// accordion 블록: <ul>에 li 항목 주입 + 사이즈 클래스 적용
	if (block && templateCategories[block.type] === 'accordion') {
		const accordionContainer = outer.querySelector('.accordion-st');
		const accordionUl = accordionContainer ? accordionContainer.querySelector('ul') : null;
		if (accordionContainer && accordionUl) {
			const accordionItems = block.accordionItems || [];
			const accordionSize = block.accordionSize || '';
			accordionContainer.classList.remove('size-md', 'size-lg');
			if (accordionSize) accordionContainer.classList.add(accordionSize);

			accordionUl.innerHTML = accordionItems.map((item) => {
				const isDisabled = !!item.disabled;
				const liClass = isDisabled ? ' class="dis"' : '';
				const titleText = escapeHtml(item.text || '');
				const rawContent = item.content ? item.content.trim() : '';
				const contentHtml = rawContent ? formatMultiline(rawContent) : '내용이 없습니다.';
				return `<li${liClass}><button class="tit" type="button">${titleText}</button><div class="cntnts">${contentHtml}</div></li>`;
			}).join('');
		}
	}

	// discloser 블록: 제목과 내용 주입
	if (block && block.type === 'accordion-03') {
		const discloserEl = outer.querySelector('.discloser-st');
		if (discloserEl) {
			const titleBtn = discloserEl.querySelector(':scope > button.tit');
			const cntnts = discloserEl.querySelector(':scope > .cntnts');
			if (titleBtn) titleBtn.textContent = block.discloserTitle || 'Discloser';
			if (cntnts) {
				const rawContent = (block.discloserContent || '').trim();
				cntnts.innerHTML = rawContent ? formatMultiline(rawContent) : '내용이 없습니다.';
			}
		}
	}

	if (!editable && !innerTableEditable) stripEditorAttributes(outer);
	return editable ? elementToHtml(outer) : outer;
}


let _iconDrawerTarget = null;


function openIconDrawer(categoryIndex, blockId, columnIndex, initialGroupId = null) {
	if (!ICON_CATEGORIES.length) return;

	// 빨간 점선 — 기존 제거 후 새 대상에 추가
	document.querySelectorAll('[data-edit-field="icon"].icon-editing').forEach(el => el.classList.remove('icon-editing'));
	const targetIconEl = document.querySelector(
		`.builder-block[data-block-id="${blockId}"] .block-item[data-column-index="${columnIndex}"] [data-edit-field="icon"]`
	);
	if (targetIconEl) targetIconEl.classList.add('icon-editing');

	_iconDrawerTarget = { blockId, columnIndex };

	// ── 트리 렌더링 ──────────────────────────────────
	const treeEl = document.getElementById('iconTree');
	treeEl.innerHTML = ICON_CATEGORIES.map((cat, i) => {
		const hasGroups = cat.groups && cat.groups.length;
		return `
		<div class="icon-tree-cat${i === categoryIndex ? ' is-open' : ''}" data-cat-index="${i}">
			<button type="button" class="icon-tree-cat-btn">
				<span class="icon-tree-cat-label">${escapeHtml(cat.label)}</span>
				${hasGroups ? '<i class="ri-arrow-right-s-line icon-tree-arrow" aria-hidden="true"></i>' : ''}
			</button>
			${hasGroups ? `
			<ul class="icon-tree-group-list">
				${cat.groups.map(g => `
				<li>
					<button type="button" class="icon-tree-group-btn" data-cat-index="${i}" data-group-id="${escapeHtml(g.id)}">
						${escapeHtml(g.label)}
					</button>
				</li>`).join('')}
			</ul>` : ''}
		</div>`;
	}).join('');

	// 카테고리 토글
	treeEl.querySelectorAll('.icon-tree-cat-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const catEl = btn.closest('.icon-tree-cat');
			const wasOpen = catEl.classList.contains('is-open');
			treeEl.querySelectorAll('.icon-tree-cat').forEach(el => el.classList.remove('is-open'));
			if (!wasOpen) {
				catEl.classList.add('is-open');
				const ci = Number(catEl.dataset.catIndex);
				const cat = ICON_CATEGORIES[ci];
				// 그룹 유무와 관계없이 카테고리 전체 아이콘 표시
				const allIcons = cat.groups
					? (cat.groups).flatMap(g => g.icons || [])
					: (cat.icons || []);
				renderIconGrid(allIcons);
			} else {
				clearIconGrid();
			}
		});
	});

	// 그룹 클릭 → 아이콘 그리드 표시
	treeEl.querySelectorAll('.icon-tree-group-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			treeEl.querySelectorAll('.icon-tree-group-btn').forEach(b => b.classList.remove('is-active'));
			btn.classList.add('is-active');
			const ci = Number(btn.dataset.catIndex);
			const gid = btn.dataset.groupId;
			const cat = ICON_CATEGORIES[ci];
			const group = cat.groups.find(g => g.id === gid);
			if (group) renderIconGrid(group.icons || []);
		});
	});

	// 초기 열린 카테고리 자동 처리
	if (categoryIndex >= 0) {
		const openCat = treeEl.querySelector(`.icon-tree-cat[data-cat-index="${categoryIndex}"]`);
		if (openCat) openCat.classList.add('is-open');
		const cat = ICON_CATEGORIES[categoryIndex];
		if (cat) {
			if (initialGroupId && cat.groups) {
				// 특정 그룹이 지정된 경우: 해당 그룹 선택 + 그리드 표시
				const groupBtn = treeEl.querySelector(`.icon-tree-group-btn[data-cat-index="${categoryIndex}"][data-group-id="${initialGroupId}"]`);
				if (groupBtn) groupBtn.classList.add('is-active');
				const group = cat.groups.find(g => g.id === initialGroupId);
				renderIconGrid(group ? group.icons || [] : []);
			} else {
				// 카테고리 타이틀만 열릴 때: 전체 아이콘 표시
				const allIcons = cat.groups
					? cat.groups.flatMap(g => g.icons || [])
					: (cat.icons || []);
				renderIconGrid(allIcons);
			}
		}
	}

	document.getElementById('iconDrawer').classList.add('is-open');
}

function renderIconGrid(icons) {
	const area = document.getElementById('iconGridArea');
	if (!icons.length) {
		area.innerHTML = '<p class="icon-grid-empty">아이콘이 없습니다.</p>';
		return;
	}
	area.innerHTML = `<div class="icon-drawer-grid">
		${icons.map(icon => `
		<button type="button" class="icon-drawer-item" data-src="${escapeHtml(icon.src)}" data-name="${escapeHtml(icon.name || '')}">
			<img src="${escapeHtml(icon.src)}" alt="${escapeHtml(icon.name || '')}">
			<span>${escapeHtml(icon.name || '')}</span>
		</button>`).join('')}
	</div>`;
	area.querySelectorAll('.icon-drawer-item').forEach(btn => {
		btn.addEventListener('click', () => applyIconFromDrawer(btn.dataset.src, btn.dataset.name));
	});
}

function clearIconGrid() {
	const area = document.getElementById('iconGridArea');
	area.innerHTML = '<p class="icon-grid-empty">왼쪽에서 카테고리를 선택하세요.</p>';
}

function applyIconFromDrawer(src, name) {
	if (!_iconDrawerTarget) return;
	const { blockId, columnIndex } = _iconDrawerTarget;
	const item = findItemByBlockId(blockId, columnIndex);
	if (!item) return;
	item.icon = `<img src="${src}" alt="${name}" class="block-icon-img">`;
	closeIconDrawer();
	render();
}

function closeIconDrawer() {
	document.getElementById('iconDrawer').classList.remove('is-open');
	// 빨간 점선 편집 표시 제거
	document.querySelectorAll('[data-edit-field="icon"].icon-editing').forEach(el => el.classList.remove('icon-editing'));
	_iconDrawerTarget = null;
}

function findIconLocation(src) {
	let path;
	try { path = new URL(src).pathname.replace(/^\//, ''); } catch { path = src; }
	path = normalizeAssetPath(path).replace(/^\//, '');
	for (let i = 0; i < ICON_CATEGORIES.length; i++) {
		const cat = ICON_CATEGORIES[i];
		if (cat.groups && cat.groups.length) {
			for (const g of cat.groups) {
				if ((g.icons || []).some(icon => normalizeAssetPath(icon.src).replace(/^\//, '') === path)) {
					return { catIndex: i, groupId: g.id };
				}
			}
		} else {
			if ((cat.icons || []).some(icon => normalizeAssetPath(icon.src).replace(/^\//, '') === path)) {
				return { catIndex: i, groupId: null };
			}
		}
	}
	return { catIndex: 0, groupId: null };
}


function bindComponentEvents(container = document) {
	KlicBuilderShared.bindComponentItems({
		container,
		canvasGrid,
		getDragPayload: item => {
			const isDecoration = item.dataset.decoration === 'true';
			const category = templateCategories[item.dataset.type] || '';
			const customDecorationId = item.dataset.customDecorationId || '';
			const template = componentTemplates[item.dataset.type];
			if (template?.isInline) return `new-inline:${item.dataset.type}`;
			if (template?.isSmartInline) return `new-smart:${item.dataset.type}`;
			if (category === 'design-template') return `new-design-template:${item.dataset.type}`;
			return isDecoration
				? (customDecorationId ? `overlay-custom:${customDecorationId}` : `overlay-type:${item.dataset.type}`)
				: `new-block:${item.dataset.type}`;
		},
		onAdd: item => {
			const isDecoration = item.dataset.decoration === 'true';
			const category = templateCategories[item.dataset.type] || '';
			const customDecorationId = item.dataset.customDecorationId || '';
			const template = componentTemplates[item.dataset.type];
			if (template?.isInline) {
				showPlacementToast('텍스트 블록 안으로 드래그하여 인라인으로 삽입하세요.', 'info');
				return;
			}
			if (category === 'design-template') {
				addDesignTemplate(item.dataset.type);
			} else if (isDecoration) {
				const grid = document.getElementById('canvasGrid');
				const wrapper = document.getElementById('canvasWrapper');
				if (grid && wrapper) {
					const gRect = grid.getBoundingClientRect();
					const wRect = wrapper.getBoundingClientRect();
					const x = Math.max(0, (wRect.left + wRect.width / 2) - gRect.left - 60);
					const y = Math.max(0, (wRect.top + wRect.height / 2) - gRect.top - 60);
					customDecorationId ? addCustomOverlay(customDecorationId, x, y) : addOverlay(item.dataset.type, x, y);
				} else {
					customDecorationId ? addCustomOverlay(customDecorationId, 100, 100) : addOverlay(item.dataset.type, 100, 100);
				}
			} else {
				addBlock(item.dataset.type);
			}
		},
		onDragStart: item => {
			const isDecoration = item.dataset.decoration === 'true';
			const category = templateCategories[item.dataset.type] || '';
			const customDecorationId = item.dataset.customDecorationId || '';
			const template = componentTemplates[item.dataset.type];
			state.dragPayload = template?.isInline
				? `new-inline:${item.dataset.type}`
				: template?.isSmartInline
				? `new-smart:${item.dataset.type}`
				: category === 'design-template'
				? `new-design-template:${item.dataset.type}`
				: isDecoration
				? (customDecorationId ? `overlay-custom:${customDecorationId}` : `overlay-type:${item.dataset.type}`)
				: `new-block:${item.dataset.type}`;
			const dragCat = templateCategories[item.dataset.type] || '';
			if (MIX_ALLOWED.has(dragCat)) {
				document.body.classList.add('is-mix-dragging');
			}
		},
		onDragEnd: () => {
			state.dragPayload = '';
			document.getElementById('canvasWrapper')?.classList.remove('is-decoration-over');
			document.body.classList.remove('is-mix-dragging');
			_clearInlineCaret();
		}
	});

	/* Legacy component binding moved to KlicBuilderShared.bindComponentItems.
	container.querySelectorAll('.component-item').forEach(item => {
		const isDecoration = item.dataset.decoration === 'true';
		const customDecorationId = item.dataset.customDecorationId || '';
		const addItemToCanvas = () => {
			if (isDecoration) {
				const grid = document.getElementById('canvasGrid');
				const wrapper = document.getElementById('canvasWrapper');
				if (grid && wrapper) {
					const gRect = grid.getBoundingClientRect();
					const wRect = wrapper.getBoundingClientRect();
					const x = Math.max(0, (wRect.left + wRect.width / 2) - gRect.left - 60);
					const y = Math.max(0, (wRect.top + wRect.height / 2) - gRect.top - 60);
					customDecorationId ? addCustomOverlay(customDecorationId, x, y) : addOverlay(item.dataset.type, x, y);
				} else {
					customDecorationId ? addCustomOverlay(customDecorationId, 100, 100) : addOverlay(item.dataset.type, 100, 100);
				}
			} else {
				addBlock(item.dataset.type);
			}
		};
		item.addEventListener('dragstart', event => {
			state.dragPayload = isDecoration
				? (customDecorationId ? `overlay-custom:${customDecorationId}` : `overlay-type:${item.dataset.type}`)
				: `new-block:${item.dataset.type}`;
			event.dataTransfer.setData('text/plain', state.dragPayload);
			event.dataTransfer.effectAllowed = 'copy';
			// mix 슬롯 허용 타입 드래그 시 빨간 점선 표시
			const dragCat = templateCategories[item.dataset.type] || '';
			if (['box', 'list', 'title-horizontal', 'title-vertical', 'divider', 'text'].includes(dragCat)) {
				document.body.classList.add('is-mix-dragging');
			}
		});
		item.addEventListener('dragend', () => {
			state.dragPayload = '';
			canvasGrid.classList.remove('is-over');
			document.getElementById('canvasWrapper')?.classList.remove('is-decoration-over');
			document.body.classList.remove('is-mix-dragging');
		});
		item.addEventListener('dblclick', event => {
			if (event.target.closest('button')) return;
			event.preventDefault();
			addItemToCanvas();
		});
		item.querySelector('.component-add-btn').addEventListener('click', event => {
			event.stopPropagation();
			addItemToCanvas();
		});
	});*/

	document.querySelectorAll('[data-custom-decoration-remove]').forEach(button => {
		button.addEventListener('click', event => {
			event.stopPropagation();
			const id = button.dataset.customDecorationRemove;
			state.customDecorations = state.customDecorations.filter(item => item.id !== id);
			state.overlays = state.overlays.filter(overlay => overlay.customDecorationId !== id);
			syncCanvasPresence();
			saveCustomDecorations();
			renderComponentList();
			renderOverlayItems();
			updateMarkup();
		});
	});
}

function bindRenderedEvents() {
	document.querySelectorAll('.builder-block').forEach(block => {
		block.addEventListener('dragstart', event => {
			if (document.body.classList.contains('preview-mode')) {
				event.preventDefault();
				return;
			}
			if (event.target.closest('table [data-edit-field]')) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			if (event.target.closest('select') || event.target.closest('input') || event.target.closest('button') || event.target.closest('[contenteditable="true"]')) return;
			if (event.altKey) {
				state.dragPayload = `copy-block:${block.dataset.blockId}`;
				event.dataTransfer.effectAllowed = 'copy';
				requestAnimationFrame(() => {
					block.classList.add('dragging');
					block.classList.add('is-copy-dragging');
				});
			} else {
				state.dragPayload = `existing-block:${block.dataset.blockId}`;
				event.dataTransfer.effectAllowed = 'move';
				requestAnimationFrame(() => block.classList.add('dragging'));
			}
			event.dataTransfer.setData('text/plain', state.dragPayload);
		});
		block.addEventListener('dragover', event => {
			if (document.body.classList.contains('preview-mode')) return;
			const payload = state.dragPayload;
			if (payload.startsWith('new-inline:')) {
				const field = event.target.closest('[data-edit-field]');
				if (field && field.dataset.editField !== 'icon') {
					event.preventDefault();
					event.stopPropagation();
					event.dataTransfer.dropEffect = 'copy';
					_showInlineCaret(event.clientX, event.clientY);
				}
				return;
			}
			if (payload.startsWith('new-smart:')) {
				const field = event.target.closest('[data-edit-field]');
				if (field && field.dataset.editField !== 'icon') {
					event.preventDefault();
					event.stopPropagation();
					event.dataTransfer.dropEffect = 'copy';
					_showInlineCaret(event.clientX, event.clientY);
				} else {
					event.preventDefault();
					_clearInlineCaret();
					setBlockDropIndicator(block, event);
				}
				return;
			}
			if (payload.startsWith('new-block:') || payload.startsWith('existing-block:') || payload.startsWith('copy-block:')) {
				event.preventDefault();
				setBlockDropIndicator(block, event);
			}
		});
		block.addEventListener('dragleave', event => {
			if (!block.contains(event.relatedTarget)) {
				clearBlockDropIndicator(block);
				_clearInlineCaret();
			}
		});
		block.addEventListener('drop', handleBlockDrop);
		block.addEventListener('dragend', () => {
			state.dragPayload = '';
			block.classList.remove('dragging');
			block.classList.remove('is-copy-dragging');
			clearDropIndicators();
			_clearInlineCaret();
		});
		block.addEventListener('click', event => {
			if (document.body.classList.contains('preview-mode')) return;
			if (event.target.closest('[data-remove-block-id]')) return;
			if (event.target.closest('[data-duplicate-block-id]')) return;
			if (event.target.closest('[contenteditable="true"]')) return;
			if (event.target.closest('.block-item')) return;
			selectBlock(block.dataset.blockId);
		});
	});

	document.querySelectorAll('.block-item').forEach(item => {
		item.addEventListener('click', event => {
			if (document.body.classList.contains('preview-mode')) return;
			if (event.target.closest('[contenteditable="true"]')) return;
			// 새창링크(target="_blank")와 다운링크(download 속성)만 캔버스에서 차단
			const anchor = event.target.closest('a');
			if (anchor && (anchor.getAttribute('target') === '_blank' || anchor.hasAttribute('download'))) {
				event.preventDefault();
			}
			event.stopPropagation();
			selectBlockItem(item.dataset.blockId, Number(item.dataset.columnIndex));
		});
	});
	document.querySelectorAll('[data-props-block-id]').forEach(button => {
		button.addEventListener('click', event => {
			event.stopPropagation();
			openBlockProps(button.dataset.propsBlockId);
		});
	});
	document.querySelectorAll('[data-duplicate-block-id]').forEach(button => {
		button.addEventListener('click', event => {
			event.stopPropagation();
			duplicateBlock(button.dataset.duplicateBlockId);
		});
	});
	document.querySelectorAll('[data-remove-block-id]').forEach(button => {
		button.addEventListener('click', event => {
			event.stopPropagation();
			removeBlock(button.dataset.removeBlockId);
		});
	});
	document.querySelectorAll('[data-edit-field]').forEach(field => {
		field.addEventListener('dblclick', startTextEdit);
	});
	// 테이블 셀 드래그 선택 + 우클릭 메뉴 (data-table-section이 있는 실제 셀만 대상)
	document.querySelectorAll('table [data-table-section]').forEach(cell => {
		cell.addEventListener('mousedown', event => {
			if (document.body.classList.contains('preview-mode')) return;
			if (event.button !== 0) return;
			startTableCellDrag(cell, event);
		});
		cell.addEventListener('mouseenter', () => {
			if (!state.tableCellDrag) return;
			updateTableDragRange(cell);
		});
		cell.addEventListener('contextmenu', event => openTableContextMenu(cell, event));
		cell.addEventListener('dragstart', event => event.preventDefault());
	});
	if (!_tableCellDragEventsBound) {
		_tableCellDragEventsBound = true;
		document.addEventListener('mouseup', finishTableCellDrag);
		document.addEventListener('mousedown', event => {
			const menu = document.getElementById('tableContextMenu');
			if (!menu || menu.style.display === 'none') return;
			if (menu.contains(event.target)) return;
			if (event.target.closest && event.target.closest('table [data-edit-field]')) return;
			closeTableContextMenu(false);
		});
	}
	// 탭 항목 텍스트 인라인 편집
	document.querySelectorAll('[data-tab-block-id]').forEach(aEl => {
		aEl.addEventListener('dblclick', startTabTextEdit);
	});
	document.querySelectorAll('[data-edit-field="icon"]').forEach(field => {
		field.addEventListener('dblclick', event => {
			if (document.body.classList.contains('preview-mode')) return;
			event.stopPropagation();
			const item = field.closest('.block-item');
			if (!item) return;
			const imgEl = field.querySelector('img');
			const { catIndex, groupId } = imgEl ? findIconLocation(imgEl.src) : { catIndex: 0, groupId: null };
			openIconDrawer(catIndex, item.dataset.blockId, Number(item.dataset.columnIndex), groupId);
		});
	});
	// 절차(세로형) process inner slot 드래그 이벤트
	document.querySelectorAll('.process-inner-slot[data-pstep-block-id]').forEach(slot => {
		const pBlockId = slot.dataset.pstepBlockId;
		const pStepIdx = Number(slot.dataset.pstepIdx);
		slot.addEventListener('dragover', event => {
			if (document.body.classList.contains('preview-mode')) return;
			const payload = state.dragPayload;
			if (payload.startsWith('new-block:')) {
				if (!MIX_ALLOWED.has(templateCategories[payload.replace('new-block:', '')])) return;
			} else if (payload.startsWith('existing-block:')) {
				const srcBlock = state.blocks.find(b => b.id === payload.replace('existing-block:', ''));
				if (!srcBlock || !MIX_ALLOWED.has(templateCategories[srcBlock.type])) return;
			} else {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = payload.startsWith('new-block:') ? 'copy' : 'move';
			slot.classList.add('mix-slot-over');
		});
		slot.addEventListener('dragleave', event => {
			if (!slot.contains(event.relatedTarget)) slot.classList.remove('mix-slot-over');
		});
		slot.addEventListener('drop', event => {
			if (document.body.classList.contains('preview-mode')) return;
			const payload = state.dragPayload || event.dataTransfer.getData('text/plain');
			slot.classList.remove('mix-slot-over');
			if (payload.startsWith('new-block:')) {
				const newType = payload.replace('new-block:', '');
				if (!MIX_ALLOWED.has(templateCategories[newType])) return;
				event.preventDefault();
				event.stopPropagation();
				clearDropIndicators();
				state.dragPayload = '';
				addProcessStepInnerBlock(pBlockId, pStepIdx, newType);
			} else if (payload.startsWith('existing-block:')) {
				const srcId = payload.replace('existing-block:', '');
				const srcBlock = state.blocks.find(b => b.id === srcId);
				if (!srcBlock || !MIX_ALLOWED.has(templateCategories[srcBlock.type])) return;
				event.preventDefault();
				event.stopPropagation();
				clearDropIndicators();
				state.dragPayload = '';
				addProcessStepInnerBlockFromExisting(pBlockId, pStepIdx, srcId);
			}
		});
	});

	// 절차(세로형) inner item 제거 버튼
	document.querySelectorAll('.pstep-inner-remove').forEach(btn => {
		btn.addEventListener('click', event => {
			event.stopPropagation();
			removeProcessStepInnerBlock(
				btn.dataset.pstepBlockId,
				Number(btn.dataset.pstepIdx),
				Number(btn.dataset.pstepInnerIdx)
			);
		});
	});

	// 절차(세로형) inner item 드래그 재정렬
	let _pstepDragFrom = null;
	document.querySelectorAll('.pstep-inner-item[draggable]').forEach(item => {
		item.addEventListener('dragstart', event => {
			if (event.target.closest('button, input, select, textarea, [contenteditable="true"]')) {
				event.preventDefault();
				return;
			}
			_pstepDragFrom = {
				blockId: item.dataset.pstepBlockId,
				stepIdx: Number(item.dataset.pstepIdx),
				fromIdx: Number(item.dataset.pstepInnerIdx)
			};
			state.dragPayload = `pstep-reorder:${item.dataset.pstepBlockId}:${item.dataset.pstepIdx}:${item.dataset.pstepInnerIdx}`;
			event.dataTransfer.effectAllowed = 'move';
			event.stopPropagation();
			requestAnimationFrame(() => item.classList.add('mix-item-dragging'));
		});
		item.addEventListener('dragend', () => {
			item.classList.remove('mix-item-dragging');
			document.querySelectorAll('.mix-inner-item.mix-item-over').forEach(el => el.classList.remove('mix-item-over'));
			if (state.dragPayload.startsWith('pstep-reorder:')) state.dragPayload = '';
			_pstepDragFrom = null;
		});
		item.addEventListener('dragover', event => {
			if (!state.dragPayload.startsWith('pstep-reorder:')) return;
			if (_pstepDragFrom?.blockId !== item.dataset.pstepBlockId) return;
			if (_pstepDragFrom?.stepIdx !== Number(item.dataset.pstepIdx)) return;
			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'move';
			document.querySelectorAll('.mix-inner-item.mix-item-over').forEach(el => el.classList.remove('mix-item-over'));
			item.classList.add('mix-item-over');
		});
		item.addEventListener('dragleave', event => {
			if (!item.contains(event.relatedTarget)) item.classList.remove('mix-item-over');
		});
		item.addEventListener('drop', event => {
			if (!state.dragPayload.startsWith('pstep-reorder:')) return;
			event.preventDefault();
			event.stopPropagation();
			item.classList.remove('mix-item-over');
			const toIdx = Number(item.dataset.pstepInnerIdx);
			if (_pstepDragFrom && _pstepDragFrom.stepIdx === Number(item.dataset.pstepIdx) && _pstepDragFrom.fromIdx !== toIdx) {
				moveProcessStepInnerBlock(_pstepDragFrom.blockId, _pstepDragFrom.stepIdx, _pstepDragFrom.fromIdx, toIdx);
			}
			state.dragPayload = '';
			_pstepDragFrom = null;
		});
	});

	// 혼합 블록 inner slot 드래그 이벤트
	document.querySelectorAll('.mix-inner-slot[data-mix-block-id]').forEach(slot => {
		slot.addEventListener('dragover', event => {
			const payload = state.dragPayload;
			if (payload.startsWith('new-block:')) {
				const newType = payload.replace('new-block:', '');
				if (!MIX_ALLOWED.has(templateCategories[newType])) return;
			} else if (payload.startsWith('existing-block:')) {
				const srcId = payload.replace('existing-block:', '');
				const srcBlock = state.blocks.find(b => b.id === srcId);
				if (!srcBlock || !MIX_ALLOWED.has(templateCategories[srcBlock.type])) return;
			} else {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = payload.startsWith('new-block:') ? 'copy' : 'move';
			slot.classList.add('mix-slot-over');
		});
		slot.addEventListener('dragleave', event => {
			if (!slot.contains(event.relatedTarget)) {
				slot.classList.remove('mix-slot-over');
			}
		});
		slot.addEventListener('drop', event => {
			const payload = state.dragPayload || event.dataTransfer.getData('text/plain');
			if (payload.startsWith('new-block:')) {
				const newType = payload.replace('new-block:', '');
				if (!MIX_ALLOWED.has(templateCategories[newType])) return;
				event.preventDefault();
				event.stopPropagation();
				slot.classList.remove('mix-slot-over');
				clearDropIndicators();
				state.dragPayload = '';
				addMixInnerBlock(slot.dataset.mixBlockId, newType);
			} else if (payload.startsWith('existing-block:')) {
				const srcId = payload.replace('existing-block:', '');
				const srcBlock = state.blocks.find(b => b.id === srcId);
				if (!srcBlock || !MIX_ALLOWED.has(templateCategories[srcBlock.type])) return;
				event.preventDefault();
				event.stopPropagation();
				slot.classList.remove('mix-slot-over');
				clearDropIndicators();
				state.dragPayload = '';
				addMixInnerBlockFromExisting(slot.dataset.mixBlockId, srcId);
			}
		});
	});
	// 혼합 블록 내부 제거 버튼
	document.querySelectorAll('.mix-inner-remove').forEach(btn => {
		btn.addEventListener('click', event => {
			event.stopPropagation();
			removeMixInnerBlock(btn.dataset.mixBlockId, Number(btn.dataset.mixInnerIdx));
		});
	});
	// 테이블 셀 내부 블록 제거 버튼
	document.querySelectorAll('.table-cell-inner-remove').forEach(btn => {
		btn.addEventListener('click', event => {
			event.stopPropagation();
			removeTableCellInnerBlock(btn.dataset.blockId, btn.dataset.cellKey);
		});
	});
	// 테이블 셀 블록존 드래그 드롭
	document.querySelectorAll('.table-cell-block-zone.is-empty[data-cell-block-zone]').forEach(zone => {
		zone.addEventListener('dragover', event => {
			const payload = state.dragPayload;
			if (!payload.startsWith('new-block:') && !payload.startsWith('existing-block:')) return;
			const blockType = payload.startsWith('new-block:')
				? payload.replace('new-block:', '')
				: state.blocks.find(b => b.id === payload.replace('existing-block:', ''))?.type;
			if (!blockType || !MIX_ALLOWED.has(templateCategories[blockType])) return;
			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = payload.startsWith('new-block:') ? 'copy' : 'move';
			zone.classList.add('is-drag-over');
		});
		zone.addEventListener('dragleave', event => {
			if (!zone.contains(event.relatedTarget)) zone.classList.remove('is-drag-over');
		});
		zone.addEventListener('drop', event => {
			zone.classList.remove('is-drag-over');
			const payload = state.dragPayload || event.dataTransfer.getData('text/plain');
			const blockId = zone.dataset.blockId;
			const cellKey = zone.dataset.cellKey;
			if (payload.startsWith('new-block:')) {
				const newType = payload.replace('new-block:', '');
				if (!MIX_ALLOWED.has(templateCategories[newType])) return;
				event.preventDefault();
				event.stopPropagation();
				addTableCellInnerBlock(blockId, cellKey, newType);
			} else if (payload.startsWith('existing-block:')) {
				const srcId = payload.replace('existing-block:', '');
				const srcBlock = state.blocks.find(b => b.id === srcId);
				if (!srcBlock || !MIX_ALLOWED.has(templateCategories[srcBlock.type])) return;
				event.preventDefault();
				event.stopPropagation();
				addTableCellInnerBlockFromExisting(blockId, cellKey, srcId);
			}
		});
	});
	// 혼합 블록 내부 아이템 드래그 재정렬
	let _mixDragFrom = null;

	document.querySelectorAll('.mix-inner-item[draggable]').forEach(item => {
		if (item.classList.contains('pstep-inner-item')) return; // pstep 핸들러에서 처리
		item.addEventListener('dragstart', event => {
			// 버튼·입력·편집 영역에서는 드래그 시작 차단
			if (event.target.closest('button, input, select, textarea, [contenteditable="true"]')) {
				event.preventDefault();
				return;
			}
			_mixDragFrom = { outerBlockId: item.dataset.mixBlockId, fromIdx: Number(item.dataset.mixInnerIdx) };
			state.dragPayload = `mix-inner-reorder:${item.dataset.mixBlockId}:${item.dataset.mixInnerIdx}`;
			event.dataTransfer.effectAllowed = 'move';
			event.stopPropagation();
			requestAnimationFrame(() => item.classList.add('mix-item-dragging'));
		});
		item.addEventListener('dragend', () => {
			item.classList.remove('mix-item-dragging');
			document.querySelectorAll('.mix-inner-item.mix-item-over').forEach(el => el.classList.remove('mix-item-over'));
			if (state.dragPayload.startsWith('mix-inner-reorder:')) state.dragPayload = '';
			_mixDragFrom = null;
		});
		item.addEventListener('dragover', event => {
			if (!state.dragPayload.startsWith('mix-inner-reorder:')) return;
			const fromId = _mixDragFrom?.outerBlockId;
			if (fromId !== item.dataset.mixBlockId) return;
			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'move';
			document.querySelectorAll('.mix-inner-item.mix-item-over').forEach(el => el.classList.remove('mix-item-over'));
			item.classList.add('mix-item-over');
		});
		item.addEventListener('dragleave', event => {
			if (!item.contains(event.relatedTarget)) item.classList.remove('mix-item-over');
		});
		item.addEventListener('drop', event => {
			if (!state.dragPayload.startsWith('mix-inner-reorder:')) return;
			event.preventDefault();
			event.stopPropagation();
			item.classList.remove('mix-item-over');
			const toIdx = Number(item.dataset.mixInnerIdx);
			if (_mixDragFrom && _mixDragFrom.fromIdx !== toIdx) {
				moveMixInnerBlock(_mixDragFrom.outerBlockId, _mixDragFrom.fromIdx, toIdx);
			}
			state.dragPayload = '';
			_mixDragFrom = null;
		});
	});
	bindEditListEvents();

	document.querySelectorAll('.mix-inner-props').forEach(btn => {
		btn.addEventListener('click', event => {
			event.stopPropagation();
			openBlockProps(btn.dataset.mixInnerPropsId);
		});
	});

	document.querySelectorAll('.table-cell-inner-props').forEach(btn => {
		btn.addEventListener('click', event => {
			event.stopPropagation();
			openBlockProps(btn.dataset.tcellInnerPropsId);
		});
	});

	// title-list .list-wrap 드래그 & 클릭 이벤트
	document.querySelectorAll('.list-wrap[data-list-block-id]').forEach(slot => {
		const listWrapId = slot.dataset.listBlockId; // "outerBlockId::list::N"
		const outerBlockId = listWrapId.replace(/::list::\d+$/, '');
		// 빈 슬롯 클릭 → 리스트 필터 탭으로 이동
		slot.addEventListener('click', event => {
			event.stopPropagation();
			if (event.target.closest('.list-wrap-remove') || event.target.closest('.list-wrap-inner')) return;
			switchFilterTab('list');
			selectBlock(outerBlockId);
		});
		// list-wrap 내부 제거 버튼
		const removeBtn = slot.querySelector('.list-wrap-remove');
		if (removeBtn) {
			removeBtn.addEventListener('click', event => {
				event.stopPropagation();
				clearListWrapBlock(listWrapId);
			});
		}
		// list 카테고리 블록만 드롭 허용 (placeholder 상태일 때만 가로챔)
		slot.addEventListener('dragover', event => {
			if (document.body.classList.contains('preview-mode')) return;
			// 이미 리스트 블록이 연결된 경우 일반 블록 드롭/재배치로 위임
			if (!slot.querySelector('.list-wrap-placeholder')) return;
			const payload = state.dragPayload;
			if (payload.startsWith('new-block:')) {
				if (templateCategories[payload.replace('new-block:', '')] !== 'list') return;
			} else if (payload.startsWith('existing-block:')) {
				const src = state.blocks.find(b => b.id === payload.replace('existing-block:', ''));
				if (!src || templateCategories[src.type] !== 'list') return;
			} else {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			slot.classList.add('list-wrap-over');
		});
		slot.addEventListener('dragleave', event => {
			if (!slot.contains(event.relatedTarget)) slot.classList.remove('list-wrap-over');
		});
		slot.addEventListener('drop', event => {
			if (document.body.classList.contains('preview-mode')) return;
			// 이미 리스트 블록이 연결된 경우 일반 드롭으로 위임
			if (!slot.querySelector('.list-wrap-placeholder')) return;
			const payload = state.dragPayload || event.dataTransfer.getData('text/plain');
			slot.classList.remove('list-wrap-over');
			if (payload.startsWith('new-block:')) {
				const newType = payload.replace('new-block:', '');
				if (templateCategories[newType] !== 'list') return;
				event.preventDefault();
				event.stopPropagation();
				clearDropIndicators();
				state.dragPayload = '';
				setListWrapBlock(slot.dataset.listBlockId, newType);
			} else if (payload.startsWith('existing-block:')) {
				const srcId = payload.replace('existing-block:', '');
				const src = state.blocks.find(b => b.id === srcId);
				if (!src || templateCategories[src.type] !== 'list') return;
				event.preventDefault();
				event.stopPropagation();
				clearDropIndicators();
				state.dragPayload = '';
				setListWrapFromExisting(slot.dataset.listBlockId, srcId);
			}
		});
	});

	// 가정통신문 본문 영역: 디자인 블록 드래그 드롭
	document.querySelectorAll('.nl-content-area[data-edit-field="body"]').forEach(bodyArea => {
		bodyArea.addEventListener('dragover', event => {
			if (document.body.classList.contains('preview-mode')) return;
			const payload = state.dragPayload;
			if (!payload.startsWith('new-block:')) return;
			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'copy';
			bodyArea.classList.add('nl-body-drop-over');
		});
		bodyArea.addEventListener('dragleave', event => {
			if (!bodyArea.contains(event.relatedTarget)) {
				bodyArea.classList.remove('nl-body-drop-over');
			}
		});
		bodyArea.addEventListener('drop', event => {
			if (document.body.classList.contains('preview-mode')) return;
			const payload = state.dragPayload || event.dataTransfer.getData('text/plain');
			if (!payload.startsWith('new-block:')) return;
			event.preventDefault();
			event.stopPropagation();
			bodyArea.classList.remove('nl-body-drop-over');
			clearDropIndicators();
			state.dragPayload = '';
			const type = payload.replace('new-block:', '');
			if (!componentTemplates[type]) return;
			const builderBlock = bodyArea.closest('.builder-block');
			if (!builderBlock) return;
			const sectionBlockId = builderBlock.dataset.blockId;
			if (!state.blocks.find(b => b.id === sectionBlockId)) return;
			pushHistory();
			const bodyBlock = createBlock(type);
			bodyBlock._isNlBodyBlock = true;
			bodyBlock._parentSectionId = sectionBlockId;
			bodyBlock.marginBottom = 0;
			state.blocks.push(bodyBlock);
			render();
			openBlockProps(bodyBlock.id);
		});
	});

	// 가정통신문 본문 body 블록: 속성 버튼 클릭
	document.querySelectorAll('[data-nl-body-props-id]').forEach(btn => {
		btn.addEventListener('click', e => {
			e.stopPropagation();
			openBlockProps(btn.dataset.nlBodyPropsId);
		});
	});

	// 가정통신문 본문 body 블록: 삭제 버튼 클릭
	document.querySelectorAll('[data-nl-body-delete-id]').forEach(btn => {
		btn.addEventListener('click', e => {
			e.stopPropagation();
			const id = btn.dataset.nlBodyDeleteId;
			pushHistory();
			state.blocks = state.blocks.filter(b => b.id !== id);
			if (_propsBlockId === id) closeBlockProps();
			render();
		});
	});
}

function setBlockDropIndicator(block, event) {
	clearDropIndicators(block);
	const payload = state.dragPayload;
	const targetBlockData = state.blocks.find(b => b.id === block.dataset.blockId);

	if (targetBlockData && isTitleBlock(targetBlockData.type)) {
		let dragType = null;
		if (payload.startsWith('new-block:')) {
			dragType = payload.replace('new-block:', '');
		} else if (payload.startsWith('existing-block:')) {
			dragType = state.blocks.find(b => b.id === payload.replace('existing-block:', ''))?.type;
		} else if (payload.startsWith('copy-block:')) {
			dragType = state.blocks.find(b => b.id === payload.replace('copy-block:', ''))?.type;
		}
		if (dragType && isTitleBlock(dragType) && demoteTitleType(targetBlockData.type)) {
			const rect = block.getBoundingClientRect();
			const ratio = (event.clientY - rect.top) / rect.height;
			if (ratio >= 0.2 && ratio <= 0.8) {
				block.dataset.dropPosition = 'inside-title';
				block.classList.add('is-over', 'is-over-inside-title');
				return;
			}
		}
	}

	block.dataset.dropPosition = 'after';
	block.classList.add('is-over', 'is-over-after');
}

function clearBlockDropIndicator(block) {
	block.classList.remove('is-over', 'is-over-before', 'is-over-after', 'is-over-inside-title');
	delete block.dataset.dropPosition;
}

function clearDropIndicators(exceptBlock = null) {
	document.querySelectorAll('.builder-block.is-over').forEach(block => {
		if (block !== exceptBlock) clearBlockDropIndicator(block);
	});
	canvasGrid.classList.remove('is-over');
}

function selectBlock(blockId) {
	document.querySelectorAll('.block-item.is-selected').forEach(el => el.classList.remove('is-selected'));
	document.querySelectorAll('.builder-block.is-selected').forEach(el => el.classList.remove('is-selected'));
	const blockEl = document.querySelector(`.builder-block[data-block-id="${blockId}"]`);
	if (blockEl) blockEl.classList.add('is-selected');
	state.selectedItem = { blockId, columnIndex: null };
}

function selectBlockItem(blockId, columnIndex) {
	document.querySelectorAll('.block-item.is-selected').forEach(el => el.classList.remove('is-selected'));
	document.querySelectorAll('.builder-block.is-selected').forEach(el => el.classList.remove('is-selected'));
	const item = document.querySelector(`.block-item[data-block-id="${blockId}"][data-column-index="${columnIndex}"]`);
	if (item) item.classList.add('is-selected');
	state.selectedItem = { blockId, columnIndex };
}


function setPreviewDevice(device) {
	state.previewDevice = device;
	document.querySelectorAll('.device-btn').forEach(btn => {
		btn.classList.toggle('is-active', btn.dataset.device === device);
	});
	document.body.dataset.previewDevice = device;
	if (device === 'tablet') {
		canvasGrid.style.maxWidth = '768px';
	} else if (device === 'mobile') {
		canvasGrid.style.maxWidth = '380px';
	} else {
		canvasGrid.style.maxWidth = '1241px';
	}
	updateDecoStudioAvailability();
	// 디바이스 전환 시 탭 reactTab 클래스 및 .select 버튼 즉시 갱신
	initCanvasReactTab();
}


function updateBlockWidth(blockId, value) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	pushHistoryGrouped();
	block.blockWidth = value;
	const section = document.querySelector(`.builder-block[data-block-id="${blockId}"]`);
	if (section) section.style.width = value || '';
	updateMarkup();
}

function updateBlockMargin(blockId, value) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	pushHistoryGrouped();
	block.marginBottom = Math.max(0, Number(value) || 0);
	const total = state.blocks.length;
	const isLast = state.blocks[total - 1]?.id === blockId;
	const effectiveMargin = (total <= 1 || isLast) ? 0 : block.marginBottom;
	const section = document.querySelector(`.builder-block[data-block-id="${blockId}"]`);
	if (section) section.style.marginBottom = `${effectiveMargin}px`;
	updateMarkup();
}

function updateMixInnerMargin(outerBlockId, innerIdx, value) {
	const outerBlock = state.blocks.find(b => b.id === outerBlockId);
	if (!outerBlock || !Array.isArray(outerBlock.innerBlocks)) return;
	const innerBlock = outerBlock.innerBlocks[innerIdx];
	if (!innerBlock) return;
	pushHistoryGrouped();
	innerBlock.marginBottom = Math.max(0, Number(value) || 0);
	const section = document.querySelector(`.builder-block[data-block-id="${outerBlockId}"]`);
	const innerItem = section?.querySelector(`.mix-inner-item[data-mix-inner-idx="${innerIdx}"]`);
	if (innerItem) innerItem.style.marginBottom = `${innerBlock.marginBottom}px`;
	updateMarkup();
}

function startTextEdit(event) {
	if (document.body.classList.contains('preview-mode')) return;
	const field = event.currentTarget;
	if (field.dataset.editField === 'icon') return;
	if (field.dataset.cellBlockZone) return;
	event.stopPropagation();
	field._editOriginalHtml = field.innerHTML;
	field.setAttribute('contenteditable', 'true');
	field.focus();
	const range = document.createRange();
	range.selectNodeContents(field);
	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
	field.addEventListener('blur', finishTextEdit, { once: true });
	field.addEventListener('keydown', handleEditKeydown);
}

function startTabTextEdit(event) {
	if (document.body.classList.contains('preview-mode')) return;
	event.preventDefault();
	event.stopPropagation();
	const aEl = event.currentTarget;
	aEl._tabEditOriginal = aEl.textContent;
	aEl.setAttribute('contenteditable', 'true');
	aEl.focus();
	const range = document.createRange();
	range.selectNodeContents(aEl);
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
	aEl.addEventListener('blur', finishTabTextEdit, { once: true });
	aEl.addEventListener('keydown', _tabEditKeydown);
}

function _tabEditKeydown(event) {
	if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
	if (event.key === 'Escape') { event.preventDefault(); event.currentTarget._tabEditCancelled = true; event.currentTarget.blur(); }
}

function finishTabTextEdit(event) {
	const aEl = event.currentTarget;
	aEl.removeEventListener('keydown', _tabEditKeydown);
	aEl.removeAttribute('contenteditable');
	if (aEl._tabEditCancelled) { aEl._tabEditCancelled = false; return; }
	const blockId = aEl.dataset.tabBlockId;
	const idx = Number(aEl.dataset.tabItemIdx);
	const block = state.blocks.find(b => b.id === blockId);
	if (!block || !block.tabItems || !block.tabItems[idx]) return;
	const newText = aEl.textContent.trim();
	if (newText && newText !== aEl._tabEditOriginal) {
		pushHistory();
		block.tabItems[idx].text = newText;
		render();
	}
}

function handleEditKeydown(event) {
	if (event.key === 'Enter') {
		if (event.altKey) {
			event.preventDefault();
			const selection = window.getSelection();
			if (selection.rangeCount) {
				const range = selection.getRangeAt(0);
				range.deleteContents();
				const br = document.createElement('br');
				range.insertNode(br);
				range.setStartAfter(br);
				range.collapse(true);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		} else {
			event.preventDefault();
			event.currentTarget.blur();
		}
	}
	if (event.key === 'Escape') {
		event.preventDefault();
		event.currentTarget._editCancelled = true;
		render();
	}
}

function finishTextEdit(event) {
	if (_colorPickerOpen) {
		event.currentTarget.addEventListener('blur', finishTextEdit, { once: true });
		return;
	}
	const field = event.currentTarget;
	field.removeEventListener('keydown', handleEditKeydown);
	field.removeAttribute('contenteditable');
	if (field._editCancelled) return;
	const columnIndex = Number(field.dataset.columnIndex);
	// 혼합 내부 블록 / title-list list-wrap / 테이블 셀 내부 블록 참조 여부 확인
	const mixRef = resolveMixInnerRef(field.dataset.blockId);
	const listRef = !mixRef ? resolveListInnerRef(field.dataset.blockId) : null;
	const tcellRef = !mixRef && !listRef ? resolveTableCellInnerRef(field.dataset.blockId) : null;
	const targetItems = mixRef ? mixRef.innerBlock.items
		: listRef ? listRef.listBlock.items
		: tcellRef ? tcellRef.innerBlockData.items
		: state.blocks.find(b => b.id === field.dataset.blockId)?.items;
	if (!targetItems || !targetItems[columnIndex]) return;
	const html = field.innerHTML;
	const fieldName = field.dataset.editField;
	const originalHtml = field._editOriginalHtml ?? targetItems[columnIndex][fieldName] ?? '';
	if (html && html !== originalHtml) {
		pushHistory();
		targetItems[columnIndex][fieldName] = html;
	}
	render();
}

// --- Inline block insertion helpers ---
let _inlineCaretEl = null;
let _pendingSmartInline = null;
let _lastInlineCaretX = -1;
let _lastInlineCaretY = -1;

function _getCaretRange(x, y) {
	if (document.caretRangeFromPoint) {
		return document.caretRangeFromPoint(x, y);
	}
	if (document.caretPositionFromPoint) {
		const pos = document.caretPositionFromPoint(x, y);
		if (pos) {
			const r = document.createRange();
			r.setStart(pos.offsetNode, pos.offset);
			r.collapse(true);
			return r;
		}
	}
	return null;
}

function _positionInlineCaretEl(left, top, height) {
	if (!_inlineCaretEl) {
		_inlineCaretEl = document.createElement('div');
		_inlineCaretEl.className = 'inline-drop-caret';
		document.body.appendChild(_inlineCaretEl);
	}
	_inlineCaretEl.style.left = `${left}px`;
	_inlineCaretEl.style.top = `${top}px`;
	_inlineCaretEl.style.height = `${height || 18}px`;
}

function _showInlineCaret(x, y) {
	const field = document.elementFromPoint(x, y)?.closest('[data-edit-field]');
	if (!field || field.dataset.editField === 'icon') {
		_clearInlineCaret();
		return;
	}

	if (!field.classList.contains('inline-drop-active')) {
		document.querySelectorAll('.inline-drop-active').forEach(el => el.classList.remove('inline-drop-active'));
		field.classList.add('inline-drop-active');
	}

	if (Math.abs(x - _lastInlineCaretX) < 4 && Math.abs(y - _lastInlineCaretY) < 4) return;
	_lastInlineCaretX = x;
	_lastInlineCaretY = y;

	const range = _getCaretRange(x, y);
	if (!range || !field.contains(range.startContainer)) {
		const fr = field.getBoundingClientRect();
		_positionInlineCaretEl(fr.right, fr.top, fr.height);
		return;
	}

	const sentinel = document.createElement('span');
	sentinel.textContent = '​';
	sentinel.style.cssText = 'display:inline;font-size:inherit;line-height:inherit;pointer-events:none;';
	range.insertNode(sentinel);
	const rect = sentinel.getBoundingClientRect();
	sentinel.remove();

	_positionInlineCaretEl(rect.left, rect.top, rect.height || 18);
}

function _clearInlineCaret() {
	if (_inlineCaretEl) {
		_inlineCaretEl.remove();
		_inlineCaretEl = null;
	}
	_lastInlineCaretX = -1;
	_lastInlineCaretY = -1;
	document.querySelectorAll('.inline-drop-active').forEach(el => el.classList.remove('inline-drop-active'));
}

function _insertInlineBlock(templateId, x, y) {
	const template = componentTemplates[templateId];
	if ((!template?.isInline && !template?.isSmartInline) || !template.inlineHtml) return;

	const field = document.elementFromPoint(x, y)?.closest('[data-edit-field]');
	if (!field || field.dataset.editField === 'icon') return;

	let range = _getCaretRange(x, y);
	if (!range || !field.contains(range.startContainer)) {
		range = document.createRange();
		range.selectNodeContents(field);
		range.collapse(false);
	}

	range.deleteContents();
	const fragment = range.createContextualFragment(template.inlineHtml);
	range.insertNode(fragment);

	const blockId = field.dataset.blockId;
	const columnIndex = Number(field.dataset.columnIndex);
	const fieldName = field.dataset.editField;

	const mixRef = resolveMixInnerRef(blockId);
	const listRef = !mixRef ? resolveListInnerRef(blockId) : null;
	const targetItems = mixRef ? mixRef.innerBlock.items
		: listRef ? listRef.listBlock.items
		: state.blocks.find(b => b.id === blockId)?.items;

	if (!targetItems || !targetItems[columnIndex]) return;

	pushHistory();
	targetItems[columnIndex][fieldName] = field.innerHTML;
	render();
}
// --- End inline block insertion helpers ---

// ── 스마트 인라인 팝업 ────────────────────────────────────────

function _showSmartInlinePopup(templateId, x, y) {
	const template = componentTemplates[templateId];
	if (!template?.isSmartInline || !template.inlineHtml) return;

	const field = document.elementFromPoint(x, y)?.closest('[data-edit-field]');
	if (!field || field.dataset.editField === 'icon') return;

	let range = _getCaretRange(x, y);
	if (!range || !field.contains(range.startContainer)) {
		range = document.createRange();
		range.selectNodeContents(field);
		range.collapse(false);
	}

	// 삽입 위치에 플레이스홀더 삽입 (점선 강조)
	range.deleteContents();
	const placeholder = document.createElement('span');
	placeholder.id = 'smart-inline-placeholder';
	range.insertNode(placeholder);

	_pendingSmartInline = {
		templateId,
		fieldBlockId: field.dataset.blockId,
		fieldName: field.dataset.editField,
		columnIndex: Number(field.dataset.columnIndex)
	};

	// 팝업 섹션 전환
	const linkSection = document.getElementById('inlinePropLinkSection');
	const downloadSection = document.getElementById('inlinePropDownloadSection');
	// 기본 텍스트 설정
	const defaultTextMap = { 'text-03': '텍스트', 'text-04': '다운로드' };
	document.getElementById('inlinePropText').value = defaultTextMap[templateId] || '';

	if (templateId === 'text-03') {
		linkSection.style.display = '';
		downloadSection.style.display = 'none';
		document.getElementById('inlinePropHref').value = '';
		document.getElementById('inlinePropTarget').value = '_blank';
	} else {
		linkSection.style.display = 'none';
		downloadSection.style.display = '';
	}

	// 팝업 위치 계산 (뷰포트 경계 처리)
	const popup = document.getElementById('inlinePropPopup');
	popup.classList.add('is-open');
	const popRect = popup.getBoundingClientRect();
	let left = x + 14;
	let top = y + 14;
	if (left + popRect.width > window.innerWidth - 8) left = x - popRect.width - 14;
	if (top + popRect.height > window.innerHeight - 8) top = y - popRect.height - 14;
	popup.style.left = `${Math.max(8, left)}px`;
	popup.style.top = `${Math.max(8, top)}px`;

	requestAnimationFrame(() => {
		const textEl = document.getElementById('inlinePropText');
		if (textEl) { textEl.focus(); textEl.select(); }
	});
}

function _confirmSmartInline() {
	if (!_pendingSmartInline) return;
	const { templateId, fieldBlockId, fieldName, columnIndex } = _pendingSmartInline;

	const placeholder = document.getElementById('smart-inline-placeholder');
	if (!placeholder) { _cancelSmartInline(); return; }
	const field = placeholder.closest('[data-edit-field]');
	if (!field) { _cancelSmartInline(); return; }

	// inlineHtml을 기반으로 속성 주입
	const template = componentTemplates[templateId];
	const temp = document.createElement('div');
	temp.innerHTML = template.inlineHtml;
	const aEl = temp.querySelector('a');
	if (aEl) {
		// 커서 탈출 방지: contenteditable 필드 안의 <a>는 비편집 아일랜드로 처리
		aEl.setAttribute('contenteditable', 'false');

		// 텍스트 입력값 → <a>의 첫 번째 텍스트 노드 교체
		const textValue = document.getElementById('inlinePropText')?.value.trim();
		if (textValue) {
			for (const node of Array.from(aEl.childNodes)) {
				if (node.nodeType === Node.TEXT_NODE) {
					node.textContent = textValue;
					break;
				}
			}
		}

		if (templateId === 'text-03') {
			const href = document.getElementById('inlinePropHref')?.value.trim() || '';
			const target = document.getElementById('inlinePropTarget')?.value || '_blank';
			if (href) aEl.setAttribute('href', href);
			aEl.setAttribute('target', target);
			if (target === '_blank') {
				aEl.setAttribute('title', '새창');
			} else {
				aEl.removeAttribute('title');
			}
		}
	}

	const insertRange = document.createRange();
	insertRange.selectNode(placeholder);
	const fragment = insertRange.createContextualFragment(temp.innerHTML);
	placeholder.replaceWith(fragment);

	const mixRef = resolveMixInnerRef(fieldBlockId);
	const listRef = !mixRef ? resolveListInnerRef(fieldBlockId) : null;
	const targetItems = mixRef ? mixRef.innerBlock.items
		: listRef ? listRef.listBlock.items
		: state.blocks.find(b => b.id === fieldBlockId)?.items;

	if (targetItems?.[columnIndex]) {
		pushHistory();
		targetItems[columnIndex][fieldName] = field.innerHTML;
		_closeSmartInlinePopup();
		render();
	} else {
		_cancelSmartInline();
	}
}

function _cancelSmartInline() {
	const placeholder = document.getElementById('smart-inline-placeholder');
	if (placeholder) placeholder.remove();
	_closeSmartInlinePopup();
}

function _closeSmartInlinePopup() {
	_pendingSmartInline = null;
	document.getElementById('inlinePropPopup')?.classList.remove('is-open');
}

function initSmartInlinePopup() {
	document.getElementById('inlinePropConfirm')?.addEventListener('click', _confirmSmartInline);
	document.getElementById('inlinePropCancel')?.addEventListener('click', _cancelSmartInline);

	['inlinePropText', 'inlinePropHref'].forEach(id => {
		document.getElementById(id)?.addEventListener('keydown', e => {
			if (e.key === 'Enter') { e.preventDefault(); _confirmSmartInline(); }
			if (e.key === 'Escape') { e.preventDefault(); _cancelSmartInline(); }
		});
	});

	// 팝업 외부 클릭 시 취소
	document.addEventListener('mousedown', e => {
		const popup = document.getElementById('inlinePropPopup');
		if (popup?.classList.contains('is-open') && !popup.contains(e.target)) {
			_cancelSmartInline();
		}
	});
}

// ── End 스마트 인라인 팝업 ────────────────────────────────────

function handleCanvasDragOver(event) {
	if (document.body.classList.contains('preview-mode')) return;
	const payload = state.dragPayload;
	if (payload.startsWith('new-inline:')) {
		const field = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-edit-field]');
		if (field && field.dataset.editField !== 'icon') {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
			_showInlineCaret(event.clientX, event.clientY);
		}
		return;
	}
	if (payload.startsWith('new-smart:')) {
		const field = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-edit-field]');
		if (field && field.dataset.editField !== 'icon') {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
			_showInlineCaret(event.clientX, event.clientY);
		} else {
			event.preventDefault();
			_clearInlineCaret();
			canvasGrid.classList.add('is-over');
		}
		return;
	}
	if (payload.startsWith('overlay-type:') || payload.startsWith('overlay-custom:')) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
		document.getElementById('canvasWrapper')?.classList.add('is-decoration-over');
		return;
	}
	if (payload.startsWith('new-block:') || payload.startsWith('new-design-template:') || payload.startsWith('existing-block:') || payload.startsWith('copy-block:')) {
		event.preventDefault();
		canvasGrid.classList.add('is-over');
	}
}

function handleCanvasDrop(event) {
	if (document.body.classList.contains('preview-mode')) return;
	const payload = state.dragPayload || event.dataTransfer.getData('text/plain');
	if (!payload) return;
	if (payload.startsWith('new-inline:')) {
		event.preventDefault();
		event.stopPropagation();
		state.dragPayload = '';
		_insertInlineBlock(payload.replace('new-inline:', ''), event.clientX, event.clientY);
		_clearInlineCaret();
		return;
	}
	if (payload.startsWith('new-smart:')) {
		event.preventDefault();
		event.stopPropagation();
		const type = payload.replace('new-smart:', '');
		state.dragPayload = '';
		const field = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-edit-field]');
		if (field && field.dataset.editField !== 'icon') {
			_clearInlineCaret();
			_showSmartInlinePopup(type, event.clientX, event.clientY);
		} else {
			clearDropIndicators();
			const targetBlock = event.target.closest('.builder-block');
			const position = targetBlock ? targetBlock.dataset.dropPosition || 'after' : 'after';
			addBlock(type, targetBlock ? targetBlock.dataset.blockId : null, position);
		}
		return;
	}
	clearDropIndicators();
	state.dragPayload = '';
	if (payload.startsWith('overlay-type:') || payload.startsWith('overlay-custom:')) {
		event.preventDefault();
		event.stopPropagation();
		document.getElementById('canvasWrapper')?.classList.remove('is-decoration-over');
		const grid = document.getElementById('canvasGrid');
		if (grid) {
			const gRect = grid.getBoundingClientRect();
			if (payload.startsWith('overlay-custom:')) {
				addCustomOverlay(payload.replace('overlay-custom:', ''), event.clientX - gRect.left, event.clientY - gRect.top);
			} else {
				addOverlay(payload.replace('overlay-type:', ''), event.clientX - gRect.left, event.clientY - gRect.top);
			}
		}
		return;
	}
	const targetBlock = event.target.closest('.builder-block');
	const position = targetBlock ? targetBlock.dataset.dropPosition || 'after' : 'after';
	if (payload.startsWith('new-block:')) {
		event.preventDefault();
		event.stopPropagation();
		addBlock(payload.replace('new-block:', ''), targetBlock ? targetBlock.dataset.blockId : null, position);
		return;
	}
	if (payload.startsWith('new-design-template:')) {
		event.preventDefault();
		event.stopPropagation();
		addDesignTemplate(payload.replace('new-design-template:', ''), targetBlock ? targetBlock.dataset.blockId : null, position);
		return;
	}
	if (payload.startsWith('existing-block:')) {
		event.preventDefault();
		event.stopPropagation();
		moveBlock(payload.replace('existing-block:', ''), targetBlock ? targetBlock.dataset.blockId : null, position);
		return;
	}
	if (payload.startsWith('copy-block:')) {
		event.preventDefault();
		event.stopPropagation();
		duplicateBlockAt(payload.replace('copy-block:', ''), targetBlock ? targetBlock.dataset.blockId : null, position);
	}
}

function handleBlockDrop(event) {
	if (document.body.classList.contains('preview-mode')) return;
	const payload = state.dragPayload || event.dataTransfer.getData('text/plain');
	if (payload.startsWith('new-inline:')) {
		event.preventDefault();
		event.stopPropagation();
		state.dragPayload = '';
		_insertInlineBlock(payload.replace('new-inline:', ''), event.clientX, event.clientY);
		_clearInlineCaret();
		return;
	}
	if (payload.startsWith('new-smart:')) {
		const type = payload.replace('new-smart:', '');
		const field = event.target.closest('[data-edit-field]');
		if (field && field.dataset.editField !== 'icon') {
			event.preventDefault();
			event.stopPropagation();
			state.dragPayload = '';
			_clearInlineCaret();
			_showSmartInlinePopup(type, event.clientX, event.clientY);
		} else {
			event.preventDefault();
			event.stopPropagation();
			const targetBlockId = event.currentTarget.dataset.blockId;
			const position = event.currentTarget.dataset.dropPosition || 'after';
			clearDropIndicators();
			state.dragPayload = '';
			addBlock(type, targetBlockId, position);
		}
		return;
	}
	if (!payload.startsWith('new-block:') && !payload.startsWith('new-design-template:') && !payload.startsWith('existing-block:') && !payload.startsWith('copy-block:')) return;
	event.preventDefault();
	event.stopPropagation();
	const targetBlockId = event.currentTarget.dataset.blockId;
	const position = event.currentTarget.dataset.dropPosition || 'after';
	clearDropIndicators();
	state.dragPayload = '';

	// 타이틀 블록을 타이틀 블록 중앙에 드롭: 한 단계 아래 레벨로 변환하여 삽입
	if (position === 'inside-title') {
		const targetBlockData = state.blocks.find(b => b.id === targetBlockId);
		if (targetBlockData && isTitleBlock(targetBlockData.type)) {
			const demotedType = demoteTitleType(targetBlockData.type);
			if (demotedType) {
				convertAndInsertTitleBlock(payload, targetBlockId, demotedType);
				return;
			}
		}
	}

	if (payload.startsWith('new-block:')) {
		addBlock(payload.replace('new-block:', ''), targetBlockId, position);
		return;
	}
	if (payload.startsWith('new-design-template:')) {
		addDesignTemplate(payload.replace('new-design-template:', ''), targetBlockId, position);
		return;
	}
	if (payload.startsWith('copy-block:')) {
		duplicateBlockAt(payload.replace('copy-block:', ''), targetBlockId, position);
		return;
	}
	moveBlock(payload.replace('existing-block:', ''), targetBlockId, position);
}

function updateMarkup() {
	markupOutput.value = generateMarkup();
}

function generateMarkup() {
	if (!state.blocks.length && !state.overlays.length) return '<!-- 디자인 블록을 추가하면 마크업이 생성됩니다. -->';
	const { html: blocksHtml, cssRules } = state.blocks.length ? _generateBlocksMarkup() : { html: '', cssRules: [] };

	const indentBlocks = blocksHtml.split('\n').map(l => `  ${l}`).join('\n');

	if (!state.overlays.length) {
		const styleBlock = cssRules.length ? `<style>\n${cssRules.join('\n\n')}\n</style>` : '';
		const gridHtml = `<div class="canvas-grid">\n${indentBlocks}\n</div>`;
		return styleBlock ? `${styleBlock}\n\n${gridHtml}` : gridHtml;
	}
	cssRules.push(`@media (max-width: 768px) {\n  .sub-content-decoration {\n    display: none !important;\n  }\n}`);
	const overlaysMarkup = state.overlays.map(ov => {
		if (ov.customDecorationId) {
			const item = getCustomDecoration(ov.customDecorationId);
			if (!item) return '';
			return `  <div class="sub-content-decoration" style="position:absolute;top:${ov.y}px;left:${ov.x}px;">\n    <img src="${escapeAttr(item.src)}" alt="${escapeAttr(item.name || '사용자 꾸밈요소')}" style="display:block;max-width:160px;height:auto;">\n  </div>`;
		}
		const template = componentTemplates[ov.type];
		if (!template) return '';
		const lines = template.markup(ov.data || {});
		const inner = lines.map(l => `    ${l}`).join('\n');
		return `  <div class="sub-content-decoration" style="position:absolute;top:${ov.y}px;left:${ov.x}px;">\n${inner}\n  </div>`;
	}).join('\n');
	const gridWithOverlay = `<div class="canvas-grid" style="position:relative;">\n${indentBlocks}\n${overlaysMarkup}\n</div>`;
	const styleBlock = `<style>\n${cssRules.join('\n\n')}\n</style>`;
	return styleBlock ? `${styleBlock}\n\n${gridWithOverlay}` : gridWithOverlay;
}

function _buildStyleRule(selector, vars) {
	const declarations = vars.split(';').map(s => s.trim()).filter(Boolean);
	return `${selector} {\n  ${declarations.join(';\n  ')};\n}`;
}

function _templateRootClass(template) {
	return template.element.classList[0] || template.id;
}

function _extractInnerVarStyles(el, baseSelector, cssRules) {
	el.querySelectorAll('[style]').forEach(inner => {
		const style = inner.getAttribute('style') || '';
		if (!style.includes('--')) return;
		const cls = Array.from(inner.classList)
			.find(c => !['inner', 'block-item', 'list-wrap-inner', 'template-title', 'template-body'].includes(c));
		if (!cls) return;
		cssRules.push(_buildStyleRule(`${baseSelector} .${cls}`, style));
		inner.removeAttribute('style');
	});
}

function _elementMarkup(el) {
	return elementToHtml(el);
}

function _unwrapIfBare(el) {
	if (el.attributes.length === 0) return el.innerHTML.trim();
	return elementToHtml(el);
}

function _stripCssVars(el) {
	const strip = node => {
		const style = node.getAttribute('style');
		if (!style || !style.includes('--')) return;
		const cleaned = style.replace(/--[\w-]+\s*:[^;]+;?\s*/g, '').trim().replace(/;$/, '');
		if (cleaned) node.setAttribute('style', cleaned);
		else node.removeAttribute('style');
	};
	strip(el);
	el.querySelectorAll('[style]').forEach(strip);
}

function _prettyHtml(html) {
	const INDENT = '  ';
	const VOID = /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)[\s>/]/i;
	let level = 0;
	return html
		.replace(/>\s*</g, '>\n<')
		.split('\n')
		.map(s => s.trim())
		.filter(Boolean)
		.map(line => {
			if (line.startsWith('</')) level = Math.max(0, level - 1);
			const out = INDENT.repeat(level) + line;
			if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>') && !VOID.test(line) && !line.includes('</')) level++;
			return out;
		})
		.join('\n');
}

function _wrapInSection(block, idx, total, innerHtml) {
	const effectiveMargin = (total <= 1 || idx === total - 1) ? 0 : (block.marginBottom ?? 10);
	const styleParts = [];
	if (block.marginTop) styleParts.push(`margin-top:${block.marginTop}px`);
	if (effectiveMargin) styleParts.push(`margin-bottom:${effectiveMargin}px`);
	if (block.marginLeft) styleParts.push(`margin-left:${block.marginLeft}px`);
	if (block.marginRight) styleParts.push(`margin-right:${block.marginRight}px`);
	const effectiveWidth = _calcEffectiveWidth(block.blockWidth, block.marginLeft, block.marginRight);
	if (effectiveWidth) styleParts.push(`width:${effectiveWidth}`);
	const styleAttr = styleParts.length ? ` style="${styleParts.join(';')}"` : '';
	const indented = innerHtml.split('\n').map(l => `  ${l}`).join('\n');
	return `<section${styleAttr}>\n${indented}\n</section>`;
}

function _cleanBlockItem(el) {
	el.querySelectorAll('.block-item').forEach(bi => bi.removeAttribute('style'));
	if (el.classList.contains('block-item')) el.removeAttribute('style');
}

function _generateBlocksMarkup() {
	const _sink = [];
	const visibleBlocks = state.blocks.filter(b => !b._isNlBodyBlock);
	const total = visibleBlocks.length;
	const html = visibleBlocks.map((block, idx) => {
		const template = componentTemplates[block.type];

		if (template.isRootWrap) {
			const innerHtml = block.items.map((item, colIdx) => {
				const el = renderAddColumnWrapElement(template, item, block, colIdx, false);
				// 뉴스레터 section_3 본문 body 블록 주입
				if (block.type === 'newsletter-01__section_3') {
					const contentArea = el.querySelector('.nl-content-area');
					if (contentArea) {
						const bodyBlocks = state.blocks.filter(b => b._isNlBodyBlock && b._parentSectionId === block.id);
						if (bodyBlocks.length > 0) {
							contentArea.innerHTML = '';
							bodyBlocks.forEach(bb => {
								const bbTemplate = componentTemplates[bb.type];
								if (!bbTemplate) return;
								const wrapper = document.createElement('div');
								wrapper.className = 'nl-block-insert nl-body-block-wrap';
								const gapPx = (bb.marginBottom !== undefined && bb.marginBottom !== null)
									? bb.marginBottom : (parseInt(state.newsletterStyle.blockGap) || 12);
								if (bb.marginTop) wrapper.style.marginTop = bb.marginTop + 'px';
								wrapper.style.marginBottom = gapPx + 'px';
								if (bb.marginLeft && bb.blockAlign !== 'ac') wrapper.style.marginLeft = bb.marginLeft + 'px';
								if (bb.marginRight && bb.blockAlign !== 'ac' && bb.blockAlign !== 'ar') wrapper.style.marginRight = bb.marginRight + 'px';
								const nlEffectiveWidth = _calcEffectiveWidth(bb.blockWidth, bb.blockAlign ? 0 : bb.marginLeft, bb.blockAlign ? 0 : bb.marginRight);
								if (nlEffectiveWidth) wrapper.style.width = nlEffectiveWidth;
								if (bb.blockAlign === 'ac') { wrapper.style.marginLeft = 'auto'; wrapper.style.marginRight = 'auto'; }
								else if (bb.blockAlign === 'ar') { wrapper.style.marginLeft = 'auto'; }
								if (bb.nlBodyZoom && bb.nlBodyZoom !== 100) wrapper.style.zoom = (bb.nlBodyZoom / 100).toString();
								if (bb.nlBodyFontWeight) wrapper.style.setProperty('--nl-body-font-weight', bb.nlBodyFontWeight);
								let bbEl;
								if (bbTemplate.isRootWrap) {
									bbEl = renderAddColumnWrapElement(bbTemplate, bb.items[0] || {}, bb, 0, false);
									stripEditorAttributes(bbEl);
								} else {
									bbEl = buildColumnBlock(bbTemplate, bb, false);
								}
								wrapper.innerHTML = bbEl instanceof Element ? elementToHtml(bbEl) : String(bbEl);
								contentArea.appendChild(wrapper);
							});
						}
					}
				}
				_extractInnerVarStyles(el, '.x', _sink);
				applyItemStyles(el, item, template);
				_stripCssVars(el);
				_cleanBlockItem(el);
				return _prettyHtml(_elementMarkup(el));
			}).join('\n\n');
			return _wrapInSection(block, idx, total, innerHtml);
		} else if (templateCategories[block.type] === 'table') {
			const item = block.items[0];
			const outer = renderTableDynamically(block, item, 0, false);
			if (outer.hasAttribute('style')) outer.removeAttribute('style');
			applyItemStyles(outer, item, template);
			_stripCssVars(outer);
			_cleanBlockItem(outer);
			return _wrapInSection(block, idx, total, _prettyHtml(_unwrapIfBare(outer)));
		} else if (templateCategories[block.type] === 'list' && block.items[0]?.rows) {
			const item = block.items[0];
			const outer = renderListDynamically(block, item, 0, template.element, false);
			if (outer.hasAttribute('style')) outer.removeAttribute('style');
			const listFirstChild = outer.firstElementChild;
			if (listFirstChild && block.blockAlign) {
				listFirstChild.classList.remove('al', 'ac', 'ar');
				listFirstChild.classList.add(block.blockAlign);
			}
			applyItemStyles(outer, item, template);
			_stripCssVars(outer);
			_cleanBlockItem(outer);
			return _wrapInSection(block, idx, total, _prettyHtml(_unwrapIfBare(outer)));
		} else {
			const outer = buildColumnBlock(template, block, false);
			if (outer.hasAttribute('style')) outer.removeAttribute('style');
			_extractInnerVarStyles(outer, '.x', _sink);
			applyItemStyles(outer, block.items[0] || {}, template);
			_stripCssVars(outer);
			_cleanBlockItem(outer);
			return _wrapInSection(block, idx, total, _prettyHtml(_unwrapIfBare(outer)));
		}
	}).join('\n\n');

	return { html, cssRules: [] };
}

// ── 오버레이 시스템 ────────────────────────────────────────────

let _overlayNextId = 1;
let _overlayDrag = null;
let _overlayDragOffset = { x: 0, y: 0 };

function addOverlay(type, x, y) {
	const template = componentTemplates[type];
	if (!template) return;
	const data = template.getDefaultData ? template.getDefaultData() : {};
	state.overlays.push({ id: `ov-${_overlayNextId++}`, type, x: Math.round(x), y: Math.round(y), data });
	syncCanvasPresence();
	if (!state.blocks.length) render();
	renderOverlayItems();
	updateMarkup();
}

function addCustomOverlay(customDecorationId, x, y) {
	if (!getCustomDecoration(customDecorationId)) return;
	state.overlays.push({
		id: `ov-${_overlayNextId++}`,
		type: 'custom-decoration',
		customDecorationId,
		x: Math.round(x),
		y: Math.round(y)
	});
	syncCanvasPresence();
	if (!state.blocks.length) render();
	renderOverlayItems();
	updateMarkup();
}

function removeOverlay(id) {
	state.overlays = state.overlays.filter(ov => ov.id !== id);
	syncCanvasPresence();
	if (!state.blocks.length) render();
	renderOverlayItems();
	updateMarkup();
}

function renderCustomOverlayImage(overlay) {
	const item = getCustomDecoration(overlay.customDecorationId);
	if (!item) return '';
	return `<img src="${escapeAttr(item.src)}" alt="${escapeAttr(item.name || '사용자 꾸밈요소')}" class="custom-overlay-img">`;
}

function getGridOffset() {
	const grid = document.getElementById('canvasGrid');
	const wrapper = document.getElementById('canvasWrapper');
	if (!grid || !wrapper) return { x: 0, y: 0 };
	const gRect = grid.getBoundingClientRect();
	const wRect = wrapper.getBoundingClientRect();
	return { x: gRect.left - wRect.left, y: gRect.top - wRect.top + wrapper.scrollTop };
}

function renderOverlayItems() {
	const layer = document.getElementById('overlayLayer');
	if (!layer) return;
	const off = getGridOffset();
	if (document.body.classList.contains('preview-mode')) {
		layer.innerHTML = state.overlays.map(ov => {
			if (ov.customDecorationId) {
				const html = renderCustomOverlayImage(ov);
				if (!html) return '';
				return `<div class="overlay-item" data-ov-id="${ov.id}" style="top:${ov.y + off.y}px;left:${ov.x + off.x}px;">${html}</div>`;
			}
			const template = componentTemplates[ov.type];
			if (!template) return '';
			const html = template.render({ id: ov.id }, ov.data || {}, 0, false);
			return `<div class="overlay-item" data-ov-id="${ov.id}" style="top:${ov.y + off.y}px;left:${ov.x + off.x}px;">${html}</div>`;
		}).join('');
		return;
	}
	layer.innerHTML = state.overlays.map(ov => {
		if (ov.customDecorationId) {
			const html = renderCustomOverlayImage(ov);
			if (!html) return '';
			return `<div class="overlay-item is-editable" data-ov-id="${ov.id}"
				style="top:${ov.y + off.y}px;left:${ov.x + off.x}px;">
				<button type="button" class="overlay-remove-btn" data-ov-id="${ov.id}" aria-label="삭제">×</button>
				${html}</div>`;
		}
		const template = componentTemplates[ov.type];
		if (!template) return '';
		const html = template.render({ id: ov.id }, ov.data || {}, 0, false);
		return `<div class="overlay-item is-editable" data-ov-id="${ov.id}"
			style="top:${ov.y + off.y}px;left:${ov.x + off.x}px;">
			<button type="button" class="overlay-remove-btn" data-ov-id="${ov.id}" aria-label="삭제">×</button>
			${html}</div>`;
	}).join('');
	bindOverlayItemEvents();
}

function bindOverlayItemEvents() {
	document.querySelectorAll('.overlay-remove-btn').forEach(btn => {
		btn.addEventListener('click', e => { e.stopPropagation(); removeOverlay(btn.dataset.ovId); });
	});
	document.querySelectorAll('.overlay-item.is-editable').forEach(item => {
		item.addEventListener('mousedown', onOverlayItemMouseDown);
	});
}

function onOverlayItemMouseDown(event) {
	if (event.target.closest('.overlay-remove-btn')) return;
	event.preventDefault();
	const item = event.currentTarget;
	_overlayDrag = state.overlays.find(ov => ov.id === item.dataset.ovId);
	if (!_overlayDrag) return;
	const itemRect = item.getBoundingClientRect();
	_overlayDragOffset = { x: event.clientX - itemRect.left, y: event.clientY - itemRect.top };
	document.addEventListener('mousemove', onOverlayMouseMove);
	document.addEventListener('mouseup', onOverlayMouseUp);
}

function onOverlayMouseMove(event) {
	if (!_overlayDrag) return;
	const grid = document.getElementById('canvasGrid');
	if (!grid) return;
	const gRect = grid.getBoundingClientRect();
	_overlayDrag.x = Math.round(event.clientX - gRect.left - _overlayDragOffset.x);
	_overlayDrag.y = Math.round(event.clientY - gRect.top - _overlayDragOffset.y);
	const off = getGridOffset();
	const item = document.querySelector(`.overlay-item[data-ov-id="${_overlayDrag.id}"]`);
	if (item) { item.style.left = (_overlayDrag.x + off.x) + 'px'; item.style.top = (_overlayDrag.y + off.y) + 'px'; }
}

function onOverlayMouseUp() {
	if (_overlayDrag) updateMarkup();
	_overlayDrag = null;
	document.removeEventListener('mousemove', onOverlayMouseMove);
	document.removeEventListener('mouseup', onOverlayMouseUp);
}

function toggleOverlayEdit() {
	const isNowEdit = document.body.classList.toggle('overlay-edit');
	const toggleBtn = document.getElementById('overlayEditToggle');
	if (toggleBtn) {
		toggleBtn.innerHTML = isNowEdit
			? '<i class="ri-magic-line" aria-hidden="true"></i> 꾸밈 편집 중'
			: '<i class="ri-magic-line" aria-hidden="true"></i> 꾸밈 편집';
	}
	renderOverlayItems();
}

function exitOverlayEdit() {
	if (!document.body.classList.contains('overlay-edit')) return;
	document.body.classList.remove('overlay-edit');
	const toggleBtn = document.getElementById('overlayEditToggle');
	if (toggleBtn) toggleBtn.innerHTML = '<i class="ri-magic-line" aria-hidden="true"></i> 꾸밈 편집';
	renderOverlayItems();
}

function populateOverlayDrawer() {
	const list = document.getElementById('overlayDrawerList');
	if (!list) return;
	const decorations = Object.values(componentTemplates).filter(t =>
		(templateCategories[t.id] || '') === 'decoration'
	);
	if (!decorations.length) {
		list.innerHTML = '<p class="overlay-drawer-empty">등록된 꾸밈 요소가 없습니다.</p>';
		return;
	}
	list.innerHTML = decorations.map(t => `
		<div class="overlay-drawer-item" draggable="true" data-overlay-type="${t.id}"></div>`).join('');

	decorations.forEach(async t => {
		const item = list.querySelector(`[data-overlay-type="${t.id}"]`);
		if (!item) return;
		item.innerHTML = `<img src="${escapeAttr(getDecorationImageUrl(t))}" alt="${escapeAttr(t.name)}">`;
	});

	list.querySelectorAll('.overlay-drawer-item').forEach(item => {
		item.addEventListener('dragstart', event => {
			state.dragPayload = 'overlay-type:' + item.dataset.overlayType;
			event.dataTransfer.effectAllowed = 'copy';
		});
	});
}

function initCompactHeader() {
	const sentinel = document.getElementById('headerSentinel');
	const topbar = document.querySelector('.topbar');
	if (!sentinel || !topbar) return;

	const updateHeaderHeight = () => {
		document.documentElement.style.setProperty('--header-h', topbar.offsetHeight + 'px');
	};
	new ResizeObserver(updateHeaderHeight).observe(topbar);
	updateHeaderHeight();

	new IntersectionObserver(([entry]) => {
		if (document.body.classList.contains('preview-mode')) return;
		const compact = !entry.isIntersecting;
		document.body.classList.toggle('header-compact', compact);
	}, { threshold: 0 }).observe(sentinel);
}

function initOverlayLayer() {
	const layer = document.getElementById('overlayLayer');
	const wrapper = document.getElementById('canvasWrapper');
	if (!layer || !wrapper) return;

	layer.addEventListener('dragover', event => {
		if (!state.dragPayload.startsWith('overlay-type:') && !state.dragPayload.startsWith('overlay-custom:')) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	});

	layer.addEventListener('drop', event => {
		const payload = state.dragPayload;
		if (!payload.startsWith('overlay-type:') && !payload.startsWith('overlay-custom:')) return;
		event.preventDefault();
		const grid = document.getElementById('canvasGrid');
		if (grid) {
			const gRect = grid.getBoundingClientRect();
			if (payload.startsWith('overlay-custom:')) {
				addCustomOverlay(payload.replace('overlay-custom:', ''), event.clientX - gRect.left, event.clientY - gRect.top);
			} else {
				addOverlay(payload.replace('overlay-type:', ''), event.clientX - gRect.left, event.clientY - gRect.top);
			}
		}
		state.dragPayload = '';
	});
}

function copyMarkup() {
	const text = markupOutput.value;
	copyState.textContent = '';
	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(text).then(showCopySuccess).catch(copyFallback);
		return;
	}
	copyFallback();
}

function copyFallback() {
	markupOutput.focus();
	markupOutput.select();
	document.execCommand('copy');
	showCopySuccess();
}

function showCopySuccess() {
	copyState.textContent = '마크업을 클립보드에 복사했습니다.';
	window.setTimeout(() => {
		copyState.textContent = '';
	}, 2200);
}

function openMarkup() {
	document.body.classList.add('markup-open');
	markupToggle.setAttribute('aria-expanded', 'true');
}

function closeMarkup() {
	document.body.classList.remove('markup-open');
	markupToggle.setAttribute('aria-expanded', 'false');
}

function toggleMarkupPanel() {
	document.body.classList.contains('markup-open') ? closeMarkup() : openMarkup();
}

function togglePreview() {
	const isPreview = document.body.classList.toggle('preview-mode');
	previewToggle.setAttribute('aria-pressed', String(isPreview));
	previewToggle.innerHTML = isPreview
		? '<i class="ri-edit-line" aria-hidden="true"></i> 편집하기'
		: '<i class="ri-eye-line" aria-hidden="true"></i> 미리보기';
	const toolbar = document.getElementById('textFormatToolbar');
	if (toolbar) toolbar.hidden = true;
	if (isPreview) {
		exitCompactHeader();
		renderOverlayItems();
	} else {
		renderOverlayItems();
	}
	render();
}

function exitCompactHeader() {
	if (!document.body.classList.contains('header-compact')) return;
	document.body.classList.remove('header-compact');
}

function returnToCanvas() {
	if (!document.body.classList.contains('preview-mode')) return;
	exitOverlayEdit();
	togglePreview();
}

function openMarkupFromPreview() {
	openMarkup();
}

function collectStylesheetText() {
	return Array.from(document.styleSheets).map(sheet => {
		try {
			return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
		} catch (error) {
			return '';
		}
	}).join('\n');
}

function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

async function savePreviewImage() {
	if (!state.blocks.length) return;
	const lib = window.htmlToImage;
	if (!lib) { alert('이미지 저장 라이브러리를 불러오지 못했습니다.'); return; }

	await document.fonts.ready;

	const btn = savePreviewImageButton;
	btn.disabled = true;

	// 캡처 전 오버레이 편집 UI 임시 제거
	const wasOverlayEdit = document.body.classList.contains('overlay-edit');
	if (wasOverlayEdit) document.body.classList.remove('overlay-edit');
	renderOverlayItems();

	const captureTarget = document.getElementById('canvasWrapper');
	const canvasGridEl = document.getElementById('canvasGrid');
	if (!captureTarget || !canvasGridEl) {
		alert('이미지 저장 대상 요소를 찾을 수 없습니다.');
		btn.disabled = false;
		return;
	}

	document.body.classList.add('preview-export');

	// canvasGrid 실제 크기 측정 (preview-export CSS 적용 후)
	const gridWidth = canvasGridEl.offsetWidth;
	const gridHeight = canvasGridEl.scrollHeight;

	// canvasWrapper를 canvasGrid와 동일한 크기로 강제 (캡처 영역 = 콘텐츠만)
	const orig = {
		wOverflow: captureTarget.style.overflow,
		wHeight:   captureTarget.style.height,
		wMaxHeight: captureTarget.style.maxHeight,
		wWidth:    captureTarget.style.width,
		wMaxWidth: captureTarget.style.maxWidth,
		wScrollTop: captureTarget.scrollTop,
		wScrollLeft: captureTarget.scrollLeft,
		gMargin:   canvasGridEl.style.margin,
	};
	captureTarget.style.overflow  = 'visible';
	captureTarget.style.height    = `${gridHeight}px`;
	captureTarget.style.maxHeight = 'none';
	captureTarget.style.width     = `${gridWidth}px`;
	captureTarget.style.maxWidth  = `${gridWidth}px`;
	captureTarget.scrollTop  = 0;
	captureTarget.scrollLeft = 0;
	canvasGridEl.style.margin = '0';

	// 가이드 숨김
	const guide = captureTarget.querySelector('.canvas-guide');
	if (guide) guide.hidden = true;

	// 오버레이 이미지를 data URL로 인라인 (html-to-image 캡처 누락 방지)
	const exportImgs = [...captureTarget.querySelectorAll('img')];
	const imgOrigSrcs = exportImgs.map(img => img.getAttribute('src'));
	await Promise.all(exportImgs.map(async (img) => {
		try {
			const resp = await fetch(img.src);
			const blob = await resp.blob();
			const dataUrl = await new Promise(resolve => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result);
				reader.onerror = () => resolve(null);
				reader.readAsDataURL(blob);
			});
			if (dataUrl) img.src = dataUrl;
		} catch (e) {}
	}));

	try {
		const targetWidth = 1241;
		const pixelRatio = targetWidth / Math.max(1, gridWidth);
		const dataUrl = await lib.toPng(captureTarget, {
			backgroundColor: '#ffffff',
			width: gridWidth,
			height: gridHeight,
			pixelRatio
		});
		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = `grid-builder-${Date.now()}.png`;
		link.click();
	} catch (e) {
		console.error(e);
		alert('이미지 저장에 실패했습니다.');
	} finally {
		// 이미지 src 복원
		exportImgs.forEach((img, i) => { if (imgOrigSrcs[i]) img.src = imgOrigSrcs[i]; });
		if (guide) guide.hidden = false;
		captureTarget.style.overflow  = orig.wOverflow;
		captureTarget.style.height    = orig.wHeight;
		captureTarget.style.maxHeight = orig.wMaxHeight;
		captureTarget.style.width     = orig.wWidth;
		captureTarget.style.maxWidth  = orig.wMaxWidth;
		captureTarget.scrollTop  = orig.wScrollTop;
		captureTarget.scrollLeft = orig.wScrollLeft;
		canvasGridEl.style.margin = orig.gMargin;
		document.body.classList.remove('preview-export');
		btn.disabled = false;
		if (wasOverlayEdit) {
			document.body.classList.add('overlay-edit');
			renderOverlayItems();
		}
	}
}

function showTemplateLoadError(error) {
	componentList.innerHTML = `<p class="template-error">${escapeHtml(error.message)}</p>`;
	canvasGrid.innerHTML = '<div class="canvas-empty">템플릿을 불러오지 못했습니다</div>';
}

// ── 리스트 편집 버튼 ─────────────────────────────────────
let _listEditButtons = null;
let _listEditTarget = null;
let _listEditHideTimer = null;

function createListEditButtons() {
	const el = document.createElement('div');
	el.id = 'listEditButtons';
	el.className = 'list-edit-buttons';
	el.hidden = true;
	el.innerHTML = `
		<button type="button" class="list-edit-btn list-add-btn" title="항목 추가 (아래)">
			<i class="ri-add-line" aria-hidden="true"></i>
		</button>
		<button type="button" class="list-edit-btn list-del-btn" title="항목 삭제">
			<i class="ri-delete-bin-line" aria-hidden="true"></i>
		</button>
	`;
	document.body.appendChild(el);

	el.addEventListener('mouseenter', () => clearTimeout(_listEditHideTimer));
	el.addEventListener('mouseleave', () => {
		_listEditHideTimer = setTimeout(() => { el.hidden = true; }, 120);
	});
	el.querySelector('.list-add-btn').addEventListener('click', () => {
		if (!_listEditTarget) return;
		addListItem(_listEditTarget.blockId, _listEditTarget.columnIndex, _listEditTarget.fieldKey);
		el.hidden = true;
	});
	el.querySelector('.list-del-btn').addEventListener('click', () => {
		if (!_listEditTarget) return;
		deleteListItem(_listEditTarget.blockId, _listEditTarget.columnIndex, _listEditTarget.fieldKey);
		el.hidden = true;
	});
	return el;
}

function positionListEditButtons(li) {
	_listEditButtons.hidden = false;
	const rect = li.getBoundingClientRect();
	const bh = _listEditButtons.offsetHeight;
	const bw = _listEditButtons.offsetWidth;
	let left = rect.right + 6;
	let top = rect.top + rect.height / 2 - bh / 2;
	left = Math.min(left, window.innerWidth - bw - 4);
	top = Math.max(4, Math.min(top, window.innerHeight - bh - 4));
	_listEditButtons.style.left = `${left}px`;
	_listEditButtons.style.top = `${top}px`;

	const block = state.blocks.find(b => b.id === li.dataset.blockId);
	const columnIndex = Number(li.dataset.columnIndex);
	const itemCount = block ? getEditListItems(block.items[columnIndex] || {}).length : 0;
	_listEditButtons.querySelector('.list-del-btn').disabled = itemCount <= 1;
}

function bindEditListEvents() {
	document.querySelectorAll('.edit-list li[data-block-id]').forEach(li => {
		li.addEventListener('mouseenter', () => {
			if (document.body.classList.contains('preview-mode')) return;
			clearTimeout(_listEditHideTimer);
			_listEditTarget = {
				blockId: li.dataset.blockId,
				columnIndex: Number(li.dataset.columnIndex),
				fieldKey: li.dataset.editField
			};
			positionListEditButtons(li);
		});
		li.addEventListener('mouseleave', () => {
			_listEditHideTimer = setTimeout(() => {
				if (!_listEditButtons.matches(':hover')) _listEditButtons.hidden = true;
			}, 120);
		});
	});
}

// ── 인라인 텍스트 포맷 툴바 ───────────────────────────────
let _savedRange = null;
let _savedEditTarget = null;
let _colorPickerOpen = false;
let _toolbarPinned = false; // 닫기버튼 클릭 전까지 툴바 고정

function createFormatToolbar() {
	const el = document.createElement('div');
	el.id = 'textFormatToolbar';
	el.className = 'text-format-toolbar';
	el.hidden = true;
	el.innerHTML = `
		<button type="button" class="fmt-btn" data-cmd="bold" title="굵게"><b>B</b></button>
		<button type="button" class="fmt-btn" data-cmd="underline" title="밑줄"><u>U</u></button>
		<label class="fmt-color" title="글자색"><input type="color" value="#000000"></label>
		<span class="fmt-divider" aria-hidden="true"></span>
		<button type="button" class="fmt-btn fmt-close" title="닫기" aria-label="닫기"><i class="ri-close-line" aria-hidden="true"></i></button>
	`;
	document.body.appendChild(el);

	const colorInput = el.querySelector('input[type="color"]');

	el.addEventListener('mousedown', e => {
		if (e.target !== colorInput) e.preventDefault();
		saveFormatRange();
	});

	el.querySelectorAll('[data-cmd]').forEach(btn => {
		btn.addEventListener('click', () => {
			restoreFormatRange();
			document.execCommand(btn.dataset.cmd);
			updateFormatState(el);
		});
	});

	el.querySelector('.fmt-close').addEventListener('click', () => {
		_toolbarPinned = false;
		el.hidden = true;
	});

	colorInput.addEventListener('mousedown', () => {
		_colorPickerOpen = true;
		saveFormatRange();
	});

	colorInput.addEventListener('input', () => {
		restoreFormatRange();
		document.execCommand('foreColor', false, colorInput.value);
		saveFormatRange(); // execCommand 이후 DOM이 바뀌므로 range 갱신
	});

	colorInput.addEventListener('change', () => {
		_colorPickerOpen = false;
		_toolbarPinned = true; // 색상 조정 후 툴바 고정 (닫기버튼으로만 해제)
		if (_savedEditTarget && _savedRange) {
			const wasEditable = _savedEditTarget.getAttribute('contenteditable') === 'true';
			if (!wasEditable) _savedEditTarget.setAttribute('contenteditable', 'true');
			restoreFormatRange();
			document.execCommand('foreColor', false, colorInput.value);
			if (!wasEditable) {
				const html = _savedEditTarget.innerHTML;
				const block = state.blocks.find(b => b.id === _savedEditTarget.dataset.blockId);
				const columnIndex = Number(_savedEditTarget.dataset.columnIndex);
				if (block && block.items[columnIndex]) {
					block.items[columnIndex][_savedEditTarget.dataset.editField] = html;
				}
				_savedEditTarget.removeAttribute('contenteditable');
				_savedRange = null;
				_savedEditTarget = null;
				el.hidden = true;
				_toolbarPinned = false;
				render();
			} else {
				saveFormatRange(); // wasEditable: range 갱신으로 재조작 가능하게
			}
		}
	});

	return el;
}

function saveFormatRange() {
	const sel = window.getSelection();
	if (sel?.rangeCount > 0) {
		_savedRange = sel.getRangeAt(0).cloneRange();
		_savedEditTarget = sel.anchorNode?.parentElement?.closest('[contenteditable="true"]') || null;
	} else {
		_savedRange = null;
		_savedEditTarget = null;
	}
}

function restoreFormatRange() {
	if (!_savedRange) return;
	if (_savedEditTarget) _savedEditTarget.focus();
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(_savedRange);
}

function positionFormatToolbar(toolbar, rect) {
	toolbar.hidden = false;
	const tw = toolbar.offsetWidth;
	const th = toolbar.offsetHeight;
	let left = rect.left + rect.width / 2 - tw / 2;
	let top = rect.top - th - 8;
	if (top < 4) top = rect.bottom + 8;
	left = Math.max(4, Math.min(left, window.innerWidth - tw - 4));
	top = Math.max(4, Math.min(top, window.innerHeight - th - 4));
	toolbar.style.left = `${left}px`;
	toolbar.style.top = `${top}px`;
}

function updateFormatState(toolbar) {
	toolbar.querySelector('[data-cmd="bold"]').classList.toggle('is-active', document.queryCommandState('bold'));
	toolbar.querySelector('[data-cmd="underline"]').classList.toggle('is-active', document.queryCommandState('underline'));
}

function initFormatToolbar() {
	const toolbar = createFormatToolbar();

	document.addEventListener('selectionchange', () => {
		if (document.body.classList.contains('preview-mode')) return;
		const sel = window.getSelection();
		if (!sel || sel.isCollapsed || !sel.toString().trim()) {
			setTimeout(() => {
				if (!toolbar.matches(':hover') && !_colorPickerOpen && !_toolbarPinned) toolbar.hidden = true;
			}, 120);
			return;
		}
		const anchor = sel.anchorNode?.parentElement?.closest('[contenteditable="true"]');
		if (!anchor) {
			if (!_colorPickerOpen && !_toolbarPinned) toolbar.hidden = true;
			return;
		}
		_toolbarPinned = false; // 새로운 텍스트 선택 시 핀 해제
		saveFormatRange();
		positionFormatToolbar(toolbar, sel.getRangeAt(0).getBoundingClientRect());
		updateFormatState(toolbar);
	});
}

async function init() {
	relocateDecoStudioDrawer();
	loadCustomDecorations();
	componentList.classList.add('is-empty-state');
	try {
		await Promise.all([loadTemplates(), loadIconCategories()]);
		renderComponentList();
		if (state.sidebarTab === 'custom') renderCustomPanel();
		render();
	} catch (error) {
		console.error(error);
		showTemplateLoadError(error);
	}

	document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
	document.getElementById('copyMarkup').addEventListener('click', copyMarkup);
	document.getElementById('newsletterDownloadBtn')?.addEventListener('click', exportNewsletterDownload);
	document.getElementById('newsletterDocDownloadBtn')?.addEventListener('click', exportNewsletterDoc);
	bindFilterEvents();
	KlicBuilderShared.bindSidebarTabs(tab => {
		state.sidebarTab = tab;
		if (tab === 'custom') renderCustomPanel();
		renderRecommendationPanel();
	});
	previewToggle.addEventListener('click', togglePreview);
	previewReturn.addEventListener('click', returnToCanvas);
	savePreviewImageButton.addEventListener('click', savePreviewImage);
	previewMarkupOpenButton.addEventListener('click', openMarkupFromPreview);
	markupToggle.addEventListener('click', toggleMarkupPanel);
	document.getElementById('decoStudioOpen')?.addEventListener('click', openDecoStudio);
	document.getElementById('decoStudioClose')?.addEventListener('click', closeDecoStudio);
	initBlockPropsPanel();
	initNlInlineToolbar();
	initSmartInlinePopup();
	document.getElementById('recommendPanelOpen')?.addEventListener('click', openRecommendationPanel);
	updateRecommendFab();
	window.addEventListener('resize', () => {
		positionRecommendationPanel(document.getElementById('recommendPanel'));
		syncCanvasGuideSize();
	});
	document.getElementById('overlayEditToggle')?.addEventListener('click', toggleOverlayEdit);
	document.getElementById('overlayEditDone')?.addEventListener('click', exitOverlayEdit);
	initOverlayLayer();
	initCompactHeader();
	document.getElementById('markupClose').addEventListener('click', closeMarkup);
	document.getElementById('markupBackdrop').addEventListener('click', closeMarkup);
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape') { closeMarkup(); closeTableCellSpanPopover(); closeTableContextMenu(false); }
		if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
			const active = document.activeElement;
			if (active?.getAttribute('contenteditable') === 'true') return;
			if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return;
			e.preventDefault();
			undo();
		}
		if (e.key === 'Delete' || e.key === 'Backspace') {
			const active = document.activeElement;
			if (active?.getAttribute('contenteditable') === 'true') return;
			if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return;
			const selectedBlockId = state.selectedItem?.blockId;
			if (!selectedBlockId) return;
			// ::list::N 또는 ::inner::N 같은 내부 참조면 삭제 무시
			if (selectedBlockId.includes('::')) return;
			e.preventDefault();
			removeBlock(selectedBlockId);
		}
	});
	canvasGrid.addEventListener('click', event => {
		const anchor = event.target.closest('a');
		if (!anchor) return;
		// 새창링크(target="_blank")와 다운링크(download 속성)만 캔버스에서 차단
		if (anchor.getAttribute('target') === '_blank' || anchor.hasAttribute('download')) {
			event.preventDefault();
		}
	}, true);
	canvasGrid.addEventListener('dblclick', event => {
		if (event.target.closest('a')) event.preventDefault();
	}, true);
	canvasGrid.addEventListener('dragleave', event => {
		if (!canvasGrid.contains(event.relatedTarget)) canvasGrid.classList.remove('is-over');
	});
	const canvasWrapper = document.getElementById('canvasWrapper');
	KlicBuilderShared.bindCanvasDropTargets({ canvasGrid, canvasWrapper, onDragOver: handleCanvasDragOver, onDrop: handleCanvasDrop });
	_listEditButtons = createListEditButtons();
	initThemeSwitcher();
	initGuidedTour();
	initPropsHelp();
	document.getElementById('iconDrawerClose').addEventListener('click', closeIconDrawer);
	document.getElementById('iconDrawerBackdrop').addEventListener('click', closeIconDrawer);
	canvasGrid.style.maxWidth = '1241px';
	document.body.dataset.canvasSize = '1241';
	document.body.dataset.previewDevice = 'pc';
	updateDecoStudioAvailability();
	document.getElementById('deviceSwitcher').addEventListener('click', e => {
		const btn = e.target.closest('[data-device]');
		if (btn) setPreviewDevice(btn.dataset.device);
	});

	render();
}

// ── 속성 패널 도움말 ─────────────────────────────────────────
function initPropsHelp() {
	const btn   = document.getElementById('blockPropsHelp');
	const panel = document.getElementById('blockPropsPanel');
	if (!btn || !panel) return;

	btn.addEventListener('click', () => {
		const active = panel.classList.toggle('props-help-active');
		btn.classList.toggle('is-active', active);
		btn.setAttribute('aria-pressed', active ? 'true' : 'false');
	});

	// 패널이 닫힐 때 도움말 상태도 초기화
	document.getElementById('blockPropsClose')?.addEventListener('click', () => {
		panel.classList.remove('props-help-active');
		btn.classList.remove('is-active');
		btn.setAttribute('aria-pressed', 'false');
	});
}

// ── 안내 투어 ─────────────────────────────────────────────
const TOUR_STEPS = [
	{
		target: '.sidebar',
		title: '① 디자인 블록 선택',
		desc: '상단 필터로 원하는 유형을 고른 뒤, 블록 카드를 오른쪽 캔버스로 드래그하세요. 타이틀·텍스트·박스·버튼 등 다양한 블록이 준비되어 있습니다.',
		position: 'right'
	},
	{
		target: '.workspace',
		title: '② 캔버스에 배치',
		desc: '이 영역으로 블록을 드래그하면 콘텐츠가 쌓입니다. 배치된 블록은 다시 드래그해 순서를 바꿀 수 있어요.',
		position: 'left'
	},
	{
		target: '.builder-block',
		title: '③ 블록 편집 컨트롤',
		desc: '블록에 마우스를 올리면 오른쪽 상단에 3가지 버튼이 나타납니다.<ul class="tour-ctrl-list"><li><i class="ri-settings-3-line"></i> <b>속성</b> — 해당 블록의 속성을 편집합니다.</li><li><i class="ri-file-copy-line"></i> <b>복사</b> — 블록을 복제해 바로 아래에 추가합니다</li><li><i class="ri-close-line"></i> <b>삭제</b> — 블록을 캔버스에서 제거합니다</li></ul>',
		position: 'bottom'
	},
	{
		target: '#themeSwitcher',
		title: '④ 테마 색상 선택',
		desc: '6가지 테마 중 하나를 선택하면 전체 색상이 한 번에 바뀝니다. 기관 브랜드에 맞는 색상을 골라보세요.',
		position: 'bottom'
	}
];

function initGuidedTour() {
	const btn = document.getElementById('helpModeToggle');
	if (!btn) return;

	let prevSpotlight = null;

	const overlay = document.createElement('div');
	overlay.className = 'tour-overlay';
	overlay.hidden = true;
	document.body.appendChild(overlay);

	const callout = document.createElement('div');
	callout.className = 'tour-callout';
	callout.hidden = true;
	document.body.appendChild(callout);

	function clearSpotlight() {
		if (prevSpotlight) {
			prevSpotlight.classList.remove('tour-spotlight');
			prevSpotlight = null;
		}
	}

	function positionCallout(targetEl, position) {
		const rect = targetEl.getBoundingClientRect();
		const cw = 290;
		const gap = 18;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		let top, left, arrow;

		if (position === 'right') {
			top = rect.top + rect.height / 2 - 90;
			left = rect.right + gap;
			arrow = 'left';
		} else if (position === 'left') {
			top = rect.top + rect.height / 2 - 90;
			left = rect.left - cw - gap;
			arrow = 'right';
		} else if (position === 'bottom') {
			top = rect.bottom + gap;
			left = rect.left + rect.width / 2 - cw / 2;
			arrow = 'top';
		} else {
			top = rect.top - 170;
			left = rect.left + rect.width / 2 - cw / 2;
			arrow = 'bottom';
		}

		left = Math.max(12, Math.min(left, vw - cw - 12));
		top  = Math.max(12, Math.min(top,  vh - 200));

		callout.style.top  = top  + 'px';
		callout.style.left = left + 'px';
		callout.dataset.arrow = arrow;
	}

	function showStep(index) {
		const step = TOUR_STEPS[index];

		// step 2 (캔버스에 배치) 진입 시 캔버스가 비어있으면 타이틀 블록 추가
		if (index === 1 && state.blocks.length === 0) {
			const block = createBlock('title-01');
			state.blocks.push(block);
			render();
		}

		const targetEl = document.querySelector(step.target);

		clearSpotlight();
		if (targetEl) {
			targetEl.classList.add('tour-spotlight');
			prevSpotlight = targetEl;
		}

		const isFirst = index === 0;
		const isLast  = index === TOUR_STEPS.length - 1;

		callout.innerHTML = `
			<div class="tour-callout-step">STEP ${index + 1} / ${TOUR_STEPS.length}</div>
			<strong class="tour-callout-title">${step.title}</strong>
			<p class="tour-callout-desc">${step.desc}</p>
			<div class="tour-callout-actions">
				<button type="button" class="tour-skip">건너뛰기</button>
				<div class="tour-nav">
					${!isFirst ? '<button type="button" class="tour-prev">← 이전</button>' : ''}
					<button type="button" class="tour-next${isLast ? ' is-last' : ''}">${isLast ? '완료 ✓' : '다음 →'}</button>
				</div>
			</div>`;
		callout.hidden = false;

		if (targetEl) positionCallout(targetEl, step.position);

		callout.querySelector('.tour-skip').addEventListener('click', endTour);
		callout.querySelector('.tour-prev')?.addEventListener('click', () => showStep(index - 1));
		callout.querySelector('.tour-next').addEventListener('click', () => isLast ? endTour() : showStep(index + 1));
	}

	function startTour() {
		document.body.classList.add('tour-active');
		overlay.hidden = false;
		btn.classList.add('is-active');
		btn.setAttribute('aria-pressed', 'true');
		showStep(0);
	}

	function endTour() {
		document.body.classList.remove('tour-active');
		overlay.hidden = true;
		callout.hidden = true;
		clearSpotlight();
		btn.classList.remove('is-active');
		btn.setAttribute('aria-pressed', 'false');
	}

	btn.addEventListener('click', () => {
		if (document.body.classList.contains('tour-active')) endTour();
		else startTour();
	});
}

// ── 테마 선택기 ───────────────────────────────────────────
function initThemeSwitcher() {
	const saved = localStorage.getItem('klicBuilderTheme') || 'purple';
	applyTheme(saved);

	document.getElementById('themeSwitcher')?.addEventListener('click', e => {
		const btn = e.target.closest('.theme-swatch');
		if (!btn) return;
		applyTheme(btn.dataset.theme);
		localStorage.setItem('klicBuilderTheme', btn.dataset.theme);
	});
}

function applyTheme(theme) {
	document.body.dataset.theme = theme;
	document.querySelectorAll('.theme-swatch').forEach(btn => {
		btn.classList.toggle('is-active', btn.dataset.theme === theme);
		btn.setAttribute('aria-pressed', btn.dataset.theme === theme ? 'true' : 'false');
	});
}

window.addEventListener('DOMContentLoaded', init);
