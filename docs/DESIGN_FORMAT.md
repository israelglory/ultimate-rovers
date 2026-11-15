# Reading the design files

The files in `design/` are the exact source of every page in the design canvas. They are close to plain HTML with a small template layer. Treat them as the visual and structural reference, not as code to copy into production.

## Anatomy of a file

```html
<x-dc>                         <!-- the page template -->
  <helmet> ... </helmet>       <!-- font links and a few global styles -->
  <div style="..."> ... </div> <!-- the page markup, inline styles everywhere -->
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{...}'>
class Component extends DCLogic {
  renderVals() { return { ... }; }   // data and handlers the template reads
}
</script>
```

## Template syntax

| Syntax | Meaning | In production |
| --- | --- | --- |
| `{{ path }}` | Value from `renderVals()` (dotted lookup) | A prop or CMS field |
| `<sc-for list="{{items}}" as="item">` | Repeat the inner markup per item | `items.map(...)` |
| `<sc-if value="{{flag}}">` | Render only when truthy | Conditional render |
| `onClick="{{fn}}"` | Click handler from `renderVals()` | Client component handler, or a link with a URL param |
| `this.state` / `this.setState` | Local UI state (selected tab, filter, accordion) | Usually URL search params, see DESIGN_SPEC.md |
| `data-props` | Design tweaks. Only `MatchCentre` has one: `status` = Upcoming, Live or Full time | The match `status` field in the CMS |
| `hint-placeholder-*` | Editor hints only | Ignore |
| `href="Squad.dc.html"` | Prototype link between pages | The real route, see the route table in DESIGN_SPEC.md |

## Where the data lives

Lists of players, fixtures, news and staff are inside `renderVals()` at the bottom of each file. That data is placeholder only. The real shape belongs in the CMS schema described in DESIGN_SPEC.md.

## Placeholders

Text in square brackets, such as `[Opponent FC]`, `[DD Month YYYY]` or `X : X`, is placeholder content. Never hardcode it. It marks where CMS data goes.

## Styling

All styling is inline so every value is explicit. Pull colours, fonts, sizes and radii from `tokens/` rather than copying hex values from markup. Inline values in the files always match the tokens.

## Previewing

`preview/` holds the same pages wired to a tiny renderer (`dc-preview.js`) so they open in any browser with working tabs, filters and links. Serve the package root with any static server (for example `npx serve .`) and open `/preview/`. Opening the files straight from disk also works in most browsers. Append `?status=Live` or `?status=Upcoming` to `MatchCentre.dc.html` to see the other match states.
