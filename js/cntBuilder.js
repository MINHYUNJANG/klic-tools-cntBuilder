const TEMPLATE_DIR = '/templates/';
const DESIGN_BLOCK_MANIFEST = '/templates/design_block/manifest.json';
const DECORATION_MANIFEST = '/templates/common/decoration/manifest.json';
const TEMPLATE_FILE_PATTERN = /\.(html|js)$/i;
const TEMPLATE_IMAGE_PATTERN = /\.(png|jpe?g|webp|gif|svg)$/i;
const loadedTemplateStyles = new Map();

const ICON_MANIFEST = '/templates/common/icon/manifest.json';
const CUSTOM_DECORATION_STORAGE_KEY = 'gridbuilder:custom-decorations:v1';
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
	overlays: [],
	customDecorations: [],
	undoStack: [],
	canvasWidth: '1200',
	previewDevice: 'pc'
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

// 혼합 블록 내부 참조 해석 (복합 ID: "outerBlockId::inner::idx")
function resolveMixInnerRef(blockId) {
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

function findItemByBlockId(blockId, columnIndex) {
	const mixRef = resolveMixInnerRef(blockId);
	if (mixRef) return mixRef.innerBlock.items[columnIndex] ?? null;
	const listRef = resolveListInnerRef(blockId);
	if (listRef) return listRef.listBlock.items[columnIndex] ?? null;
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
	const block = {
		id: `block-${state.nextBlockId++}`,
		type,
		columns: 1,
		columnMode: '1',
		marginBottom: 10,
		blockWidth: template.element.firstElementChild?.tagName.toLowerCase() === 'a' ? 'auto' : '',
		blockAlign: '',
		items: [{ ...cloneData(defaultData), style: createStyleForType(type) }]
	};
	// 혼합 블록: 내부 블록 배열 초기화
	if (templateCategories[type] === 'mix') {
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
	const prefix = block.id.replace(/-/g, '_') + '_';
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
	const prefix = block.id.replace(/-/g, '_');
	return `${prefix}_rX${_rowSeq++}`;
}

function addListRowToBlock(blockId) {
	const block = state.blocks.find(b => b.id === blockId);
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
	const block = state.blocks.find(b => b.id === blockId);
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
	const block = state.blocks.find(b => b.id === blockId);
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
	const block = state.blocks.find(b => b.id === blockId);
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

let _propsBlockId = null;

function openBlockProps(blockId) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	_propsBlockId = blockId;

	const panel = document.getElementById('blockPropsPanel');
	const titleEl = document.getElementById('blockPropsTitle');
	const widthSel = document.getElementById('propBlockWidth');
	const marginInput = document.getElementById('propMarginBottom');

	if (titleEl) titleEl.textContent = block.type || '블록';
	if (widthSel) widthSel.value = block.blockWidth || '';
	if (marginInput) marginInput.value = block.marginBottom ?? 10;
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

	panel.classList.add('is-open');
}

function closeBlockProps() {
	_propsBlockId = null;
	const panel = document.getElementById('blockPropsPanel');
	panel.classList.remove('is-open');
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

	document.getElementById('propMarginBottom')?.addEventListener('change', function () {
		if (!_propsBlockId) return;
		const block = state.blocks.find(b => b.id === _propsBlockId);
		if (!block) return;
		pushHistory();
		block.marginBottom = Number(this.value) || 0;
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

	// canvasGrid 변경 감지 → 패널 행 관리 자동 갱신
	// render()가 canvasGrid.innerHTML을 교체할 때마다 MutationObserver가 마이크로태스크로 실행되어
	// 모든 render 사이클이 끝난 뒤 안정적으로 패널을 업데이트함
	const canvasGridEl = document.getElementById('canvasGrid');
	if (canvasGridEl) {
		const panelObserver = new MutationObserver(() => {
			if (!_propsBlockId) return;
			const b = state.blocks.find(b => b.id === _propsBlockId);
			if (!b || templateCategories[b.type] !== 'list') return;
			const listSection = document.getElementById('propsListSection');
			if (!listSection || listSection.style.display === 'none') return;
			renderPropsListRows(b);
		});
		panelObserver.observe(canvasGridEl, { childList: true });
	}
}

// 혼합 블록에 허용되는 카테고리 (모듈 스코프)
const MIX_ALLOWED = new Set(['box', 'list', 'title-horizontal', 'title-vertical', 'divider', 'text']);

// 혼합 블록에 내부 블록 추가
function addMixInnerBlock(blockId, innerType) {
	const block = state.blocks.find(b => b.id === blockId);
	if (!block) return;
	const innerTemplate = componentTemplates[innerType];
	if (!innerTemplate) return;
	pushHistory();
	const innerData = innerTemplate.getDefaultData ? innerTemplate.getDefaultData() : {};
	if (!Array.isArray(block.innerBlocks)) block.innerBlocks = [];
	block.innerBlocks.push({
		type: innerType,
		marginBottom: 10,
		items: [{ ...cloneData(innerData), style: createStyleForType(innerType) }]
	});
	render();
	selectBlock(blockId);
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
	mixBlock.innerBlocks.push({
		type: sourceBlock.type,
		marginBottom: sourceBlock.marginBottom ?? 10,
		items: cloneData(sourceBlock.items || [])
	});
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
	while (block.items.length < block.columns) {
		const newItem = { ...cloneData(source), style: createStyleForType(block.type) };
		if (hasTitleListWrap) newItem.listBlock = null;
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
	const hasBlocks = state.blocks.length > 0;
	const hasOverlays = state.overlays.length > 0;
	layoutStatus.textContent = hasOverlays
		? `${state.blocks.length}개 블록 · ${state.overlays.length}개 꾸밈요소`
		: `${state.blocks.length}개 블록`;
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
	});
	const { hasBlocks, hasOverlays } = syncCanvasPresence();
	canvasGrid.className = hasBlocks ? 'canvas-grid' : 'canvas-grid is-empty';
	canvasGrid.innerHTML = hasBlocks
		? state.blocks.map((block, idx) => renderBuilderBlock(block, idx, state.blocks.length)).join('')
		: hasOverlays
			? ''
		: '<div class="canvas-empty">왼쪽 디자인 블록을 여기로 드래그하세요</div>';
	bindRenderedEvents();
	applyAllTemplateStyles();
	syncCanvasGuideSize();
	updateMarkup();
	renderRecommendationPanel();
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
		if (block) {
			const widthSel = document.getElementById('propBlockWidth');
			const marginInput = document.getElementById('propMarginBottom');
			if (widthSel) widthSel.value = block.blockWidth || '';
			if (marginInput) marginInput.value = block.marginBottom ?? 30;
			document.querySelectorAll('#propBlockAlign .props-align-btn').forEach(btn => {
				btn.classList.toggle('is-active', btn.dataset.align === (block.blockAlign || ''));
			});
		} else {
			closeBlockProps();
		}
	}
}

function renderBuilderBlock(block, idx = 0, total = 1) {
	const template = componentTemplates[block.type];
	const effectiveMargin = (total <= 1 || idx === total - 1) ? 0 : (block.marginBottom ?? 10);
	return `
		<section class="builder-block" draggable="true" data-block-id="${block.id}" style="margin-bottom:${effectiveMargin}px${block.blockWidth ? `;width:${block.blockWidth}` : ''}">
			<div class="block-controls" aria-hidden="true">
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

	if (templateCategories[block.type] === 'list' && block.items[0]?.rows) {
		const item = block.items[0];
		const el = renderListDynamically(block, item, 0, template.element, true);
		el.setAttribute('style', columnStyleVars(item));
		el.classList.add('block-item');
		el.dataset.blockId = block.id;
		el.dataset.columnIndex = '0';
		const listFirstChild = el.firstElementChild;
		if (listFirstChild) {
			listFirstChild.classList.remove('al', 'ac', 'ar');
			if (block.blockAlign) listFirstChild.classList.add(block.blockAlign);
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
			return elementToHtml(el);
		}).join('');
	}

	return buildColumnBlock(template, block, true);
}

function buildColumnBlock(template, block, editable) {
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
		firstChild.classList.remove('al', 'ac', 'ar');
		if (block.blockAlign) firstChild.classList.add(block.blockAlign);
	}

	const addRowWrapEl = outer.querySelector('.add-row-wrap');
	if (addRowWrapEl) {
		outer.querySelectorAll('[data-edit-field]').forEach(field => {
			if (addRowWrapEl.contains(field)) return;
			const fieldName = field.dataset.editField;
			setFieldContent(field, (block.items[0] || {})[fieldName] || '');
			if (editable) {
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
				if (editable) {
					field.dataset.blockId = block.id;
					field.dataset.columnIndex = String(idx);
				} else {
					field.removeAttribute('data-edit-field');
				}
			});
			if (!editable) stripEditorAttributes(el);
			return elementToHtml(el);
		}).join('');
	} else {
		outer.querySelectorAll('[data-edit-field]').forEach(field => {
			const fieldName = field.dataset.editField;
			setFieldContent(field, (block.items[0] || {})[fieldName] || '');
			if (editable) {
				field.dataset.blockId = block.id;
				field.dataset.columnIndex = '0';
			} else {
				field.removeAttribute('data-edit-field');
			}
		});
	}

	// 혼합 블록: .mix-inner-slot 처리 (복수 내부 블록 지원)
	if (block && templateCategories[block.type] === 'mix') {
		const slotEl = outer.querySelector('.mix-inner-slot');
		if (slotEl) {
			const innerBlocks = block.innerBlocks || [];
			if (innerBlocks.length > 0) {
				slotEl.innerHTML = innerBlocks.map((ib, idx) => {
					const innerTemplate = componentTemplates[ib.type];
					if (!innerTemplate) return '';
					if (editable) {
						// 복합 ID로 editable 렌더링 → 텍스트 편집·색상 옵션 활성화
						const innerBlockId = `${block.id}::inner::${idx}`;
						const fakeBlock = { id: innerBlockId, type: ib.type, columns: ib.items.length || 1, items: ib.items };
						const innerHtml = buildColumnBlock(innerTemplate, fakeBlock, true);
						const mbStyle = ib.marginBottom != null ? ` style="margin-bottom:${ib.marginBottom}px"` : '';
						return `<div class="mix-inner-item" draggable="true" data-mix-block-id="${block.id}" data-mix-inner-idx="${idx}"${mbStyle}>
							<div class="mix-inner-drag-handle" title="드래그해서 순서 변경"><i class="ri-draggable"></i></div>
							<button type="button" class="mix-inner-remove" data-mix-block-id="${block.id}" data-mix-inner-idx="${idx}" aria-label="내부 블록 제거"><i class="ri-close-line"></i></button>
							${innerHtml}
						</div>`;
					} else {
						const fakeBlock = { id: `${block.id}-inner-${idx}`, type: ib.type, columns: ib.items.length || 1, items: ib.items };
						const innerEl = buildColumnBlock(innerTemplate, fakeBlock, false);
						const mbStyle = ib.marginBottom != null ? ` style="margin-bottom:${ib.marginBottom}px"` : '';
						return `<div class="mix-inner-item"${mbStyle}>${elementToHtml(innerEl)}</div>`;
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

	if (!editable) stripEditorAttributes(outer);
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
			if (['box', 'list', 'title-horizontal', 'title-vertical', 'divider', 'text'].includes(dragCat)) {
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
			// 편집 모드에서 <a> 태그 기본 네비게이션 방지
			if (event.target.closest('a')) event.preventDefault();
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
	// 혼합 블록 내부 아이템 드래그 재정렬
	let _mixDragFrom = null;

	document.querySelectorAll('.mix-inner-item[draggable]').forEach(item => {
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
}

function setBlockDropIndicator(block, event) {
	const position = 'after';
	clearDropIndicators(block);
	block.dataset.dropPosition = position;
	block.classList.add('is-over', `is-over-${position}`);
}

function clearBlockDropIndicator(block) {
	block.classList.remove('is-over', 'is-over-before', 'is-over-after');
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


function renderCanvasPanelUI() {
	const isDevicePreview = state.previewDevice !== 'pc';
	const canvasSizeControl = document.getElementById('canvasSizeControl');
	if (!canvasSizeControl) return;
	const sizes = ['1000', '1200', '1400'];
	canvasSizeControl.innerHTML = `
		<div class="canvas-size-select${isDevicePreview ? ' is-disabled' : ''}" data-canvas-size-menu>
			<button type="button" class="canvas-size-trigger" data-canvas-size-trigger${isDevicePreview ? ' disabled' : ''}>
				<i class="ri-ruler-line" aria-hidden="true"></i>
				<span>캔버스 크기설정</span>
				<strong>${state.canvasWidth}px</strong>
				<i class="ri-arrow-down-s-line" aria-hidden="true"></i>
			</button>
			<div class="canvas-size-options" role="listbox" aria-label="캔버스 크기">
				${sizes.map(s => `
					<button type="button" class="canvas-size-option${state.canvasWidth === s ? ' is-active' : ''}" data-canvas-size-value="${s}" role="option" aria-selected="${state.canvasWidth === s}">
						<span>${s}px</span>
						<i class="ri-check-line" aria-hidden="true"></i>
					</button>`).join('')}
			</div>
			<p class="canvas-size-disabled-tip">태블릿·모바일 모드에서는 설정할 수 없습니다.</p>
		</div>`;
	if (!isDevicePreview) {
		const menu = canvasSizeControl.querySelector('[data-canvas-size-menu]');
		canvasSizeControl.querySelector('[data-canvas-size-trigger]')?.addEventListener('click', event => {
			event.stopPropagation();
			menu.classList.toggle('is-open');
		});
		canvasSizeControl.querySelectorAll('[data-canvas-size-value]').forEach(button => {
			button.addEventListener('click', event => {
				event.stopPropagation();
				menu.classList.remove('is-open');
				updateCanvasWidth(button.dataset.canvasSizeValue);
				renderCanvasPanelUI();
			});
		});
	}
}

function updateCanvasWidth(value) {
	state.canvasWidth = value;
	document.body.dataset.canvasSize = value;
	if (state.previewDevice === 'pc') {
		canvasGrid.style.maxWidth = `${value}px`;
	}
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
		canvasGrid.style.maxWidth = `${state.canvasWidth}px`;
	}
	renderCanvasPanelUI();
	updateDecoStudioAvailability();
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
	// 혼합 내부 블록 / title-list list-wrap 참조 여부 확인
	const mixRef = resolveMixInnerRef(field.dataset.blockId);
	const listRef = !mixRef ? resolveListInnerRef(field.dataset.blockId) : null;
	const targetItems = mixRef ? mixRef.innerBlock.items
		: listRef ? listRef.listBlock.items
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

	if (!state.overlays.length) {
		const styleBlock = cssRules.length ? `<style>\n${cssRules.join('\n\n')}\n</style>` : '';
		return styleBlock ? `${styleBlock}\n\n${blocksHtml}` : blocksHtml;
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
	const indented = blocksHtml.split('\n').map(l => `  ${l}`).join('\n');
	const wrapHtml = `<div style="position:relative;">\n${indented}\n${overlaysMarkup}\n</div>`;
	const styleBlock = `<style>\n${cssRules.join('\n\n')}\n</style>`;
	return styleBlock ? `${styleBlock}\n\n${wrapHtml}` : wrapHtml;
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
	if (el.tagName.toLowerCase() === 'div' && el.classList.length === 0) {
		return el.innerHTML.trim();
	}
	return elementToHtml(el);
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

function _generateBlocksMarkup() {
	const _sink = [];
	const html = state.blocks.map(block => {
		const template = componentTemplates[block.type];

		if (template.isRootWrap) {
			return block.items.map((item, idx) => {
				const el = renderAddColumnWrapElement(template, item, block, idx, false);
				_extractInnerVarStyles(el, '.x', _sink);
				applyItemStyles(el, item, template);
				return _prettyHtml(_elementMarkup(el));
			}).join('\n\n');
		} else if (templateCategories[block.type] === 'list' && block.items[0]?.rows) {
			const item = block.items[0];
			const outer = renderListDynamically(block, item, 0, template.element, false);
			if (outer.hasAttribute('style')) outer.removeAttribute('style');
			applyItemStyles(outer, item, template);
			return _prettyHtml(_elementMarkup(outer));
		} else {
			const outer = buildColumnBlock(template, block, false);
			if (outer.hasAttribute('style')) outer.removeAttribute('style');
			_extractInnerVarStyles(outer, '.x', _sink);
			applyItemStyles(outer, block.items[0] || {}, template);
			return _prettyHtml(_elementMarkup(outer));
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
		const targetWidth = Number(state.canvasWidth) || 1200;
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
	} catch (error) {
		console.error(error);
		showTemplateLoadError(error);
	}

	document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
	document.getElementById('copyMarkup').addEventListener('click', copyMarkup);
	bindFilterEvents();
	KlicBuilderShared.bindSidebarTabs(tab => {
		state.sidebarTab = tab;
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
	initSmartInlinePopup();
	document.getElementById('recommendPanelOpen')?.addEventListener('click', openRecommendationPanel);
	updateRecommendFab();
	document.addEventListener('click', event => {
		if (!event.target.closest('[data-canvas-size-menu]')) {
			document.querySelectorAll('[data-canvas-size-menu].is-open').forEach(menu => menu.classList.remove('is-open'));
		}
	});
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
		if (e.key === 'Escape') closeMarkup();
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
		if (event.target.closest('a')) event.preventDefault();
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
	initFormatToolbar();
	document.getElementById('iconDrawerClose').addEventListener('click', closeIconDrawer);
	document.getElementById('iconDrawerBackdrop').addEventListener('click', closeIconDrawer);
	canvasGrid.style.maxWidth = `${state.canvasWidth}px`;
	document.body.dataset.canvasSize = state.canvasWidth;
	document.body.dataset.previewDevice = 'pc';
	updateDecoStudioAvailability();
	document.getElementById('deviceSwitcher').addEventListener('click', e => {
		const btn = e.target.closest('[data-device]');
		if (btn) setPreviewDevice(btn.dataset.device);
	});
	renderCanvasPanelUI();
	render();
}

window.addEventListener('DOMContentLoaded', init);
