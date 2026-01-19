<script lang="ts">
	import { onMount } from 'svelte';
	import type { PromptChart } from 'prompt-chart';

	let prompt = 'Show monthly sales by region as a bar chart';
	let isGenerating = false;
	let chartElement: PromptChart | null = null;

	const EXAMPLE_PROMPTS = [
		'Monthly sales by region',
		'User signups trend this year',
		'Product revenue as a pie chart',
		'Orders by status',
		'Top 5 products by profit'
	];

	onMount(async () => {
		await import('prompt-chart');
    isLoaded = true;
	});

	function handleGenerate(): void {
		if (!prompt.trim() || !chartElement) return;
		isGenerating = true;
		chartElement.prompt = prompt;
		chartElement.fetchChart();
	}

	function handleKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Enter') {
			handleGenerate();
		}
	}

	function handleExampleClick(examplePrompt: string): void {
		prompt = examplePrompt;
		if (!chartElement) return;
		isGenerating = true;
		chartElement.prompt = examplePrompt;
		chartElement.fetchChart();
	}

	function handleChartLoaded(): void {
		isGenerating = false;
	}

	function handleChartError(): void {
		isGenerating = false;
	}
  let isLoaded = false;
</script>

<div class="app">
  {#if isLoaded}
	<header class="header">
		<h1>PromptChart</h1>
		<p class="subtitle">Turn natural language into charts</p>
	</header>

	<section class="input-section">
		<div class="input-group">
			<input
				type="text"
				bind:value={prompt}
				on:keydown={handleKeyDown}
				placeholder="Describe the chart you want to see..."
				class="prompt-input"
			/>
			<button
				on:click={handleGenerate}
				disabled={isGenerating || !prompt.trim()}
				class="generate-button"
			>
				{isGenerating ? 'Generating...' : 'Generate Chart'}
			</button>
		</div>

		<div class="examples">
			<span class="examples-label">Try these examples:</span>
			<div class="example-prompts">
				{#each EXAMPLE_PROMPTS as example}
					<button class="example-prompt" on:click={() => handleExampleClick(example)}>
						{example}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<section class="chart-section">
		<prompt-chart
			bind:this={chartElement}
			connect={{ url: '/api/chart' }}
			on:chart-loaded={handleChartLoaded}
			on:chart-error={handleChartError}
		></prompt-chart>
	</section>
  {/if}
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: #f9fafb;
	}

	.app {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
		max-width: 1200px;
		margin: 0 auto;
		padding: 40px 20px;
		min-height: 100vh;
	}

	.header {
		margin-bottom: 32px;
	}

	.header h1 {
		color: #111827;
		margin: 0 0 8px 0;
		font-size: 2rem;
	}

	.subtitle {
		color: #6b7280;
		margin: 0;
		font-size: 1rem;
	}

	.input-section {
		background: white;
		padding: 24px;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 24px;
	}

	.input-group {
		display: flex;
		gap: 12px;
	}

	.prompt-input {
		flex: 1;
		padding: 12px 16px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 16px;
		outline: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.prompt-input:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.generate-button {
		padding: 12px 24px;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		cursor: pointer;
		transition: background 0.2s;
		white-space: nowrap;
	}

	.generate-button:hover:not(:disabled) {
		background: #2563eb;
	}

	.generate-button:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.examples {
		margin-top: 16px;
	}

	.examples-label {
		font-size: 14px;
		color: #6b7280;
		margin-right: 12px;
	}

	.example-prompts {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.example-prompt {
		padding: 6px 12px;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 13px;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s;
	}

	.example-prompt:hover {
		background: #e5e7eb;
		border-color: #d1d5db;
	}

	.chart-section {
		background: white;
		padding: 24px;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	:global(prompt-chart) {
		height: 400px;
		display: block;
	}

	@media (max-width: 640px) {
		.input-group {
			flex-direction: column;
		}

		.generate-button {
			width: 100%;
		}
	}
</style>
