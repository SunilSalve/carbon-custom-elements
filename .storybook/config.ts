/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2020
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import '../src/polyfills';
import { html } from 'lit-html'; // eslint-disable-line import/first
import addons from '@storybook/addons';
import { configure, addDecorator, addParameters, setCustomElements } from '@storybook/web-components'; // eslint-disable-line import/first
import { withKnobs } from '@storybook/addon-knobs';
import './components/focus-trap/focus-trap';
import customElementsMetadata from '../custom-elements.json';
import { CURRENT_THEME } from './addon-carbon-theme/shared';
import theme from './theme';
import containerStyles from './_container.scss'; // eslint-disable-line import/first

setCustomElements(customElementsMetadata);

if (process.env.STORYBOOK_CARBON_CUSTOM_ELEMENTS_USE_RTL === 'true') {
  document.documentElement.setAttribute('dir', 'rtl');
}

addParameters({
  options: {
    theme: theme,
  },
});

// The TS configuration for `@storybook/web-components` does not seem to allow returning `TemplateResult` in decorators,
// using `TemplateResult` in decorators seems to work with `@storybook/web-components` actually
// @ts-ignore
addDecorator(story => {
  const result = story();
  const { hasMainTag } = result as any;
  return html`
    <style>
      ${containerStyles}
    </style>
    <bx-ce-demo-focus-trap href="#main-content" aria-label="Skip to main content">Skip to main content</bx-ce-demo-focus-trap>
    <div
      name="main-content"
      data-floating-menu-container
      role="${hasMainTag ? 'none' : 'main'}"
      class="bx--body bx-ce-demo-devenv--container"
    >
      ${result}
    </div>
    <bx-ce-demo-focus-trap href="#main-content" aria-label="End of content">End of content</bx-ce-demo-focus-trap>
  `;
});

addDecorator(withKnobs);

addDecorator((story, { parameters }) => {
  const { knobs } = parameters;
  if (Object(knobs) === knobs) {
    if (!parameters.props) {
      parameters.props = {};
    }
    Object.keys(knobs).forEach(name => {
      if (typeof knobs[name] === 'function') {
        parameters.props[name] = knobs[name]();
      }
    });
  }
  return story();
});

addons.getChannel().on(CURRENT_THEME, theme => {
  document.documentElement.setAttribute('storybook-carbon-theme', theme);
});

const req = require.context('../src/components', true, /\-story\.[jt]s$/);
configure(req, module);

if (module.hot) {
  module.hot.accept(req.id, () => {
    const currentLocationHref = window.location.href;
    window.history.pushState(null, '', currentLocationHref);
    window.location.reload();
  });
}
