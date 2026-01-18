import {PromptChart as PromptChartCore} from 'prompt-chart';
import {createComponent} from '@lit/react';
import * as React from 'react';

export const PromptChart = createComponent({
  tagName: 'prompt-chart',
  elementClass: PromptChartCore,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
});
