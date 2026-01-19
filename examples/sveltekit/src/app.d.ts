/// <reference types="@sveltejs/kit" />

declare namespace svelteHTML {
	interface IntrinsicElements {
		'prompt-chart': Record<string, unknown>;
	}
}

declare global {
	namespace App {}
}

export {};
