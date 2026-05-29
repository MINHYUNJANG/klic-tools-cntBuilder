(function () {
	const shared = window.KlicBuilderShared;
	const markupToggle = document.getElementById('markupToggle');
	const markupOutput = document.getElementById('markupOutput');
	const copyState = document.getElementById('copyState');
	const previewToggle = document.getElementById('previewToggle');

	function updateMarkup() {
		if (!markupOutput) return;
		markupOutput.value = '<!-- 디자인 블록을 추가하면 마크업이 생성됩니다. -->';
	}

	function togglePreview() {
		const isPreview = document.body.classList.toggle('preview-mode');
		previewToggle?.setAttribute('aria-pressed', String(isPreview));
		if (previewToggle) {
			previewToggle.innerHTML = isPreview
				? '<i class="ri-edit-line" aria-hidden="true"></i> 편집하기'
				: '<i class="ri-eye-line" aria-hidden="true"></i> 미리보기';
		}
	}

	function init() {
		shared.bindSidebarTabs();
		shared.bindFilterEvents();
		shared.bindScrollableFilters();
		updateMarkup();

		markupToggle?.addEventListener('click', () => shared.toggleMarkupPanel(markupToggle));
		document.getElementById('markupClose')?.addEventListener('click', () => shared.closeMarkup(markupToggle));
		document.getElementById('markupBackdrop')?.addEventListener('click', () => shared.closeMarkup(markupToggle));
		document.getElementById('copyMarkup')?.addEventListener('click', () => {
			copyState.textContent = '';
			shared.copyText(markupOutput?.value || '', () => {
				copyState.textContent = '마크업을 클립보드에 복사했습니다.';
				window.setTimeout(() => { copyState.textContent = ''; }, 2200);
			});
		});
		previewToggle?.addEventListener('click', togglePreview);
		document.getElementById('previewReturn')?.addEventListener('click', () => {
			if (document.body.classList.contains('preview-mode')) togglePreview();
		});
		document.addEventListener('keydown', event => {
			if (event.key === 'Escape') shared.closeMarkup(markupToggle);
		});
	}

	window.addEventListener('DOMContentLoaded', init);
})();
