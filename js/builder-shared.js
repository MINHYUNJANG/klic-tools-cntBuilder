(function () {
	function closestElement(target, selector) {
		const element = target?.nodeType === 1 ? target : target?.parentElement;
		return element?.closest(selector) || null;
	}

	function switchSidebarTab(tab) {
		document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
			btn.classList.toggle('is-active', btn.dataset.sidebarTab === tab);
		});
		document.querySelectorAll('[data-sidebar-panel]').forEach(panel => {
			panel.classList.toggle('is-hidden', panel.dataset.sidebarPanel !== tab);
		});
		document.getElementById('panelTemplates')?.classList.toggle('is-hidden', tab !== 'templates');
		document.getElementById('panelBlocks')?.classList.toggle('is-hidden', tab !== 'blocks');
		document.getElementById('panelCustom')?.classList.toggle('is-hidden', tab !== 'custom');
	}

	function bindSidebarTabs(onChange) {
		document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
			if (btn.dataset.sidebarTabBound === 'true') return;
			btn.dataset.sidebarTabBound = 'true';
			btn.addEventListener('click', () => {
				switchSidebarTab(btn.dataset.sidebarTab);
				if (onChange) onChange(btn.dataset.sidebarTab, btn);
			});
		});
	}

	function bindFilterEvents({
		container = document,
		onTemplateFilter,
		onBlockFilter,
		onDesignTemplateFilter,
		onDecoFilter
	} = {}) {
		const activate = btn => {
			if (!btn) return;
			if (btn.dataset.templateFilter) {
				container.querySelectorAll('[data-template-filter]').forEach(item => {
					item.classList.toggle('is-active', item === btn);
				});
				const handler = onBlockFilter || onTemplateFilter;
				if (handler) handler(btn.dataset.templateFilter, btn);
			}
			if (btn.dataset.designTemplateFilter) {
				container.querySelectorAll('[data-design-template-filter]').forEach(item => {
					item.classList.toggle('is-active', item === btn);
				});
				const handler = onDesignTemplateFilter || onTemplateFilter;
				if (handler) handler(btn.dataset.designTemplateFilter, btn);
			}
			if (btn.dataset.decoFilter) {
				container.querySelectorAll('[data-deco-filter]').forEach(item => {
					item.classList.toggle('is-active', item === btn);
				});
				if (onDecoFilter) onDecoFilter(btn.dataset.decoFilter, btn);
			}
		};

		container.querySelectorAll('.component-filters, .deco-filters, .design-template-filters').forEach(filterBar => {
			if (filterBar.dataset.filterBarBound === 'true') return;
			filterBar.dataset.filterBarBound = 'true';
			let pressButton = null;
			let startX = 0;
			let startY = 0;
			let moved = false;
			let suppressClick = false;

			filterBar.addEventListener('pointerdown', event => {
				if (event.button !== 0) return;
				pressButton = closestElement(event.target, '[data-template-filter], [data-deco-filter], [data-design-template-filter]');
				if (!pressButton || !filterBar.contains(pressButton)) {
					pressButton = null;
					return;
				}
				startX = event.clientX;
				startY = event.clientY;
				moved = false;
			});
			filterBar.addEventListener('pointermove', event => {
				if (!pressButton || moved) return;
				moved = Math.abs(event.clientX - startX) > 5 || Math.abs(event.clientY - startY) > 5;
			});
			filterBar.addEventListener('pointerup', event => {
				if (!pressButton) return;
				const target = pressButton;
				pressButton = null;
				if (moved || !filterBar.contains(closestElement(event.target, '[data-template-filter], [data-deco-filter], [data-design-template-filter]') || target)) return;
				suppressClick = true;
				activate(target);
			});
			filterBar.addEventListener('pointercancel', () => {
				pressButton = null;
				moved = false;
			});
			filterBar.addEventListener('click', event => {
				const btn = closestElement(event.target, '[data-template-filter], [data-deco-filter], [data-design-template-filter]');
				if (!btn || !filterBar.contains(btn)) return;
				event.preventDefault();
				if (suppressClick) {
					suppressClick = false;
					return;
				}
				activate(btn);
			});
		});

		container.querySelectorAll('[data-template-filter], [data-deco-filter], [data-design-template-filter]').forEach(btn => {
			if (btn.closest('.component-filters, .deco-filters, .design-template-filters')) return;
			if (btn.dataset.filterButtonBound === 'true') return;
			btn.dataset.filterButtonBound = 'true';
			btn.addEventListener('click', event => {
				event.preventDefault();
				activate(btn);
			});
		});
	}

	function bindScrollableFilters(container = document) {
		container.querySelectorAll('.filter-scroll-shell').forEach(shell => {
			const scroller = shell.querySelector('.component-filters, .deco-filters, .design-template-filters');
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

			scroller.addEventListener('pointerdown', event => {
				if (event.button !== 0) return;
				dragging = true;
				didDrag = false;
				startX = event.clientX;
				startLeft = scroller.scrollLeft;
				scroller.setPointerCapture?.(event.pointerId);
			});
			scroller.addEventListener('pointermove', event => {
				if (!dragging) return;
				const delta = event.clientX - startX;
				if (!didDrag && Math.abs(delta) < 5) return;
				didDrag = true;
				scroller.classList.add('is-dragging');
				event.preventDefault();
				scroller.scrollLeft = startLeft - delta;
			});
			const stopDrag = event => {
				if (!dragging) return;
				dragging = false;
				scroller.classList.remove('is-dragging');
				scroller.releasePointerCapture?.(event.pointerId);
			};
			scroller.addEventListener('click', event => {
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

	function bindComponentItems({
		container = document,
		canvasGrid = document.getElementById('canvasGrid'),
		getDragPayload,
		onAdd,
		onDragStart,
		onDragEnd
	} = {}) {
		container.querySelectorAll('.component-item').forEach(item => {
			if (item.dataset.componentSharedBound === 'true') return;
			item.dataset.componentSharedBound = 'true';
			const addItem = event => {
				if (closestElement(event?.target, 'button') && event.type === 'dblclick') return;
				event?.preventDefault();
				if (onAdd) onAdd(item, event);
			};
			item.addEventListener('dragstart', event => {
				const payload = getDragPayload ? getDragPayload(item, event) : `new-block:${item.dataset.type}`;
				if (!payload) return;
				event.dataTransfer.setData('text/plain', payload);
				event.dataTransfer.effectAllowed = payload.startsWith('existing') ? 'move' : 'copy';
				if (onDragStart) onDragStart(item, event, payload);
			});
			item.addEventListener('dragend', event => {
				canvasGrid?.classList.remove('is-over');
				if (onDragEnd) onDragEnd(item, event);
			});
			item.addEventListener('dblclick', addItem);
			item.querySelector('.component-add-btn')?.addEventListener('click', event => {
				event.stopPropagation();
				addItem(event);
			});
		});
	}

	function bindCanvasDropTargets({ canvasGrid, canvasWrapper, onDragOver, onDrop }) {
		[canvasGrid, canvasWrapper].filter(Boolean).forEach(target => {
			if (target.dataset.canvasDropBound === 'true') return;
			target.dataset.canvasDropBound = 'true';
			target.addEventListener('dragover', onDragOver);
			target.addEventListener('drop', onDrop);
		});
	}

	function openMarkup(markupToggle) {
		document.body.classList.add('markup-open');
		markupToggle?.setAttribute('aria-expanded', 'true');
	}

	function closeMarkup(markupToggle) {
		document.body.classList.remove('markup-open');
		markupToggle?.setAttribute('aria-expanded', 'false');
	}

	function toggleMarkupPanel(markupToggle) {
		document.body.classList.contains('markup-open') ? closeMarkup(markupToggle) : openMarkup(markupToggle);
	}

	function copyText(text, onSuccess) {
		const fallback = () => {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.focus();
			textarea.select();
			document.execCommand('copy');
			textarea.remove();
			if (onSuccess) onSuccess();
		};
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(text).then(() => onSuccess && onSuccess()).catch(fallback);
			return;
		}
		fallback();
	}

	window.KlicBuilderShared = {
		switchSidebarTab,
		bindSidebarTabs,
		bindFilterEvents,
		bindScrollableFilters,
		bindComponentItems,
		bindCanvasDropTargets,
		openMarkup,
		closeMarkup,
		toggleMarkupPanel,
		copyText
	};
})();
