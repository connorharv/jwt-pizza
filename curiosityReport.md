# Playwright

## Introduction
From their website, they claim that "Playwright Test is an end-to-end test framework for modern web apps. 
It bundles test runner, assertions, isolation, parallelization and rich tooling. Playwright supports Chromium, 
WebKit and Firefox on Windows, Linux and macOS, locally or in CI, headless or headed, 
with native mobile emulation for Chrome (Android) and Mobile Safari."

It is built for testing by leveraging:
- Auto-wait and web-first assertions
- Test isolation
- Resilient locators
- Parallelism and sharding

## Why write about Playwright?
As a software engineer for the Church's Temple division, they use tons of industry standard technologies.
One of those--unfortunately--I didn't get to use was Playwright. I wrote tons of unit tests in Jest which
proved to be extremely useful to check that my code didn't break anything.

While I wrote unit tests, the QAs wrote full smoke tests and end-to-end tests. When I first started working
there, they used Cypress as their testing framework but after some persuasions from some high-level QAs
they decided to switch to Playwright. I wasn't sure what it did (besides testing) but they loved it. 

From my perspective, I just saw it as something that was run on the pipeline that would usually fail
with my changes. It would take ~10 minutes to run on the development lane, and around 45 minutes on the stage
lane. On slower days I would go through the pipeline results and examine what I did that broke, although
I never got super far because I didn't have access to the website where their playwright data and .mp4's 
were located, I could only see the output from hundreds of tests and what passed/failed. 

I was always curious what it did and even talked to some QAs about it but never took the time to delve
into at as that was their responsibility. Luckily this class gave me a fantastic opportunity dive head first
into Playwright and see how it works.

## The Basic Implementation
Writing a test is pretty easy.
1. Create an async test function passing in a page prop
2. Call async methods on page (`goto`, `getByRole`, `getByLabel`, `GetByPlaceholder`, `getByTestId`, `click`)
3. Assert some behavior.

With the addition of UI tools, the entire process can be automated by having Playwright open a dedicated
browser--Playwright Inspector--that can log your clicks, show locators, and assert visibility, text, value,
and snapshots of the website.

This allows you to write tests extremely fast, like this one that took around a minute. It checks the heading
to contain the correct values, take a snapshot to match what the logged out user should see, and attempts
to log in with an invalid account, asserting that it fails.

```js
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await page.getByRole('link', { name: 'Login' }).click();
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`
    - heading "Welcome back" [level=2]
    - text: Email address
    - textbox "Email address"
    - img
    - text: Password
    - textbox "Password"
    - button:
      - img
    - img
    - button "Login"
    - text: Are you new? Register instead.
    `);
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('fake@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('fake');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('main')).toContainText('{"code":500,"message":"Failed to fetch"}');
});
```

I didn't write any code, it simply generated that through the dedicated inspector browser by logging my clicks
and adding `expect` when I wanted it to assert some information. In this case, that was asserting certain text,
visibility of a link, and the `<main>` to match a snapshot Playwright took.

## But How Does This Actually Work?
That's all fine and dandy that I can create tests extremely fast that assert user behavior on a website.
It can run hundreds of tests much faster than I ever could individually, and it is deterministic. 

But really under the hood, what is it really doing? What makes it so simple?
What is Playwright really doing with all of those `page` functions?

Playwright is open-source, and the beauty of that means you can read all of it! With 18,054 commits, 184
branches, 166 releases, 805 contributors, 6500 forks, and almost 100,000 stars, it is a massive project
with no shortage of support.

By cloning the repository and adding it as a package to my IntelliJ configuration, I can route all playwright tests
to go through the repo, allowing me super easy access to debug it and step through each file.

### Tracing an example assertion
I placed the test listed above in `tests/curiosity.spec.ts`, and using the `DEBUG=pw:api` env variable, it
prints all debug and process statements. Here is what is printed for the test.
```html
  pw:api => browserType.launch started +0ms
  pw:api <= browserType.launch succeeded +58ms
  pw:api => browser.newContext started +4ms
  pw:api <= browser.newContext succeeded +6ms
  pw:api => browserContext.newPage started +3ms
  pw:api <= browserContext.newPage succeeded +48ms
  pw:api => page.goto started +2ms
  pw:api navigating to "http://localhost:5173/", waiting until "load" +0ms
  pw:api   "commit" event fired +11ms
  pw:api   navigated to "http://localhost:5173/" +1ms
  pw:api   "domcontentloaded" event fired +494ms
  pw:api   "load" event fired +1ms
  pw:api <= page.goto succeeded +1ms
  pw:api => Expect "toContainText" started +52ms
  pw:api Expect "toContainText" getByRole('heading') +0ms
  pw:api waiting for getByRole('heading') +1ms
  pw:api   navigated to "http://localhost:5173/" +2ms
  pw:api <= Expect "toContainText" succeeded +42ms
  pw:api => Expect "toBeVisible" started +3ms
  pw:api Expect "toBeVisible" getByRole('link', { name: 'Login' }) +1ms
  pw:api waiting for getByRole('link', { name: 'Login' }) +0ms
  pw:api <= Expect "toBeVisible" succeeded +4ms
  pw:api => locator.click started +1ms
  pw:api waiting for getByRole('link', { name: 'Login' }) +1ms
  pw:api   locator resolved to <a href="/login" class="font-medium text-gray-400  focus:text-orange-600">Login</a> +3ms
  pw:api attempting click action +1ms
  pw:api   waiting for element to be visible, enabled and stable +0ms
  pw:api   element is visible, enabled and stable +21ms
  pw:api   scrolling into view if needed +0ms
  pw:api   done scrolling +1ms
  pw:api   performing click action +4ms
  pw:api   navigated to "http://localhost:5173/login" +4ms
  pw:api   click action done +11ms
  pw:api   waiting for scheduled navigations to finish +0ms
  pw:api   navigations have finished +1ms
  pw:api <= locator.click succeeded +0ms
  pw:api => Expect "toMatchAriaSnapshot" started +2ms
  pw:api Expect "toMatchAriaSnapshot" getByRole('main') +1ms
  pw:api waiting for getByRole('main') +6ms
  pw:api <= Expect "toMatchAriaSnapshot" succeeded +7ms
  pw:api => locator.click started +1ms
  pw:api waiting for getByRole('textbox', { name: 'Email address' }) +0ms
  pw:api   locator resolved to <input value="" id="email" required="" type="email" autocomplete="email" placeholder="Email address" class="py-3 ps-11 pe-4 block w-full bg-white/10 border-white/20 text-white placeholder:text-white rounded-lg text-sm focus:border-white/30 focus:ring-white/30 sm:p-4 sm:ps-11"/> +3ms
  pw:api attempting click action +0ms
  pw:api   waiting for element to be visible, enabled and stable +0ms
  pw:api   element is visible, enabled and stable +8ms
  pw:api   scrolling into view if needed +0ms
  pw:api   done scrolling +0ms
  pw:api   performing click action +2ms
  pw:api   click action done +3ms
  pw:api   waiting for scheduled navigations to finish +0ms
  pw:api   navigations have finished +0ms
  pw:api <= locator.click succeeded +0ms
  pw:api => locator.fill started +1ms
  pw:api waiting for getByRole('textbox', { name: 'Email address' }) +1ms
  pw:api   locator resolved to <input value="" id="email" required="" type="email" autocomplete="email" placeholder="Email address" class="py-3 ps-11 pe-4 block w-full bg-white/10 border-white/20 text-white placeholder:text-white rounded-lg text-sm focus:border-white/30 focus:ring-white/30 sm:p-4 sm:ps-11"/> +1ms
  pw:api   fill("fake@jwt.com") +1ms
  pw:api attempting fill action +0ms
  pw:api   waiting for element to be visible, enabled and editable +1ms
  pw:api <= locator.fill succeeded +4ms
  pw:api => locator.press started +1ms
  pw:api waiting for getByRole('textbox', { name: 'Email address' }) +0ms
  pw:api   locator resolved to <input id="email" required="" type="email" autocomplete="email" value="fake@jwt.com" placeholder="Email address" class="py-3 ps-11 pe-4 block w-full bg-white/10 border-white/20 text-white placeholder:text-white rounded-lg text-sm focus:border-white/30 focus:ring-white/30 sm:p-4 sm:ps-11"/> +3ms
  pw:api elementHandle.press("Tab") +1ms
  pw:api <= locator.press succeeded +4ms
  pw:api => locator.fill started +1ms
  pw:api waiting for getByRole('textbox', { name: 'Password' }) +0ms
  pw:api   locator resolved to <input value="" required="" id="password" type="password" placeholder="Password" autocomplete="current-password" class="py-3 ps-11 pe-4 block w-full bg-white/10 border-white/20 text-white placeholder:text-white rounded-lg text-sm focus:border-white/30 focus:ring-white/30 sm:p-4 sm:ps-11"/> +2ms
  pw:api   fill("fake") +1ms
  pw:api attempting fill action +0ms
  pw:api   waiting for element to be visible, enabled and editable +0ms
  pw:api <= locator.fill succeeded +3ms
  pw:api => locator.click started +1ms
  pw:api waiting for getByRole('button', { name: 'Login' }) +0ms
  pw:api   locator resolved to <button type="submit" class="w-32 m-4 py-3 px-4 text-sm font-semibold rounded-lg border border-transparent bg-orange-800 text-white hover:bg-orange-600 undefined">Login</button> +2ms
  pw:api attempting click action +2ms
  pw:api   waiting for element to be visible, enabled and stable +0ms
  pw:api   element is visible, enabled and stable +32ms
  pw:api   scrolling into view if needed +0ms
  pw:api   done scrolling +0ms
  pw:api   performing click action +2ms
  pw:api   click action done +4ms
  pw:api   waiting for scheduled navigations to finish +0ms
  pw:api   navigations have finished +0ms
  pw:api <= locator.click succeeded +1ms
  pw:api => Expect "toContainText" started +1ms
  pw:api Expect "toContainText" getByRole('main') +0ms
  pw:api waiting for getByRole('main') +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +6ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +26ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +62ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +108ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +109ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +511ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +511ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +508ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +512ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +510ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +510ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +1ms
  pw:api   locator resolved to <main class="size-full">…</main> +510ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +511ms
  pw:api   unexpected value "Welcome backEmail addressPasswordLoginAre you new? Register instead." +0ms
  pw:api   locator resolved to <main class="size-full">…</main> +509ms
  pw:api <= Expect "toContainText" succeeded +0ms
  pw:api => browserContext.close started +5ms
  pw:api <= browserContext.close succeeded +4ms
  pw:api => browser.close started +11ms
  pw:api <= browser.close succeeded +39ms
  1 passed (8.4s)
```

Let's dissect this one bit at a time!

But first! 
Below is a useful map of where each piece runs. Every call in the test goes down through these layers, and
the result comes back up the same way:

```text
 Test file (Node)            curiosity.spec.ts: page.goto(), getByRole(), expect()
        │
 Client (Node)               playwright-core/src/client/   page.ts, frame.ts, locator.ts
        │  JSON message: { guid, method, params }
 Dispatcher (Node)           playwright-core/src/server/dispatchers/   frameDispatcher.ts
        │
 Server (Node)               playwright-core/src/server/   frames.ts, dom.ts, chromium/crPage.ts
        │  Chrome DevTools Protocol (CDP)
 Browser (Chromium)          packages/injected/src/   injectedScript.ts, roleUtils.ts, ariaSnapshot.ts
```

#### goto

`page.ts` is `playwright-core/src/client/page.ts`. Makes sense.
It calls the `Frame.goto` method, where `Frame` is a child of `ChannelOwner` and implements the `Frame` interface.
The documentation states that "At every point of time, page exposes its current frame tree via the 
page.mainFrame() and frame.childFrames() methods".

From there, the `Frame.goto()` method uses a `verifyLoadState` method which checks that the
`waitUntil` option is set to `load` (load|domcontentloaded|networkidle|commit). 
The client then sends a `goto` call through its channel (the ChannelOwner's
connection to the server).

Since Playwright works in multiple languages, the client side is actually fairly simple to avoid 
code duplication. Most of the actual logic is done on the server side, shown below. This is true for
all functions of Playwright.

`frameDispatcher.ts` receives the `goto` call and passes it to
`server/frames.ts`, where `gotoImpl` calls `this._page.delegate.navigateFrame(...)`. For Chromium, the
delegate is `crPage.ts`, which sends `Page.navigate` to the browser over the Chrome DevTools Protocol (CDP),
the same command DevTools itself uses. The server then waits until the browser fires the `load` event.
This event means that all resources (images, scripts, CSS, etc.) have been loaded in.
Only then does the response go back to the client and `page.goto()` resolves.

#### getByRole

Same thing: page.ts → mainFrame().getByRole().
This time, the frame returns a `Locator` built from a single selector string. For `page.getByRole('heading')`
there is only a role, no options.

`getByRoleSelector` in `locatorUtils.ts` builds that string. With no options it is just
`internal:role=heading`. Options become attribute filters, so `getByRole('link', { name: 'Login' })`
becomes `internal:role=link[name="Login"i]`. Pretty nifty.

The important part: `getByRole` sends nothing to the browser. It only builds a string. The element is
looked up later, every time an action or assertion uses the locator. This means if the node changes between
renders (for whatever reason), the locator still works.

The `toContainText` method from `matchers.ts` serializes the expected text values and passes that
to the `Locator._expect` function with the expression 'to.have.text' and passing in options as a 
`FrameExpectParams` with the expectedText and title. There are other parameters passed in but for this
expect they aren't important.

`Locator._expect` adds its selector string and calls the client `Frame._expect`, which calls
`this._channel.expect` inside `_wrapApiCall`. The `_channel` is a JavaScript `Proxy`
(from `channelOwner.ts`) where any protocol method name turns into a function that validates the 
params and calls `connection.sendMessageToServer`, which builds a JSON message like 
`{ guid, method: 'expect', params }`. From here `inprocess.ts` hands that message to the
server's `DispatcherConnection.dispatch`, which finds 
the `FrameDispatcher` by `guid` and calls its `expect` method by name.

`frameDispatcher:expect` passes the call to the server's `Frame.expect` in `server/frames.ts`. From
here, it does one check right away, and if that fails it retries in a loop
(`retryWithProgressAndBackoff`) until the check passes or the timeout runs out. Each check goes through
`FrameSelectors:callOnSelectorInternal`.

This is where it gets really cool!

Nothing is actually checked by Node itself. Instead, the check runs inside Chromium via an injected
script!

Playwright uses the `InjectedScript` class (`packages/injected/src/injectedScript.ts`) 
into the page once per frame. Then, for each check, `callOnSelectorInternal` runs a small function 
in the page that:
1. calls `injected.querySelectorAll` with the role engine to find the HTML class (in this case, it is an `<h2>`),
2. throws a strict-mode error if more than one element matches,
3. runs the callback below, which `frameSelectors.ts` turned into text with `String(pageFunction)` so it could be sent to the browser.

Below is the actual callback or injected script that is run on Chromium. 
This is from `frames.ts:_expectInternal`.
```js
async ({ injected, elements, frameVisible }, options2) => {
  const isArray2 = options2.expression === "to.have.count" || options2.expression.endsWith(".array");
  const log2 = isArray2 ? `  locator resolved to ${elements.length} element${elements.length === 1 ? "" : "s"}` : `  locator resolved to ${injected.previewNode(elements[0])}`;
  return { log: log2, ...await injected.expect(elements[0], options2, elements, frameVisible) };
}
```
The function runs in Chromium and is eventually sent back as a resolved Promise.
Its return value is serialized and sent back to Node. This value goes back to `frames.ts:_expectInternal`,
and it holds a lot of useful information. For this expect, it is `resolved.result`:
```JSON
{
    "log": "  locator resolved to <h2 class=\"my-1 sm:my-3 text-4xl font-thin sm:text-6xl\">…</h2>",
    "matches": true,
    "received": {
        "value": "The web's best pizza"
    }
}
```

The `matches` boolean is then sent back up the chain (server, dispatcher, client, matcher), in turn
setting the expect to true and passing the assertion! If `matches` had been `false`, the server would
wait a little and run the check in the browser again, until it passed or the timeout ran out.

#### Where the text is actually compared

So where do `received` and `matches` in that JSON come from? 

Inside the browser, `injected.expect`
calls `expectSingleElement` in `injectedScript.ts`. For the `'to.have.text'` expression, it reads the
element's text straight from the live DOM:

```ts
} else if (expression === 'to.have.text') {
  received = options.useInnerText ? (element as HTMLElement).innerText : elementText(new Map(), element).full;
}
...
const matcher = new ExpectedTextMatcher(options.expectedText[0]);
return { received, matches: matcher.matches(received) };
```

`ExpectedTextMatcher.matches` then normalizes the whitespace in both strings, and since `toContainText`
set `matchSubstring: true`, it does:

```ts
if (this._substring !== undefined)
  return text.includes(this._substring);
```

That is the whole comparison!

#### click

`.click()` follows the same path down to the server, but ends in `server/dom.ts` instead of an
`expect`. The `pw:api` log lines for a click come straight from `_performPointerAction` in `dom.ts`:

1. **"waiting for element to be visible, enabled and stable"**: the injected script checks the element.
2. **"scrolling into view if needed"**: the server scrolls the element on screen.
3. The server works out a point inside the element to click and then checks that the element is the
   thing actually at that point.
4. **"performing click action"**: `page.mouse.click(x, y)` sends real mouse events to Chromium.

#### toMatchAriaSnapshot

`toMatchAriaSnapshot` follows the same `expect` path using the expression `'to.match.aria'`. The difference
is in the two ends:

- On the server, `Frame.expect` first parses the YAML template from the test into a tree.
- In the browser, `matchesExpectAriaTemplate` (`packages/injected/src/ariaSnapshot.ts`) builds the
  accessibility tree using the same role and accessible-name logic as `getByRole`
  (`roleUtils.ts`), and compares it to the template.

So `getByRole`, `toMatchAriaSnapshot`, and the snapshot that codegen generated all rely on the same
accessibility code in `roleUtils.ts`.

## Modern day Magic

Looking behind the scenes, it is far from simple. However, that is the beauty of it, because of the 
sheer amount of checks that happen on both the server and browser, it is extremely strong and there's no
wonder why it's the flagship resource for browser testing. It combines both ease of access for anyone to write
high-quality tests and an incredibly structured backend that is practically certain to be deterministic, despite
the uncertainty of the internet with sending/receiving packets and DOM rerendering.