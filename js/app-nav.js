// 공통 네비게이션 렌더링 — 현재 페이지 파일명으로 is-active 자동 설정
(function () {
	const NAV_ITEMS = [
		{ href: '/goal/',     icon: 'ri-focus-3-line',      label: '교육목표 빌더' },
		{ href: '/organ/',    icon: 'ri-organization-chart', label: '조직도 빌더' },
		{ href: '/map/',      icon: 'ri-map-pin-2-line',     label: '오시는 길 빌더' },
		{ href: '/contents/', icon: 'ri-layout-column-line', label: '콘텐츠 빌더' },
	];

	const pathname = window.location.pathname;

	const items = NAV_ITEMS.map(({ href, icon, label }) => {
		const active = href !== '#' && pathname.startsWith(href);
		return `<a class="app-nav-item${active ? ' is-active' : ''}" href="${href}"${active ? ' aria-current="page"' : ''}>
			<i class="${icon}" aria-hidden="true"></i>
			<span>${label}</span>
		</a>`;
	}).join('');

	const nav = document.getElementById('appNav');
	if (!nav) return;
	nav.innerHTML = `
		<a class="app-nav-logo" href="/" aria-label="KLIC Tools 홈">
			<span class="app-nav-logo-mark" aria-hidden="true"></span>
			<span class="app-nav-logo-bar" aria-hidden="true"></span>
			<span class="app-nav-logo-title">KLIC TOOLs</span>
		</a>
		${items}`;
})();
